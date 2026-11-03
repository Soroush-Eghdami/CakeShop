import uuid
from django.db import transaction, IntegrityError
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
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

class InvalidGoogleCredentialError(Exception):
    pass


def verify_google_credential(credential: str) -> dict:
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise ImproperlyConfigured("GOOGLE_OAUTH_CLIENT_ID is not configured.")
    
    try:
        claims = id_token.verify_oauth2_token(
            credential,
            GoogleRequest(),
            audience=settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError as exc:
        raise InvalidGoogleCredentialError from exc
    
    if (
        claims.get("email_verified") is not True
        or isinstance(claims.get("sub"), str) is False
        or isinstance(claims.get("email"), str) is False
    ):
        raise InvalidGoogleCredentialError("Invalid Google credential")
    
    return claims
    

class GoogleEmailALreadyRegistered(Exception):
    pass

def user_get_or_create_from_google(
    *, google_id: str, email: str, username: str
) -> User:
    normalized_email = User.objects.normalize_email(email.strip().casefold())
    
    try:
        with transaction.atomic():
            existing = User.objects.filter(google_id=google_id).first()
            if existing is not None:
                return existing
            
            if User.objects.filter(email__iexact=normalized_email).exists():
                raise GoogleEmailALreadyRegistered()
            
            base_username = slugify(username)[:120] or "google_user"
            username = f"{base_username}_{uuid.uuid4().hex[:12]}"
            
            user = User.objects.create_user(
                username=username,
                email=normalized_email,
                password = None,
                google_id=google_id,
            )
            Cart.objects.get_or_create(user=user)
            return user
        
    except IntegrityError:
        existing = User.objects.filter(google_id=google_id).first()
        if existing is not None:
            return existing
        raise