def test_signup_success(client):
    """Test that a new user can successfully sign up."""
    response = client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

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


def test_login_success(client):
    """Test that a registered user can successfully log in."""
    client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test that login fails when the password is incorrect."""
    client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword",
        },
    )

    assert response.status_code == 401


def test_me_without_token(client):
    """Test that a protected endpoint rejects unauthenticated requests."""
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_with_valid_token(client):
    """Test that an authenticated user can access the protected endpoint."""
    client.post(
        "/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Test123!",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"