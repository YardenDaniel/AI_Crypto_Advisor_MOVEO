from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    """Data required to register a new user."""

    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """Data required to authenticate a user."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public user data returned by the API."""

    id: int
    name: str
    email: EmailStr

    model_config = {
        "from_attributes": True
    }
