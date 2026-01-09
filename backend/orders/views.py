from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer


class OrderViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.all().prefetch_related("items")

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        return queryset.none()

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        read_serializer = OrderSerializer(order, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
