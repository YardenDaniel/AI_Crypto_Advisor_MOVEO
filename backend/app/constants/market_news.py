"""Static fallback content for the Market News dashboard section.

Structured as a flat list of articles that mirrors a CryptoPanic-style feed.
Each item follows the ``MarketNewsItem`` schema. An empty ``instruments`` list
represents General Crypto News that is shown to every user.

``published_at`` holds the real publication date (date-only, ISO 8601) taken
from the article URL when known. It is ``None`` when no verified date is
available; no times are fabricated.
"""


STATIC_MARKET_NEWS = [
    {
        "id": "static-btc-1",
        "title": "Bitcoin Falls as Regulatory Hopes Are Dashed",
        "description": (
            "Bitcoin slides after expected regulatory relief fails to "
            "materialize, weighing on sentiment."
        ),
        "source": {"title": "Investopedia", "domain": "investopedia.com"},
        "published_at": None,
        "instruments": [{"code": "BTC", "title": "Bitcoin"}],
        "url": (
            "https://www.investopedia.com/market-update-bitcoin-falls-as-"
            "regulatory-hopes-are-dashed-price-btc-12059975"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-eth-1",
        "title": (
            "Tom Lee's Bitmine slowed ether purchases as it bought back "
            "$86 million in stock"
        ),
        "description": (
            "Bitmine eased its ether accumulation while redirecting capital "
            "toward an $86 million stock buyback."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-20",
        "instruments": [{"code": "ETH", "title": "Ethereum"}],
        "url": (
            "https://www.coindesk.com/business/2026/07/20/tom-lee-s-bitmine-"
            "slowed-ether-purchases-as-it-bought-back-usd86-million-in-stock"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-eth-2",
        "title": (
            "This $28 million ether market bet aims to profit from pure "
            "market chaos"
        ),
        "description": (
            "A $28 million ether position is structured to gain from sharp "
            "volatility rather than price direction."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-17",
        "instruments": [{"code": "ETH", "title": "Ethereum"}],
        "url": (
            "https://www.coindesk.com/markets/2026/07/17/this-usd28-million-"
            "ether-market-bet-aims-to-profit-from-pure-market-chaos"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-sol-1",
        "title": (
            "SBI Holdings' blockchain initiative pivots to Solana for "
            "tokenization, stablecoin issuance"
        ),
        "description": (
            "SBI Holdings shifts its blockchain strategy toward Solana for "
            "tokenization and stablecoin issuance."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-13",
        "instruments": [{"code": "SOL", "title": "Solana"}],
        "url": (
            "https://www.coindesk.com/business/2026/07/13/sbi-holdings-"
            "blockchain-initiative-pivots-to-solana-for-tokenization-"
            "stablecoin-issuance"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-sol-2",
        "title": (
            "Solana launches onchain governance and sets entry fee at "
            "100,000 SOL staked"
        ),
        "description": (
            "Solana rolls out onchain governance, requiring a large staked "
            "SOL threshold to open proposals."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-02",
        "instruments": [{"code": "SOL", "title": "Solana"}],
        "url": (
            "https://www.coindesk.com/markets/2026/07/02/solana-adds-onchain-"
            "governance-with-usd7-7-million-sol-needed-to-open-proposals"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-xrp-1",
        "title": "XRP whales accumulate as small holders capitulate",
        "description": (
            "Large XRP holders increase their positions while smaller "
            "investors sell into the weakness."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-23",
        "instruments": [{"code": "XRP", "title": "XRP"}],
        "url": (
            "https://www.coindesk.com/markets/2026/07/23/xrp-whales-"
            "accumulate-as-small-holders-capitulate"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-xrp-2",
        "title": (
            "Validators embrace XRP Ledger's recent upgrade. But not "
            "everyone's on board yet"
        ),
        "description": (
            "Validators adopt the latest XRP Ledger upgrade, though parts of "
            "the community remain hesitant."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-08",
        "instruments": [{"code": "XRP", "title": "XRP"}],
        "url": (
            "https://www.coindesk.com/tech/2026/07/08/xrp-ledger-s-new-"
            "upgrade-is-here-but-not-everyone-s-on-board-yet"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-ada-1",
        "title": (
            "Cardano hands core development to outside teams in "
            "decentralization push"
        ),
        "description": (
            "Cardano delegates core protocol development to external teams "
            "as part of a decentralization effort."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-17",
        "instruments": [{"code": "ADA", "title": "Cardano"}],
        "url": (
            "https://www.coindesk.com/tech/2026/07/17/cardano-hands-core-"
            "development-to-outside-teams-in-decentralization-push"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-general-1",
        "title": (
            "Crypto markets rally on Clarity progress report, Asian "
            "chip-stock rebound"
        ),
        "description": (
            "Crypto markets climb, supported by regulatory clarity progress "
            "and a rebound in Asian chip stocks."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-21",
        "instruments": [],
        "url": (
            "https://www.coindesk.com/markets/2026/07/21/crypto-markets-rally-"
            "on-clarity-progress-report-asian-chip-stock-rebound"
        ),
        "image": None,
        "origin": "static_fallback",
    },
    {
        "id": "static-general-2",
        "title": "Crypto's institutional influx has killed the memecoin craze",
        "description": (
            "Growing institutional participation is cooling the speculative "
            "memecoin frenzy across the market."
        ),
        "source": {"title": "CoinDesk", "domain": "coindesk.com"},
        "published_at": "2026-07-24",
        "instruments": [],
        "url": (
            "https://www.coindesk.com/daybook-us/2026/07/24/crypto-s-"
            "institutional-influx-has-killed-the-memecoin-craze"
        ),
        "image": None,
        "origin": "static_fallback",
    },
]
