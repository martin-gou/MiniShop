from decimal import Decimal

from django.db import connection, transaction
from rest_framework import serializers

from catalog.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "unit_price", "quantity", "line_total"]

    def get_line_total(self, obj):
        return obj.line_total


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "shipping_name",
            "shipping_phone",
            "shipping_address",
            "created_at",
            "items",
        ]
        read_only_fields = ["status", "total_amount", "created_at"]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ["shipping_name", "shipping_phone", "shipping_address", "items"]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("订单必须包含至少一个商品。")
        return value

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        items_data = validated_data.pop("items")

        order = Order.objects.create(user=user, **validated_data)

        total = Decimal("0.00")
        for item in items_data:
            product_id = item["product_id"]
            quantity = item["quantity"]
            queryset = Product.objects
            if connection.features.has_select_for_update:
                queryset = queryset.select_for_update()
            try:
                product = queryset.get(id=product_id, is_active=True)
            except Product.DoesNotExist as exc:
                raise serializers.ValidationError(
                    {"items": f"商品不存在或已下架（ID: {product_id}）。"}
                ) from exc

            if product.stock < quantity:
                raise serializers.ValidationError(
                    {"items": f"商品 {product.name} 库存不足（剩余 {product.stock} 件）。"}
                )

            product.stock -= quantity
            product.save(update_fields=["stock"])

            line_total = product.price * quantity
            total += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
            )

        order.total_amount = total
        order.save(update_fields=["total_amount"])
        return order
