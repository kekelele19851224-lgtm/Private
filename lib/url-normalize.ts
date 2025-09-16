// lib/url-normalize.ts
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

/** 从分享文案中提取第一个 http(s) 链接，并去掉末尾杂质符号 */
export function extractUrlFromShareText(input: string): string | null {
  if (!input) return null;
  const m = input.match(/https?:\/\/[^\s]+/i);
  if (!m) return null;
  const url = m[0]
    // 去掉中文/英文标点、括号等结尾符号
    .replace(/[)\]\u3002\uff01\uff1f\uff0c\uff1a\u3001]+$/g, "");
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

/** 是否在白名单域名（可按需扩展） */
export function isAllowedHost(u: string): boolean {
  try {
    const host = new URL(u).hostname.toLowerCase();
    const list = [
      "v.douyin.com", "www.douyin.com", "douyin.com", "iesdouyin.com",
      "www.tiktok.com", "tiktok.com",
      "www.youtube.com", "youtube.com", "youtu.be",
      "www.bilibili.com", "bilibili.com", "b23.tv",
      "m.bilibili.com"
    ];
    return list.some(d => host === d || host.endsWith("." + d));
  } catch {
    return false;
  }
}

/** 解析 3xx 短链（最多 3 跳），返回最终 url */
export async function resolveShortUrl(u: string): Promise<string> {
  let current = u;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(current, { redirect: "manual", headers: { "User-Agent": UA } });
    const loc = res.headers.get("location");
    if (!loc) break;
    try {
      current = new URL(loc, current).toString();
    } catch {
      break;
    }
  }
  return current;
}

/** 主机名 → 平台名 */
export function detectPlatform(hostname: string): "douyin" | "tiktok" | "youtube" | "bilibili" | "unknown" {
  const h = hostname.toLowerCase();
  if (h.includes("douyin.com")) return "douyin";
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
  if (h.includes("bilibili.com") || h.includes("b23.tv")) return "bilibili";
  return "unknown";
}