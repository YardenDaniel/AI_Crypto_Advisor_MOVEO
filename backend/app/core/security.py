from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings
from jwt import InvalidTokenError


# Password hasher configured with recommended secure settings.
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plain-text password before storing it in the database."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check whether a plain-text password matches the stored hash."""
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    """Create a signed JWT for an authenticated user."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

def decode_access_token(token: str) -> int:
    """Decode a JWT and return the authenticated user ID."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise ValueError("Missing subject in token")

        return int(user_id)

    except (InvalidTokenError, ValueError) as exc:
        raise ValueError("Invalid or expired token") from exc