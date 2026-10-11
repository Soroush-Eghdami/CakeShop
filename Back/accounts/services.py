from django.db import transaction
from django.contrib.auth import get_user_model
from cart.models import Cart

User = get_user_model()

@transaction.atomic
def user_create(*, email : str, password : str, username : str) -> User:
    # Normalize email so a@x.com and A@x.com can't both register.
    user = User.objects.create_user(
        username=username, email=User.objects.normalize_email(email), password=password
    )
    # get_or_create: RegisterView also ensures a cart exists, and this guards
    # against double-creation races on the OneToOne Cart.user constraint.
    Cart.objects.get_or_create(user=user)
    return user

