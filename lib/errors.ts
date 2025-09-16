export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, code: string, statusCode = 500, isOperational = true) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400)
    this.details = details
  }
  public readonly details?: any
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403)
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', resetTime?: Date) {
    super(message, 'RATE_LIMIT_ERROR', 429)
    this.resetTime = resetTime
  }
  public readonly resetTime?: Date
}

export class UsageLimitError extends AppError {
  constructor(message = 'Usage limit exceeded', current?: number, limit?: number) {
    super(message, 'USAGE_LIMIT_ERROR', 429)
    this.current = current
    this.limit = limit
  }
  public readonly current?: number
  public readonly limit?: number
}

export class ComplianceError extends AppError {
  constructor(message: string, platform?: string, reason?: string) {
    super(message, 'COMPLIANCE_ERROR', 403)
    this.platform = platform
    this.reason = reason
  }
  public readonly platform?: string
  public readonly reason?: string
}

export class PlatformError extends AppError {
  constructor(message: string, platform: string) {
    super(message, 'PLATFORM_ERROR', 422)
    this.platform = platform
  }
  public readonly platform: string
}

export class SubscriptionError extends AppError {
  constructor(message: string, requiredPlan?: string) {
    super(message, 'SUBSCRIPTION_ERROR', 402)
    this.requiredPlan = requiredPlan
  }
  public readonly requiredPlan?: string
}

// Error response formatting
export function formatErrorResponse(error: Error) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details }),
        ...(error instanceof RateLimitError && { resetTime: error.resetTime }),
        ...(error instanceof UsageLimitError && { 
          current: error.current, 
          limit: error.limit 
        }),
        ...(error instanceof ComplianceError && { 
          platform: error.platform, 
          reason: error.reason 
        }),
        ...(error instanceof PlatformError && { platform: error.platform }),
        ...(error instanceof SubscriptionError && { 
          requiredPlan: error.requiredPlan 
        }),
      }
    }
  }

  // For non-AppError instances, return generic error
  return {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    }
  }
}

// Compliance-specific error messages
export const COMPLIANCE_MESSAGES = {
  PLATFORM_PROHIBITED: (platform: string) => 
    `${platform} does not permit third-party downloads. You can view the content directly on their platform.`,
  
  COPYRIGHT_PROTECTED: (platform: string) => 
    `This content is copyright protected and cannot be downloaded without explicit permission from the creator.`,
  
  AUTHORIZATION_REQUIRED: (platform: string) => 
    `This platform requires explicit authorization. Please confirm you have permission to download this content.`,
  
  SUBSCRIPTION_REQUIRED: 'Download functionality requires a PRO subscription. Upgrade to access downloads for permitted content.',
  
  UNSUPPORTED_PLATFORM: 'This platform is not supported or the URL format is invalid.',
  
  METADATA_FAILED: 'Unable to fetch video metadata. The content may be private or the URL may be invalid.',
  
  RATE_LIMITED: 'You have exceeded the rate limit. Please wait before making more requests.',
  
  USAGE_EXCEEDED: (type: string, limit: number) => 
    `You have exceeded your monthly ${type} limit of ${limit}. Upgrade your plan for higher limits.`,
  
  DMCA_NOTICE: 'This content has been flagged and is not available for download due to DMCA or copyright concerns.',
  
  GENERAL_COMPLIANCE: 'We respect platform terms of service and copyright laws. Downloads are only available for explicitly permitted content.',
} as const

// User-friendly error messages for the frontend
export function getComplianceMessage(errorCode: string, context?: any): string {
  switch (errorCode) {
    case 'PLATFORM_PROHIBITED':
      return COMPLIANCE_MESSAGES.PLATFORM_PROHIBITED(context?.platform || 'This platform')
    
    case 'COPYRIGHT_PROTECTED':
      return COMPLIANCE_MESSAGES.COPYRIGHT_PROTECTED(context?.platform || 'This platform')
    
    case 'AUTHORIZATION_REQUIRED':
      return COMPLIANCE_MESSAGES.AUTHORIZATION_REQUIRED(context?.platform || 'This platform')
    
    case 'SUBSCRIPTION_REQUIRED':
      return COMPLIANCE_MESSAGES.SUBSCRIPTION_REQUIRED
    
    case 'UNSUPPORTED_PLATFORM':
      return COMPLIANCE_MESSAGES.UNSUPPORTED_PLATFORM
    
    case 'METADATA_FAILED':
      return COMPLIANCE_MESSAGES.METADATA_FAILED
    
    case 'RATE_LIMITED':
      return COMPLIANCE_MESSAGES.RATE_LIMITED
    
    case 'USAGE_EXCEEDED':
      return COMPLIANCE_MESSAGES.USAGE_EXCEEDED(context?.type || 'request', context?.limit || 0)
    
    case 'DMCA_NOTICE':
      return COMPLIANCE_MESSAGES.DMCA_NOTICE
    
    default:
      return COMPLIANCE_MESSAGES.GENERAL_COMPLIANCE
  }
}

// Error boundary component data
export interface ErrorBoundaryData {
  hasError: boolean
  error?: Error
  errorCode?: string
  message?: string
  canRetry?: boolean
  supportActions?: Array<{
    label: string
    action: () => void
  }>
}