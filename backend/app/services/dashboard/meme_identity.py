import hashlib

from app.schemas.dashboard import MemeResponse


def build_meme_item_id(meme: MemeResponse) -> str:
    """Build the stable feedback identity of a meme.

    The same meme must always map to the same ``item_id`` so its existing
    ``dashboard_feedback`` row (and vote) is reused when it is shown again.
    """

    identifier_source = (
        meme.source_url
        or meme.image_url
        or meme.title
    )

    return hashlib.sha256(
        identifier_source.encode("utf-8")
    ).hexdigest()
