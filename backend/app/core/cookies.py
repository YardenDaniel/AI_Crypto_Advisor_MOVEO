from fastapi import Response

from app.core.config import settings


def _auth_cookie_params() -> dict:
    """Shared cookie attributes used when setting and deleting the auth cookie.

    Path, Secure, HttpOnly, and SameSite must match on delete, otherwise the
    browser will not remove the cookie. Domain is omitted so the cookie is
    host-only (bound to the API host, not a parent domain).
    """
    return {
        "key": settings.auth_cookie_name,
        "httponly": True,
        "secure": settings.auth_cookie_secure,
        "samesite": settings.auth_cookie_samesite,
        "path": "/",
    }


def set_auth_cookie(response: Response, token: str) -> None:
    """Store the JWT in an HttpOnly cookie on the given response."""
    response.set_cookie(
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        **_auth_cookie_params(),
    )


def clear_auth_cookie(response: Response) -> None:
    """Delete the auth cookie using the same attributes used when setting it."""
    response.delete_cookie(**_auth_cookie_params())
