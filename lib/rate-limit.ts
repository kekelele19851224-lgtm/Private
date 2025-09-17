import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from './env'

// Create Redis instance if credentials are available
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Rate limiting configurations
export const rateLimits = {
  // Parse requests
  parse: {
    free: redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 d'), // 10 requests per day for free users
      analytics: true,
    }) : null,
    pro: redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 d'), // 100 requests per day for pro users
      analytics: true,
    }) : null,
    global: redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute per IP (anti-abuse)
      analytics: true,
    }) : null,
  },
  
  // Download requests (stricter limits)
  download: {
    pro: redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 d'), // 20 downloads per day for pro users
      analytics: true,
    }) : null,
    global: redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, '1 m'), // 2 downloads per minute per IP
      analytics: true,
    }) : null,
  },
}

// Helper function to check rate limits
export async function checkRateLimit(
  type: 'parse' | 'download',
  identifier: string,
  userPlan: 'FREE' | 'PRO' = 'FREE',
  ipAddress?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  
  // If no Redis, allow requests (fallback for development)
  if (!redis) {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    }
  }

  const limits = rateLimits[type]
  
  try {
    // Check user-specific limit first
    let userLimit = null
    let userResult = null
    if (type === 'parse') {
      userLimit = userPlan === 'PRO' ? limits.pro : ('free' in limits ? limits.free : null)
    } else if (type === 'download') {
      userLimit = userPlan === 'PRO' ? limits.pro : null // Free users can't download
    }
    
    if (userLimit) {
      userResult = await userLimit.limit(identifier)
      if (!userResult.success) {
        return {
          success: false,
          limit: userResult.limit,
          remaining: userResult.remaining,
          reset: new Date(userResult.reset),
        }
      }
    }
    
    // Check global IP-based limit
    if (ipAddress && limits.global) {
      const globalResult = await limits.global.limit(ipAddress)
      if (!globalResult.success) {
        return {
          success: false,
          limit: globalResult.limit,
          remaining: globalResult.remaining,
          reset: new Date(globalResult.reset),
        }
      }
    }
    
    // If we get here, all checks passed
    return {
      success: true,
      limit: userResult?.limit || 1000,
      remaining: userResult?.remaining || 999,
      reset: userResult?.reset ? new Date(userResult.reset) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow the request but log it
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }
  }
}

// Get client IP address from request
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfIP) {
    return cfIP
  }
  
  return 'unknown'
}

// Rate limit response headers
export function getRateLimitHeaders(result: { limit: number; remaining: number; reset: Date }) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset.getTime() / 1000).toString(),
  }
}