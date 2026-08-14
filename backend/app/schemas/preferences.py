from pydantic import BaseModel, field_validator

from app.constants.preferences import (
    ContentType,
    InvestorType,
    SUPPORTED_ASSETS,
)


class PreferenceCreate(BaseModel):
    """Data required to create onboarding preferences."""

    assets: list[str]
    investor_type: InvestorType
    content_types: list[ContentType]

    @field_validator("assets")
    @classmethod
    def validate_assets(cls, assets: list[str]) -> list[str]:
        """Ensure all selected assets are supported."""
        unsupported_assets = [
            asset for asset in assets if asset not in SUPPORTED_ASSETS
        ]

        if unsupported_assets:
            raise ValueError(
                f"Unsupported assets: {', '.join(unsupported_assets)}"
            )

        return assets


class PreferenceUpdate(BaseModel):
    """Data that can be updated in user preferences."""

    assets: list[str] | None = None
    investor_type: InvestorType | None = None
    content_types: list[ContentType] | None = None

    @field_validator("assets")
    @classmethod
    def validate_assets(
        cls,
        assets: list[str] | None,
    ) -> list[str] | None:
        """Ensure all selected assets are supported."""
        if assets is None:
            return None

        unsupported_assets = [
            asset for asset in assets if asset not in SUPPORTED_ASSETS
        ]

        if unsupported_assets:
            raise ValueError(
                f"Unsupported assets: {', '.join(unsupported_assets)}"
            )

        return assets


class PreferenceResponse(BaseModel):
    """Preference data returned by the API."""

    user_id: int
    assets: list[str]
    investor_type: InvestorType
    content_types: list[ContentType]

    model_config = {
        "from_attributes": True,
    }