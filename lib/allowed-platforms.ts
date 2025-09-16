export const DEFAULT_POLICY = { allowMetadata: true, allowEmbed: true, allowDownload: false } as const;

export const PLATFORM_POLICIES = {
  douyin:   { allowMetadata: true, allowEmbed: true, allowDownload: false },
  tiktok:   { allowMetadata: true, allowEmbed: true, allowDownload: false },
  youtube:  { allowMetadata: true, allowEmbed: true, allowDownload: false },
  bilibili: { allowMetadata: true, allowEmbed: true, allowDownload: false },
} as const;

const HOST_TO_PLATFORM: Record<string, keyof typeof PLATFORM_POLICIES> = {
  "v.douyin.com": "douyin",
  "douyin.com": "douyin",
  "www.douyin.com": "douyin",
  "iesdouyin.com": "douyin",
  "www.iesdouyin.com": "douyin",

  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",

  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "youtu.be": "youtube",

  "bilibili.com": "bilibili",
  "www.bilibili.com": "bilibili",
  "b23.tv": "bilibili",
};

export function getPlatformAndPolicyFromUrl(u: string) {
  try {
    const host = new URL(u).hostname.toLowerCase();
    const hit = Object.keys(HOST_TO_PLATFORM).find(
      d => host === d || host.endsWith("." + d)
    );
    const platform = hit ? HOST_TO_PLATFORM[hit] : undefined;
    const policy = platform ? PLATFORM_POLICIES[platform] : DEFAULT_POLICY;
    return { platform: platform ?? "unknown", policy };
  } catch {
    return { platform: "unknown", policy: DEFAULT_POLICY };
  }
}

// Backward compatibility - keep existing functions
export interface PlatformPolicy {
  allowMetadata: boolean
  allowEmbed: boolean
  allowDownload: boolean
  name: string
}

const LEGACY_PLATFORM_POLICIES: Record<string, PlatformPolicy> = {
  tiktok: { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'TikTok' },
  douyin: { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'Douyin' },
  youtube: { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'YouTube' },
  bilibili: { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'Bilibili' },
}

export type PlatformId = keyof typeof LEGACY_PLATFORM_POLICIES

export function identifyPlatform(url: string): PlatformId | null {
  const { platform } = getPlatformAndPolicyFromUrl(url);
  return platform !== "unknown" ? platform as PlatformId : null;
}

export function getPlatformPolicy(platformId: PlatformId): PlatformPolicy {
  return LEGACY_PLATFORM_POLICIES[platformId] || { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'Unknown' };
}

export function isSupportedPlatform(url: string): boolean {
  return identifyPlatform(url) !== null;
}