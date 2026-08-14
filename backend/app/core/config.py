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

    # CryptoPanic API configuration
    cryptopanic_base_url: str
    cryptopanic_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()