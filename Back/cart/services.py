from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Cart, CartItem
from .selectors import cart_get
from products.models import Product

User = get_user_model()

MAX_QUANTITY = 100


def cart_get_or_create(*, user: User) -> Cart:
    """Get or create a cart for the user."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


@transaction.atomic
def cart_add_item(*, user: User, product: Product, quantity: int = 1) -> CartItem:
    quantity = max(1, min(int(quantity), MAX_QUANTITY))
    cart = Cart.objects.select_for_update().get_or_create(user=user)[0]
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    if not created:
        # Clamp so repeated adds can never exceed the model max (100).
        # (Model validators don't run on .save(), so enforce it here.)
        cart_item.quantity = min(cart_item.quantity + quantity, MAX_QUANTITY)
        cart_item.save(update_fields=['quantity'])
    return cart_item

def cart_remove_item(*, user: User, product: Product) -> None:
    cart = cart_get(user=user)
    CartItem.objects.filter(cart=cart, product=product).delete()
    
def cart_update_item_quantity(*, user: User, product: Product, quantity: int) -> CartItem:
    cart = cart_get(user=user)
    cart_item = CartItem.objects.get(cart=cart, product=product)
    cart_item.quantity = quantity
    cart_item.save()
    return cart_item
    
def cart_clear(*, user: User) -> None:
    cart = cart_get(user=user)
    CartItem.objects.filter(cart=cart).delete()