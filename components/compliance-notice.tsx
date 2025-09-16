import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ExternalLink,
  Download,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface ComplianceNoticeProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  platform?: string
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'secondary'
    icon?: React.ReactNode
  }>
  showPlatformBadge?: boolean
  className?: string
}

export function ComplianceNotice({
  type,
  title,
  message,
  platform,
  actions = [],
  showPlatformBadge = false,
  className
}: ComplianceNoticeProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    return type === 'error' ? 'destructive' : 'default'
  }

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <AlertTitle className="flex items-center gap-2">
            {title}
            {showPlatformBadge && platform && (
              <Badge variant="outline" className="text-xs">
                {platform}
              </Badge>
            )}
          </AlertTitle>
        </div>
        <AlertDescription className="mb-3">
          {message}
        </AlertDescription>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              action.href ? (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href={action.href}>
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            ))}
          </div>
        )}
      </div>
    </Alert>
  )
}

// Pre-configured compliance notices for common scenarios
export const ComplianceNotices = {
  PlatformProhibited: ({ platform }: { platform: string }) => (
    <ComplianceNotice
      type="warning"
      title="Download Not Permitted"
      message={`${platform} does not allow third-party downloads. You can view the content directly on their platform.`}
      platform={platform}
      showPlatformBadge
      actions={[
        {
          label: 'View on Platform',
          variant: 'outline',
          icon: <ExternalLink className="h-4 w-4 mr-1" />,
        },
      ]}
    />
  ),

  AuthorizationRequired: ({ platform }: { platform: string }) => (
    <ComplianceNotice
      type="warning"
      title="Authorization Required"
      message={`${platform} requires explicit permission to download content. Please ensure you have the necessary rights.`}
      platform={platform}
      showPlatformBadge
      actions={[
        {
          label: 'Learn More',
          href: '/legal/aup',
          variant: 'outline',
          icon: <Info className="h-4 w-4 mr-1" />,
        },
      ]}
    />
  ),

  SubscriptionRequired: () => (
    <ComplianceNotice
      type="info"
      title="PRO Subscription Required"
      message="Download functionality is available with a PRO subscription. Upgrade to access downloads for permitted content."
      actions={[
        {
          label: 'Upgrade to PRO',
          href: '/pricing',
          variant: 'default',
          icon: <Download className="h-4 w-4 mr-1" />,
        },
        {
          label: 'View Features',
          href: '/pricing',
          variant: 'outline',
        },
      ]}
    />
  ),

  DownloadPermitted: ({ platform }: { platform: string }) => (
    <ComplianceNotice
      type="success"
      title="Download Permitted"
      message="This content is available for download based on platform policies and your authorization declaration."
      platform={platform}
      showPlatformBadge
    />
  ),

  CopyrightProtected: ({ platform }: { platform: string }) => (
    <ComplianceNotice
      type="error"
      title="Copyright Protected"
      message="This content is protected by copyright and cannot be downloaded without explicit permission from the rights holder."
      platform={platform}
      showPlatformBadge
      actions={[
        {
          label: 'View on Platform',
          variant: 'outline',
          icon: <Eye className="h-4 w-4 mr-1" />,
        },
        {
          label: 'Copyright Info',
          href: '/legal/dmca',
          variant: 'outline',
        },
      ]}
    />
  ),

  GeneralCompliance: () => (
    <ComplianceNotice
      type="info"
      title="Compliance Notice"
      message="We respect platform terms of service and copyright laws. Only provide URLs for content you have permission to access."
      actions={[
        {
          label: 'Terms of Service',
          href: '/legal/terms',
          variant: 'outline',
        },
        {
          label: 'Acceptable Use',
          href: '/legal/aup',
          variant: 'outline',
        },
      ]}
    />
  ),

  RateLimited: ({ resetTime }: { resetTime?: Date }) => (
    <ComplianceNotice
      type="warning"
      title="Rate Limit Exceeded"
      message={`You have made too many requests. ${
        resetTime ? `Please try again after ${resetTime.toLocaleTimeString()}.` : 'Please wait before making more requests.'
      }`}
      actions={[
        {
          label: 'Upgrade for Higher Limits',
          href: '/pricing',
          variant: 'outline',
        },
      ]}
    />
  ),

  UsageExceeded: ({ type, current, limit }: { type: string; current: number; limit: number }) => (
    <ComplianceNotice
      type="warning"
      title="Usage Limit Exceeded"
      message={`You have used ${current} of ${limit} ${type}s this month. Upgrade your plan for higher limits.`}
      actions={[
        {
          label: 'Upgrade Plan',
          href: '/pricing',
          variant: 'default',
        },
        {
          label: 'View Usage',
          href: '/dashboard',
          variant: 'outline',
        },
      ]}
    />
  ),
}

// Hook for managing compliance notices in components
export function useComplianceNotice() {
  const [notice, setNotice] = React.useState<{
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    platform?: string
  } | null>(null)

  const showNotice = (noticeData: typeof notice) => {
    setNotice(noticeData)
  }

  const clearNotice = () => {
    setNotice(null)
  }

  return {
    notice,
    showNotice,
    clearNotice,
  }
}