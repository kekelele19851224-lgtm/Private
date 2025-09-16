import { identifyPlatform, getPlatformPolicy } from './allowed-platforms'

export interface OEmbedResponse {
  type: 'video' | 'rich'
  version: string
  title?: string
  author_name?: string
  author_url?: string
  provider_name?: string
  provider_url?: string
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
  width?: number
  height?: number
  html?: string
  duration?: number
}

export interface MediaMetadata {
  title?: string
  author?: string
  thumbnail?: string
  duration?: number
  platform: string
  embedHtml?: string
  license?: string
  isEmbeddable: boolean
}

// Official oEmbed endpoints for supported platforms
const OEMBED_ENDPOINTS: Record<string, string> = {
  youtube: 'https://www.youtube.com/oembed',
  vimeo: 'https://vimeo.com/api/oembed.json',
  // Note: TikTok and other platforms may not have public oEmbed endpoints
  // We'll use metadata extraction services for those
}

export async function fetchOEmbedData(url: string): Promise<OEmbedResponse | null> {
  const platformId = identifyPlatform(url)
  if (!platformId) return null
  
  const oembedUrl = OEMBED_ENDPOINTS[platformId]
  if (!oembedUrl) return null
  
  try {
    const oembedRequest = new URL(oembedUrl)
    oembedRequest.searchParams.set('url', url)
    oembedRequest.searchParams.set('format', 'json')
    oembedRequest.searchParams.set('maxwidth', '800')
    oembedRequest.searchParams.set('maxheight', '450')
    
    const response = await fetch(oembedRequest.toString(), {
      headers: {
        'User-Agent': 'VideoParserService/1.0',
      },
    })
    
    if (!response.ok) return null
    
    const data: OEmbedResponse = await response.json()
    return data
  } catch (error) {
    console.error('oEmbed fetch error:', error)
    return null
  }
}

export async function getMediaMetadata(url: string): Promise<MediaMetadata | null> {
  const platformId = identifyPlatform(url)
  if (!platformId) return null
  
  const policy = getPlatformPolicy(platformId)
  
  // Try oEmbed first for platforms that support it
  const oembedData = await fetchOEmbedData(url)
  
  let metadata: MediaMetadata = {
    platform: platformId,
    isEmbeddable: policy.allowEmbed,
  }
  
  if (oembedData) {
    metadata = {
      ...metadata,
      title: oembedData.title,
      author: oembedData.author_name,
      thumbnail: oembedData.thumbnail_url,
      embedHtml: policy.allowEmbed ? oembedData.html : undefined,
    }
  }
  
  // For platforms without oEmbed, use basic URL parsing and external metadata service
  if (!oembedData) {
    metadata = await fetchMetadataFromService(url, platformId, metadata)
  }
  
  return metadata
}

// Fallback metadata extraction using external service
async function fetchMetadataFromService(
  url: string,
  platformId: string,
  baseMetadata: MediaMetadata
): Promise<MediaMetadata> {
  try {
    // This would call your chosen metadata extraction service
    // For now, we'll return basic metadata based on URL parsing
    
    // Extract basic info from URL patterns
    const metadata = { ...baseMetadata }
    
    if (platformId === 'youtube') {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        metadata.title = `YouTube Video ${videoId}`
        metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        if (baseMetadata.isEmbeddable) {
          metadata.embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
        }
      }
    } else if (platformId === 'tiktok') {
      metadata.title = 'TikTok Video'
      // TikTok doesn't allow iframe embedding in most cases
      metadata.embedHtml = undefined
    }
    
    return metadata
  } catch (error) {
    console.error('Metadata service error:', error)
    return baseMetadata
  }
}

// Helper functions for URL parsing
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Generate safe embed HTML with security restrictions
export function generateSafeEmbedHtml(
  originalHtml: string,
  platform: string
): string {
  // Add security attributes to iframe
  const secureHtml = originalHtml.replace(
    /<iframe/g,
    '<iframe sandbox="allow-scripts allow-same-origin allow-presentation" loading="lazy"'
  )
  
  return secureHtml
}

// Check if platform supports embedding
export function canEmbed(platformId: string): boolean {
  const policy = getPlatformPolicy(platformId)
  return policy.allowEmbed
}