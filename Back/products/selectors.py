import uuid
from django.db.models import QuerySet
from .models import Product

def  product_list(*, category_slug : str = None) -> QuerySet:
    products = Product.objects.filter(is_available=True).select_related('category').order_by('-created_at')

    if category_slug:
        products = products.filter(category__slug=category_slug)

    return products

def product_detail(*, product_id : uuid.UUID) -> Product:
    return Product.objects.select_related('category').get(id=product_id)