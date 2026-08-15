from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Database configuration
    database_url: str

    # JWT authentication configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # HttpOnly auth cookie configuration.
    # SameSite=none is required for cross-site Vercel → Railway requests.
    # Secure must be true in production (HTTPS). TestClient uses HTTPS so
    # the same flags can be exercised in automated tests.
    auth_cookie_name: str = "access_token"
    auth_cookie_secure: bool = True
    auth_cookie_samesite: str = "none"

    # Comma-separated browser origins allowed to send credentialed requests.
    cors_origins: str = "http://localhost:5173"

    # CoinGecko API configuration
    coingecko_base_url: str
    coingecko_api_key: str

    # CryptoPanic API configuration.
    # Optional: not used by the current static Market News implementation,
    # but kept configurable for potential future use as a news provider.
    cryptopanic_base_url: str | None = None
    cryptopanic_api_key: str | None = None

    # Reddit scraping configuration
    reddit_meme_url: str
    reddit_user_agent: str

    # OpenRouter LLM configuration
    openrouter_base_url: str
    openrouter_api_key: str
    openrouter_model: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list of allowed browser origins."""
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


settings = Settings()