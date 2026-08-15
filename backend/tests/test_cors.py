from app.core.config import settings


ALLOWED_ORIGIN = "http://localhost:5173"
UNKNOWN_ORIGIN = "https://evil.example"


def test_allowed_cors_origin_receives_credentials_headers(client):
    """An allowed Origin is reflected and credentials are permitted."""
    assert ALLOWED_ORIGIN in settings.cors_origin_list

    response = client.get(
        "/health",
        headers={"Origin": ALLOWED_ORIGIN},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN
    assert response.headers["access-control-allow-credentials"] == "true"


def test_unknown_cors_origin_is_not_reflected(client):
    """An unknown Origin must not receive Access-Control-Allow-Origin."""
    response = client.get(
        "/health",
        headers={"Origin": UNKNOWN_ORIGIN},
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") != UNKNOWN_ORIGIN
