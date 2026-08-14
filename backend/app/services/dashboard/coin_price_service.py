from app.constants.preferences import COINGECKO_ASSET_IDS
from app.integrations.crypto.coingecko_client import CoinGeckoClient
from app.schemas.dashboard import CoinPriceResponse


def get_coin_prices(
    assets: list[str],
    client: CoinGeckoClient,
) -> list[CoinPriceResponse]:
    """Get market prices for the user's preferred crypto assets."""

    coin_ids = [
        COINGECKO_ASSET_IDS[asset]
        for asset in assets
        if asset in COINGECKO_ASSET_IDS
    ]

    raw_prices = client.get_prices(coin_ids)

    prices = []

    for symbol in assets:
        coin_id = COINGECKO_ASSET_IDS.get(symbol)

        if coin_id is None:
            continue

        coin_data = raw_prices.get(coin_id)

        if coin_data is None:
            continue

        prices.append(
            CoinPriceResponse(
                symbol=symbol,
                price_usd=coin_data["usd"],
                change_24h=coin_data.get("usd_24h_change"),
                last_updated_at=coin_data.get("last_updated_at"),
            )
        )

    return prices
