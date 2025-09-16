import { describe, it, expect } from 'vitest'
import { 
  identifyPlatform, 
  getPlatformPolicy, 
  isSupportedPlatform 
} from '@/lib/allowed-platforms'

describe('Platform Detection', () => {
  it('should identify YouTube URLs correctly', () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
    ]

    urls.forEach(url => {
      expect(identifyPlatform(url)).toBe('youtube')
    })
  })

  it('should identify TikTok URLs correctly', () => {
    const urls = [
      'https://www.tiktok.com/@user/video/123456789',
      'https://tiktok.com/@user/video/123456789',
      'https://vm.tiktok.com/ZMdQw4w9W/'
    ]

    urls.forEach(url => {
      expect(identifyPlatform(url)).toBe('tiktok')
    })
  })

  it('should return null for unsupported platforms', () => {
    const unsupportedUrls = [
      'https://example.com/video/123',
      'https://randomsite.net/watch?v=123',
      'not-a-url'
    ]

    unsupportedUrls.forEach(url => {
      expect(identifyPlatform(url)).toBeNull()
    })
  })

  it('should get correct platform policies', () => {
    const youtubePolicy = getPlatformPolicy('youtube')
    expect(youtubePolicy.allowMetadata).toBe(true)
    expect(youtubePolicy.allowDownload).toBe(false)
    expect(youtubePolicy.name).toBe('YouTube')

    const tiktokPolicy = getPlatformPolicy('tiktok')
    expect(tiktokPolicy.allowMetadata).toBe(true)
    expect(tiktokPolicy.allowDownload).toBe(false)
    expect(tiktokPolicy.name).toBe('TikTok')
  })

  it('should correctly identify supported platforms', () => {
    expect(isSupportedPlatform('https://www.youtube.com/watch?v=123')).toBe(true)
    expect(isSupportedPlatform('https://www.tiktok.com/@user/video/123')).toBe(true)
    expect(isSupportedPlatform('https://unsupported.com/video/123')).toBe(false)
  })
})