import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { checkRateLimit, getClientIP, getRateLimitHeaders } from '@/lib/rate-limit'
import { incrementUsage, checkUsageLimit } from '@/lib/usage'
import { writeAuditLog } from '@/lib/audit'
import { prisma } from '@/lib/db'

const downloadRequestSchema = z.object({
  parseRecordId: z.string().cuid('Invalid parse record ID'),
  format: z.enum(['mp4', 'mp3', 'webm']).optional().default('mp4'),
  quality: z.enum(['360p', '480p', '720p', '1080p']).optional().default('720p'),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const parseResult = downloadRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.format() },
        { status: 400 }
      )
    }

    const { parseRecordId, format, quality } = parseResult.data

    // Get user and subscription
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

    // Free users cannot download
    if (userPlan === 'FREE') {
      await writeAuditLog({
        userId: user.id,
        action: 'download',
        success: false,
        details: { reason: 'subscription_required', parseRecordId },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { error: 'PRO subscription required for downloads' },
        { status: 403 }
      )
    }

    // Get parse record
    const parseRecord = await prisma.parseRecord.findFirst({
      where: {
        id: parseRecordId,
        userId: user.id, // Ensure user owns this parse record
      },
    })

    if (!parseRecord) {
      return NextResponse.json(
        { error: 'Parse record not found' },
        { status: 404 }
      )
    }

    // Check if download is allowed for this record
    if (!parseRecord.downloadable) {
      await writeAuditLog({
        userId: user.id,
        action: 'download',
        platform: parseRecord.platform,
        url: parseRecord.inputUrl,
        success: false,
        details: { reason: 'download_not_permitted', parseRecordId },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { error: 'Download not permitted for this content' },
        { status: 403 }
      )
    }

    // Check rate limits
    const rateLimitResult = await checkRateLimit('download', userId, userPlan, clientIP)
    
    if (!rateLimitResult.success) {
      await writeAuditLog({
        userId: user.id,
        action: 'download',
        platform: parseRecord.platform,
        url: parseRecord.inputUrl,
        success: false,
        details: { reason: 'rate_limit_exceeded', parseRecordId },
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
    const usageCheck = await checkUsageLimit(user.id, 'download', userPlan)
    
    if (!usageCheck.allowed) {
      await writeAuditLog({
        userId: user.id,
        action: 'download',
        platform: parseRecord.platform,
        url: parseRecord.inputUrl,
        success: false,
        details: { 
          reason: 'usage_limit_exceeded', 
          current: usageCheck.current, 
          limit: usageCheck.limit,
          parseRecordId 
        },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { 
          error: 'Download limit exceeded', 
          current: usageCheck.current,
          limit: usageCheck.limit,
        },
        { status: 429 }
      )
    }

    // Generate download URL (this would typically call an external service)
    // For security reasons, we never store actual download links
    const downloadUrl = await generateSecureDownloadUrl(parseRecord, format, quality)
    
    if (!downloadUrl) {
      await writeAuditLog({
        userId: user.id,
        action: 'download',
        platform: parseRecord.platform,
        url: parseRecord.inputUrl,
        success: false,
        details: { reason: 'download_generation_failed', parseRecordId },
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(
        { error: 'Unable to generate download link' },
        { status: 422 }
      )
    }

    // Increment usage
    await incrementUsage(user.id, 'download')

    // Log successful download
    await writeAuditLog({
      userId: user.id,
      action: 'download',
      platform: parseRecord.platform,
      url: parseRecord.inputUrl,
      success: true,
      details: { 
        parseRecordId,
        format,
        quality,
        title: parseRecord.title,
      },
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      downloadUrl,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      format,
      quality,
      filename: generateFilename(parseRecord, format),
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    })

  } catch (error) {
    console.error('Download API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate secure download URL with expiration
async function generateSecureDownloadUrl(
  parseRecord: any,
  format: string,
  quality: string
): Promise<string | null> {
  try {
    // This is where you would integrate with your chosen download service
    // The service should:
    // 1. Only provide downloads for content that's explicitly permitted
    // 2. Respect platform ToS and copyright
    // 3. Generate temporary, signed URLs that expire quickly
    // 4. Log all download attempts for compliance
    
    // For demonstration, we'll create a mock URL
    // In production, this would call your compliant video processing service
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const token = generateSecureToken(parseRecord.id, format, quality)
    
    return `${baseUrl}/api/download/stream?token=${token}&format=${format}&quality=${quality}`
  } catch (error) {
    console.error('Download URL generation error:', error)
    return null
  }
}

// Generate secure token for download
function generateSecureToken(parseRecordId: string, format: string, quality: string): string {
  // In production, use a proper JWT or signed token
  const payload = {
    parseRecordId,
    format,
    quality,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  }
  
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

// Generate filename for download
function generateFilename(parseRecord: any, format: string): string {
  const title = parseRecord.title || 'video'
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 50)
  const timestamp = new Date().toISOString().slice(0, 10)
  
  return `${sanitizedTitle}-${timestamp}.${format}`
}