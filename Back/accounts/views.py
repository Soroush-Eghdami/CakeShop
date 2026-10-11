from typing import Any, cast
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate
from django.conf import settings
from drf_spectacular.utils import extend_schema
from .services import user_create
from .serializers import LoginInputSerializer, UserRegisterInputSerializer, UserOutputSerializer, MessageOutputSerializer
from cart.services import cart_get_or_create


# =============================================================================
# Helpers
# =============================================================================

def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> Response:
    """Sets JWT access and refresh tokens as HttpOnly cookies on the response."""
    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE'],
        value=access_token,
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
    )
    response.set_cookie(
        key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
        value=refresh_token,
        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
        path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
    )
    return response


def clear_auth_cookies(response: Response) -> Response:
    """Delete auth cookies using the same path/samesite/secure attributes."""
    response.delete_cookie(
        settings.SIMPLE_JWT['AUTH_COOKIE'],
        path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
    )
    response.delete_cookie(
        settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
        path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/'),
        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
    )
    return response


# =============================================================================
# Views
# =============================================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Register new user",
        description="Create a new user account. No authentication required.",
        tags=["Authentication"],
        request=UserRegisterInputSerializer,
        responses={201: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = UserRegisterInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        try:
            user = user_create(**data)
        except IntegrityError:
            # Race between validation and insert (or case-variant duplicates).
            return Response(
                {'error': 'A user with this email or username already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure a cart exists (user_create already does get_or_create).
        cart_get_or_create(user=user)
        
        return Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Login",
        description="Authenticate with email and password. Sets JWT tokens as HttpOnly cookies.",
        tags=["Authentication"],
        request=LoginInputSerializer,
        responses={200: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = cast(dict[str, Any], serializer.validated_data)
        email = data['email']
        password = data['password']

        user = authenticate(request=request, email=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Create or get cart for the user
        cart_get_or_create(user=user)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK
        )
        response = set_auth_cookies(response, access_token, refresh_token)
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserOutputSerializer

    @extend_schema(
        summary="Refresh access token",
        description=(
            "Reads the HttpOnly refresh_token cookie and issues a new access "
            "token cookie. Without this, users are logged out when the "
            "30-minute access token expires."
        ),
        tags=["Authentication"],
        request=None,
        responses={200: UserOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not refresh_token:
            return Response(
                {'error': 'Refresh token cookie is missing.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            user = refresh.user if hasattr(refresh, 'user') else None
            if user is None:
                from django.contrib.auth import get_user_model
                user = get_user_model().objects.get(id=refresh['user_id'])
        except (InvalidToken, TokenError):
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            return Response(
                {'error': 'Could not refresh session.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response(
            UserOutputSerializer(user).data,
            status=status.HTTP_200_OK,
        )
        # Re-issue access cookie; keep the same refresh cookie lifetime.
        # Rotation is disabled (no blacklist app), so reuse the refresh token.
        return set_auth_cookies(response, access_token, refresh_token)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageOutputSerializer

    @extend_schema(
        summary="User Logout",
        description="Logout the current user by clearing JWT cookies.",
        tags=["Authentication"],
        request=None,
        responses={200: MessageOutputSerializer},
    )
    def post(self, request: Request) -> Response:
        response = Response(
            {'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )
        return clear_auth_cookies(response)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get current user",
        description="Returns the currently authenticated user's profile data.",
        tags=["Authentication"],
        responses={200: UserOutputSerializer},
    )
    def get(self, request: Request) -> Response:
        return Response(
            UserOutputSerializer(request.user).data,
            status=status.HTTP_200_OK
        )