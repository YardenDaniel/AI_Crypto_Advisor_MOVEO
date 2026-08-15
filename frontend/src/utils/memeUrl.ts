/**
 * Resolve a meme image URL for the browser.
 *
 * Reddit images are absolute http(s) URLs.
 * Static fallback paths such as `/memes/meme1.jpeg` are frontend public assets.
 * Never prefix those paths with the backend API origin.
 */
export function resolveMemeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) {
    return null
  }

  return imageUrl
}
