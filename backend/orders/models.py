from django.conf import settings
from django.db import models

from catalog.models import Product


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_SHIPPED = "shipped"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELED = "canceled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "待支付"),
        (STATUS_PAID, "已支付"),
        (STATUS_SHIPPED, "已发货"),
        (STATUS_COMPLETED, "已完成"),
        (STATUS_CANCELED, "已取消"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_name = models.CharField(max_length=120)
    shipping_phone = models.CharField(max_length=50, blank=True)
    shipping_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self) -> str:
        return f"{self.product_name} x {self.quantity}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity
