import { describe, it, expect } from 'vitest'
import { checkDownloadPermission } from '@/lib/permission-check'

describe('Permission Check', () => {
  it('should deny download for prohibited platforms', () => {
    const result = checkDownloadPermission({
      platformId: 'youtube',
      metadata: { title: 'Test Video' },
      userDeclaration: { hasPermission: true, isContentOwner: false, hasCreatorAuth: false },
      userSubscription: 'PRO'
    })

    expect(result.downloadable).toBe(false)
    expect(result.licenseStatus).toBe('prohibited')
    expect(result.reason).toBe('platform_policy')
  })

  it('should require PRO subscription for downloads', () => {
    const result = checkDownloadPermission({
      platformId: 'example_open',
      metadata: { title: 'Test Video' },
      userDeclaration: { hasPermission: true, isContentOwner: false, hasCreatorAuth: false },
      userSubscription: 'FREE'
    })

    expect(result.downloadable).toBe(false)
    expect(result.requiresUpgrade).toBe(true)
    expect(result.reason).toBe('subscription_required')
  })

  it('should allow download with proper authorization', () => {
    const result = checkDownloadPermission({
      platformId: 'example_open',
      metadata: { title: 'Test Video', license: 'cc' },
      userDeclaration: { hasPermission: true, isContentOwner: true, hasCreatorAuth: false },
      userSubscription: 'PRO'
    })

    expect(result.downloadable).toBe(true)
    expect(result.licenseStatus).toBe('permitted')
  })

  it('should respect copyright protected content', () => {
    const result = checkDownloadPermission({
      platformId: 'example_open',
      metadata: { title: 'Test Video', license: 'copyright' },
      userDeclaration: { hasPermission: false, isContentOwner: false, hasCreatorAuth: false },
      userSubscription: 'PRO'
    })

    expect(result.downloadable).toBe(false)
    expect(result.licenseStatus).toBe('prohibited')
    expect(result.reason).toBe('copyright_protected')
  })
})