from enum import StrEnum


class FeedbackSection(StrEnum):
    """Dashboard sections that support user feedback."""

    PRICES = "prices"
    NEWS = "news"
    MEME = "meme"
    INSIGHT = "insight"


class FeedbackVote(StrEnum):
    """Possible feedback states for displayed dashboard content."""

    NONE = "none"
    UP = "up"
    DOWN = "down"


class FeedbackVoteInput(StrEnum):
    UP = "up"
    DOWN = "down"