import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { 
  identifyPlatform, 
  getPlatformPolicy, 
  isSupportedPlatform,
  getPlatformAndPolicyFromUrl
} from '@/lib/allowed-platforms'
import { checkDownloadPermission } from '@/lib/permission-check'
import { getMediaMetadata } from '@/lib/oembed'
import { checkRateLimit, getClientIP, getRateLimitHeaders } from '@/lib/rate-limit'
import { incrementUsage, checkUsageLimit } from '@/lib/usage'
import { writeAuditLog } from '@/lib/audit'
import { toJsonString } from '@/lib/serialize'
import { getMetadataByHost } from '@/lib/fetch-meta'
import { extractUrlFromShareText, isAllowedHost, resolveShortUrl, detectPlatform } from "@/lib/url-normalize"

const parseRequestSchema = z.object({
  url: z.string().min(1, '请输入链接或分享文案'),
  userDeclaration: z.object({
    hasPermission: z.boolean().default(false),
    isContentOwner: z.boolean().default(false),
    hasCreatorAuth: z.boolean().default(false),
  }).optional(),
})


export async function POST(request: NextRequest) {
  // 1) 只读一次请求体
  const body = await request.json();
  const raw = body?.url ?? "";

  console.log("[parse] raw:", raw);

  // 2) 分享文案 → 提取链接
  const extracted = extractUrlFromShareText(String(raw));
  console.log("[parse] extracted:", extracted);
  if (!extracted) {
    console.log("[parse] stop: no extracted url");
    return NextResponse.json({ error: "请粘贴完整链接（以 https:// 开头）" }, { status: 400 });
  }

  // 3) 白名单
  const allowed = isAllowedHost(extracted);
  console.log("[parse] allowedHost:", allowed);
  if (!allowed) {
    console.log("[parse] stop: unsupported host");
    return NextResponse.json({ error: "Unsupported platform or invalid URL" }, { status: 400 });
  }

  // 4) 短链解析（v.douyin.com / b23.tv / youtu.be 等）
  const finalUrl = await resolveShortUrl(extracted);
  console.log("[parse] resolved:", finalUrl);
  let host = "";
  try { host = new URL(finalUrl).hostname; } catch {}
  console.log("[parse] host:", host, "platform:", detectPlatform(host));

  // 5) 回写，后续统一用 body.url
  body.url = finalUrl;

  // 6) 如果你的代码里有 Zod：用 body 做 parse（不要再 request.json()）
  const parseResult = parseRequestSchema.safeParse(body);
  
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: parseResult.error.format() },
      { status: 400 }
    )
  }

  const { url, userDeclaration = { hasPermission: false, isContentOwner: false, hasCreatorAuth: false } } = parseResult.data

  // ⬇️ 从这里开始，沿用你原有的认证/限流/合规/元数据/写库流程。
  // 平台名如需使用，可在 policy/detect 处调用 detectPlatform(host) 补齐 Douyin/B站/YouTube 的识别。

  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userPlan = user.subscription?.plan as 'FREE' | 'PRO' || 'FREE'
    const clientIP = getClientIP(request)

    // Check rate limits
    const rateLimitResult = await checkRateLimit('parse', userId, userPlan, clientIP)
    
    if (!rateLimitResult.success) {
      await writeAuditLog({
        userId: user.id,
        action: 'parse',
        url,
        success: false,
        details: { reason: 'rate_limit_exceeded' },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { error: 'Rate limit exceeded', resetTime: rateLimitResult.reset },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id, 'parse', userPlan)
    
    if (!usageCheck.allowed) {
      await writeAuditLog({
        userId: user.id,
        action: 'parse',
        url,
        success: false,
        details: { reason: 'usage_limit_exceeded', current: usageCheck.current, limit: usageCheck.limit },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { 
          error: 'Usage limit exceeded', 
          current: usageCheck.current,
          limit: usageCheck.limit,
          upgradeRequired: userPlan === 'FREE',
        },
        { status: 429 }
      )
    }

    const { platform, policy } = getPlatformAndPolicyFromUrl(url);
    // platform 可能是 "douyin" / "youtube" / "bilibili" / "tiktok" / "unknown"
    // policy 一定有值（默认 DEFAULT_POLICY）
    
    // Backward compatibility
    const platformId = platform !== "unknown" ? platform as any : null
    const legacyPolicy = platformId ? getPlatformPolicy(platformId) : { allowMetadata: true, allowEmbed: true, allowDownload: false, name: 'Unknown Platform' }

    // 获取元数据（带 UA + OG 兜底）
    let meta: any | null = null;
    try {
      meta = await getMetadataByHost(url);
    } catch (err) {
      // 记录失败审计，但不要因 details 是对象而再报错
      await writeAuditLog({
        userId: user.id,
        action: "parse",
        platform: legacyPolicy.name,
        url: url,
        success: false,
        details: { reason: "metadata_fetch_failed", message: (err as Error)?.message },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      });
      return NextResponse.json(
        { error: "解析该链接失败（可能平台屏蔽或网络问题）" },
        { status: 502 }
      );
    }

    // Check download permissions (考虑平台策略)
    const platformAllowsDownload = !['douyin', 'youtube', 'tiktok'].includes(platform)
    const permissionResult = checkDownloadPermission({
      platformId: platformId || 'douyin',  // 提供默认值，因为函数需要非null参数
      metadata: {
        title: meta?.title,
        author: meta?.author,
        license: undefined,
      },
      userDeclaration,
      userSubscription: userPlan,
    })

    // 对于限制下载的平台（如抖音、YouTube），强制设置为不可下载
    const finalDownloadable = platformAllowsDownload && permissionResult.downloadable

    // —— 写解析记录（注意 metadata 要字符串化）——
    const parseRecord = await prisma.parseRecord.create({
      data: {
        userId: user.id,
        platform: legacyPolicy.name,
        inputUrl: url,
        title: meta?.title ?? null,
        author: meta?.author ?? null,
        thumbnail: meta?.thumbnail ?? null,
        duration: null,
        license: permissionResult.licenseStatus,
        downloadable: finalDownloadable,
        embedHtml: meta?.embedHtml ?? null,
        metadata: toJsonString({ source: "og", ...meta }),
      },
    })

    // Increment usage
    await incrementUsage(user.id, 'parse')

    // Log successful action
    await writeAuditLog({
      userId: user.id,
      action: 'parse',
      platform: platformId,
      url,
      success: true,
      details: { 
        parseRecordId: parseRecord.id,
        downloadable: finalDownloadable,
        licenseStatus: permissionResult.licenseStatus,
      },
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Return response
    const complianceMessage = !platformAllowsDownload 
      ? `${legacyPolicy.name} 平台内容仅支持预览，请前往官方平台观看` 
      : permissionResult.complianceMessage;

    return NextResponse.json({
      id: parseRecord.id,
      platform: platformId,
      platformName: legacyPolicy.name,
      title: meta?.title ?? null,
      author: meta?.author ?? null,
      thumbnail: meta?.thumbnail ?? null,
      duration: null,
      license: permissionResult.licenseStatus,
      downloadable: finalDownloadable,
      requiresUpgrade: permissionResult.requiresUpgrade,
      complianceMessage,
      embedHtml: meta?.embedHtml ?? null,
      isEmbeddable: !!meta?.isEmbeddable,
      createdAt: parseRecord.createdAt,
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    })

  } catch (error) {
    console.error('[/api/parse] error:', error)
    
    return NextResponse.json(
      { error: '解析该链接失败（可能平台屏蔽或网络问题）' },
      { status: 502 }
    )
  }
}