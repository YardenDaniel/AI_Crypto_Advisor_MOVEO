from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.db.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    """Find a user by email address."""
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
) -> User:
    """Create and persist a new user."""

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    """Authenticate a user using email and password."""

    user = get_user_by_email(db, email)

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user