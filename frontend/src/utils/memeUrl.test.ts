import { describe, expect, it } from 'vitest'
import { resolveMemeImageUrl } from './memeUrl'

describe('resolveMemeImageUrl', () => {
  it('keeps static frontend public paths unchanged', () => {
    expect(resolveMemeImageUrl('/memes/meme1.jpeg')).toBe('/memes/meme1.jpeg')
  })

  it('keeps absolute Reddit image URLs unchanged', () => {
    const redditUrl = 'https://i.redd.it/example.png'

    expect(resolveMemeImageUrl(redditUrl)).toBe(redditUrl)
  })

  it('does not prefix static paths with the API origin', () => {
    const resolved = resolveMemeImageUrl('/memes/meme2.png')

    expect(resolved).not.toContain('localhost:8000')
    expect(resolved?.startsWith('/memes/')).toBe(true)
  })

  it('returns null when the backend has no image', () => {
    expect(resolveMemeImageUrl(null)).toBeNull()
  })
})
