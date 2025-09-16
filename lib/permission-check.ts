import { getPlatformPolicy, type PlatformId, DEFAULT_POLICY } from './allowed-platforms'

export interface PermissionCheckInput {
  platformId: PlatformId
  metadata: {
    title?: string
    author?: string
    license?: string
    isUserGenerated?: boolean
    creatorId?: string
  }
  userDeclaration: {
    hasPermission: boolean
    isContentOwner: boolean
    hasCreatorAuth: boolean
  }
  userSubscription: 'FREE' | 'PRO'
}

export interface PermissionCheckResult {
  downloadable: boolean
  reason?: string
  licenseStatus: 'permitted' | 'unknown' | 'prohibited'
  requiresUpgrade?: boolean
  complianceMessage: string
}

export function checkDownloadPermission(input: PermissionCheckInput): PermissionCheckResult {
  const { platformId, metadata, userDeclaration, userSubscription } = input
  const policy = getPlatformPolicy(platformId) ?? { 
    allowMetadata: true, 
    allowEmbed: true, 
    allowDownload: false, 
    name: 'Unknown Platform' 
  }  // ✅ 兜底
  
  // Base check: platform must allow downloads
  if (!policy.allowDownload) {
    return {
      downloadable: false,
      licenseStatus: 'prohibited',
      reason: 'platform_policy',
      complianceMessage: `${policy.name} does not permit third-party downloads. You can embed or view the content directly on their platform.`
    }
  }
  
  // Free users cannot download regardless of permissions
  if (userSubscription === 'FREE') {
    return {
      downloadable: false,
      licenseStatus: 'unknown',
      requiresUpgrade: true,
      reason: 'subscription_required',
      complianceMessage: 'Download functionality requires a PRO subscription. Upgrade to access downloads for permitted content.'
    }
  }
  
  // PRO users: check platform-specific requirements
  if ((policy as any).requiresAuth) {
    // Platform requires explicit authorization
    if (!userDeclaration.hasPermission) {
      return {
        downloadable: false,
        licenseStatus: 'unknown',
        reason: 'authorization_required',
        complianceMessage: 'This platform requires explicit authorization. Please confirm you have permission to download this content.'
      }
    }
    
    // Check if user claims ownership or creator authorization
    if (userDeclaration.isContentOwner || userDeclaration.hasCreatorAuth) {
      return {
        downloadable: true,
        licenseStatus: 'permitted',
        complianceMessage: 'Download permitted based on your authorization declaration.'
      }
    }
  }
  
  // Check metadata-based licensing
  if (metadata.license) {
    switch (metadata.license.toLowerCase()) {
      case 'cc':
      case 'creative commons':
      case 'public domain':
      case 'mit':
      case 'apache':
        return {
          downloadable: true,
          licenseStatus: 'permitted',
          complianceMessage: 'Content is available under an open license.'
        }
      
      case 'copyright':
      case 'all rights reserved':
      case 'proprietary':
        return {
          downloadable: false,
          licenseStatus: 'prohibited',
          reason: 'copyright_protected',
          complianceMessage: 'Content is copyright protected and cannot be downloaded without explicit permission.'
        }
    }
  }
  
  // Default case: allow with user declaration for platforms that permit it
  if (policy.allowDownload && userDeclaration.hasPermission) {
    return {
      downloadable: true,
      licenseStatus: 'unknown',
      complianceMessage: 'Download enabled based on your permission declaration. Please ensure you have the right to download this content.'
    }
  }
  
  // Fallback: not downloadable
  return {
    downloadable: false,
    licenseStatus: 'unknown',
    reason: 'insufficient_permission',
    complianceMessage: 'Insufficient permission to download this content. Please verify you have the necessary rights.'
  }
}

// Helper function to determine if content appears to be user-generated
export function isLikelyUserGenerated(metadata: { author?: string; title?: string }): boolean {
  if (!metadata.author && !metadata.title) return false
  
  // Simple heuristics - in a real app, this would be more sophisticated
  const userIndicators = [
    'user',
    'personal',
    'my',
    'vlog',
    'daily',
    'life',
    'home',
    'family'
  ]
  
  const text = `${metadata.author || ''} ${metadata.title || ''}`.toLowerCase()
  return userIndicators.some(indicator => text.includes(indicator))
}

// Compliance validation for UI display
export function getComplianceDisplay(result: PermissionCheckResult) {
  const colors = {
    permitted: 'bg-green-100 text-green-800 border-green-200',
    unknown: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    prohibited: 'bg-red-100 text-red-800 border-red-200'
  }
  
  const labels = {
    permitted: 'Download Permitted',
    unknown: 'Permission Required',
    prohibited: 'Download Prohibited'
  }
  
  return {
    className: colors[result.licenseStatus],
    label: labels[result.licenseStatus],
    message: result.complianceMessage
  }
}