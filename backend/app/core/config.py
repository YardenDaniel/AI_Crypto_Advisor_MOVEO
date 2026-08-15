from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Database configuration
    database_url: str

    # JWT authentication configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

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


settings = Settings()