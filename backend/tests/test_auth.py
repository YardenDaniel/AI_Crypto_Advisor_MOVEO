from app.core.config import settings


def _signup(client):
    """Register the standard test user."""
    return client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )


def _login(client, password="Test123!"):
    """Log in the standard test user."""
    return client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": password,
        },
    )


def test_signup_success(client):
    """Test that a new user can successfully sign up."""
    response = _signup(client)

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_signup_duplicate_email(client):
    """Test that the same email cannot be registered twice."""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "Test123!",
    }

    client.post("/auth/signup", json=user_data)

    response = client.post("/auth/signup", json=user_data)

    assert response.status_code == 409


def test_login_sets_httponly_cookie(client):
    """Login stores the JWT in an HttpOnly cookie, not in the JSON body."""
    _signup(client)

    response = _login(client)

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "access_token" not in data
    assert "token_type" not in data

    set_cookie = response.headers.get("set-cookie", "")

    assert f"{settings.auth_cookie_name}=" in set_cookie
    assert "HttpOnly" in set_cookie
    assert settings.auth_cookie_name in response.cookies


def test_login_wrong_password(client):
    """Test that login fails when the password is incorrect."""
    _signup(client)

    response = _login(client, password="WrongPassword")

    assert response.status_code == 401
    assert settings.auth_cookie_name not in response.cookies
    assert settings.auth_cookie_name not in client.cookies


def test_me_without_cookie(client):
    """A missing auth cookie is rejected as unauthenticated."""
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_invalid_cookie(client):
    """An invalid auth cookie is rejected as unauthenticated."""
    client.cookies.set(settings.auth_cookie_name, "not-a-valid-jwt")

    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_valid_cookie(client):
    """After login, /auth/me authenticates from the cookie alone."""
    _signup(client)
    login_response = _login(client)

    assert login_response.status_code == 200

    response = client.get("/auth/me")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"


def test_logout_clears_session(client):
    """Logout deletes the auth cookie so later requests are unauthenticated."""
    _signup(client)
    _login(client)

    assert client.get("/auth/me").status_code == 200

    logout_response = client.post("/auth/logout")

    assert logout_response.status_code == 204

    response = client.get("/auth/me")

    assert response.status_code == 401
