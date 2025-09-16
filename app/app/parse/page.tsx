'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Download, ExternalLink, Eye, AlertTriangle, Shield, Copy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ParseResult {
  id: string
  platform: string
  platformName: string
  title?: string
  author?: string
  thumbnail?: string
  duration?: number
  license: 'permitted' | 'unknown' | 'prohibited'
  downloadable: boolean
  requiresUpgrade?: boolean
  complianceMessage: string
  embedHtml?: string
  isEmbeddable: boolean
  createdAt: string
}

export default function ParsePage() {
  const { isSignedIn } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState('')
  const [userDeclaration, setUserDeclaration] = useState({
    hasPermission: false,
    isContentOwner: false,
    hasCreatorAuth: false,
  })

  const handleParse = async () => {
    if (!isSignedIn) {
      setError('Please sign in to parse videos')
      return
    }

    if (!url.trim()) {
      setError('请输入链接或粘贴分享文案')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          userDeclaration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400) {
          // 表单验证错误或用户输入错误
          setError(data.error || '请检查输入的链接格式')
        } else if (response.status === 502) {
          // 解析失败或网络问题
          setError(data.error || '解析失败（可能平台屏蔽或网络问题），请稍后再试或更换链接')
        } else {
          setError(data.error || 'Failed to parse video')
        }
        return
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || '网络连接失败，请检查网络后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.downloadable || !result.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parseRecordId: result.id,
          format: 'mp4',
          quality: '720p',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download')
      }

      // In a real implementation, this would trigger an actual download
      window.open(data.downloadUrl, '_blank')
    } catch (err: any) {
      setError(err.message || 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getLicenseBadgeColor = (license: string) => {
    switch (license) {
      case 'permitted': return 'bg-green-100 text-green-800 border-green-200'
      case 'prohibited': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getLicenseLabel = (license: string) => {
    switch (license) {
      case 'permitted': return 'Download Permitted'
      case 'prohibited': return 'Download Prohibited'
      default: return 'Permission Required'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-gray-900">
                VideoParser
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">解析视频链接</h1>
          <p className="mt-2 text-gray-600">
            支持抖音、快手、B站、YouTube等平台，可直接粘贴分享文案
          </p>
        </div>

        {/* Compliance Warning */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Compliance Notice:</strong> Only provide URLs for content you have permission to access. 
            Downloads are only enabled for content that explicitly permits third-party access.
          </AlertDescription>
        </Alert>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>视频链接或分享文案</CardTitle>
            <CardDescription>
              粘贴视频链接或完整分享文案，支持短链自动解析
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="粘贴视频链接或分享文案..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleParse} 
                disabled={loading || !url.trim()}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse'
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>支持格式示例：</strong></p>
              <p>• v.douyin.com/xxx</p>
              <p>• b23.tv/xxx</p>
              <p>• youtu.be/xxx</p>
              <p>• 完整分享文案（含短链）</p>
            </div>

            {/* User Declaration */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm">Permission Declaration:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPermission"
                    checked={userDeclaration.hasPermission}
                    onCheckedChange={(checked) => 
                      setUserDeclaration(prev => ({ ...prev, hasPermission: !!checked }))
                    }
                  />
                  <label htmlFor="hasPermission" className="text-sm">
                    I have permission to access and download this content
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isContentOwner"
                    checked={userDeclaration.isContentOwner}
                    onCheckedChange={(checked) => 
                      setUserDeclaration(prev => ({ ...prev, isContentOwner: !!checked }))
                    }
                  />
                  <label htmlFor="isContentOwner" className="text-sm">
                    I am the content owner
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasCreatorAuth"
                    checked={userDeclaration.hasCreatorAuth}
                    onCheckedChange={(checked) => 
                      setUserDeclaration(prev => ({ ...prev, hasCreatorAuth: !!checked }))
                    }
                  />
                  <label htmlFor="hasCreatorAuth" className="text-sm">
                    I have explicit authorization from the creator
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {result.title || 'Untitled Video'}
                    <Badge className={getLicenseBadgeColor(result.license)}>
                      {getLicenseLabel(result.license)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {result.author && `By ${result.author} • `}
                    {result.platformName}
                    {result.duration && ` • ${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Thumbnail */}
              {result.thumbnail && (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={result.thumbnail}
                      alt={result.title || 'Video thumbnail'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Compliance Message */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>{result.complianceMessage}</AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {/* Download Button */}
                {result.downloadable ? (
                  <Button onClick={handleDownload} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button disabled className="relative">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                    {result.requiresUpgrade && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        PRO Required
                      </Badge>
                    )}
                  </Button>
                )}

                {/* View on Platform */}
                <Button variant="outline" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on {result.platformName}
                  </a>
                </Button>

                {/* Copy URL */}
                <Button variant="outline" onClick={() => copyToClipboard(url)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>

                {/* Embed Preview */}
                {result.isEmbeddable && result.embedHtml && (
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Embed
                  </Button>
                )}
              </div>

              {/* Upgrade Notice */}
              {result.requiresUpgrade && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <span>Upgrade to PRO to enable downloads for permitted content</span>
                    <Link href="/pricing">
                      <Button size="sm">Upgrade Now</Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {/* Embed Preview */}
              {result.isEmbeddable && result.embedHtml && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Embed Preview:</h4>
                  <div 
                    className="aspect-video bg-gray-100 rounded"
                    dangerouslySetInnerHTML={{ __html: result.embedHtml }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Check our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            or{' '}
            <Link href="/legal/aup" className="text-blue-600 hover:underline">
              Acceptable Use Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}