// lib/fetch-meta.ts
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

type Meta = {
  title?: string;
  author?: string;
  thumbnail?: string;
  embedHtml?: string;
  isEmbeddable?: boolean;
};

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
  });
  return await res.text();
}

function pickMeta(html: string, names: string[]): string | undefined {
  for (const name of names) {
    const re = new RegExp(
      `<meta\\s+(?:property|name)=["']${name}["']\\s+content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

export async function fetchOpenGraph(url: string): Promise<Meta> {
  const html = await fetchHtml(url);
  const title =
    pickMeta(html, ["og:title", "twitter:title"]) ||
    (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? undefined);
  const thumbnail = pickMeta(html, ["og:image", "twitter:image", "twitter:image:src"]);
  const author = pickMeta(html, ["og:site_name", "author"]);
  return { title, author, thumbnail, isEmbeddable: false };
}

export async function fetchYoutubeOEmbed(url: string): Promise<Meta> {
  const o = new URL("https://www.youtube.com/oembed");
  o.searchParams.set("url", url);
  o.searchParams.set("format", "json");
  const res = await fetch(o.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("oembed failed");
  const j = await res.json();
  return {
    title: j.title,
    author: j.author_name,
    embedHtml: j.html,
    isEmbeddable: true,
    thumbnail: j.thumbnail_url,
  };
}

export async function getMetadataByHost(finalUrl: string): Promise<Meta> {
  const host = new URL(finalUrl).hostname.toLowerCase();
  try {
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      // YT: 先 oEmbed，失败再 OG
      try { return await fetchYoutubeOEmbed(finalUrl); }
      catch { return await fetchOpenGraph(finalUrl); }
    }
    // 抖音/快手/哔哩：直接抓 OG
    if (host.includes("douyin.com") || host.includes("iesdouyin.com")) {
      return await fetchOpenGraph(finalUrl);
    }
    if (host.includes("bilibili.com") || host.includes("b23.tv")) {
      return await fetchOpenGraph(finalUrl);
    }
    // 其他：兜底 OG
    return await fetchOpenGraph(finalUrl);
  } catch (e) {
    // 最终兜底仍失败
    throw e;
  }
}