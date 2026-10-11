from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Cart, CartItem
from products.serializers import ProductOutputSerializer


# =============================================================================
# Input Serializers
# =============================================================================

class CartAddItemInputSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=100, default=1)


class CartUpdateItemInputSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=100)


# =============================================================================
# Output Serializers
# =============================================================================

class CartItemOutputSerializer(serializers.ModelSerializer):
    product = ProductOutputSerializer()
    item_total = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_item_total(self, obj):
        if obj.product:
            return str(obj.product.price * obj.quantity)
        return "0.00"

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'item_total']


class CartOutputSerializer(serializers.ModelSerializer):
    items = CartItemOutputSerializer(many=True)
    total = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_total(self, obj):
        return str(sum(
            item.product.price * item.quantity
            for item in obj.items.all()
            if item.product
        ))

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total']