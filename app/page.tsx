import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Zap, Users, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">VideoParser</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Button asChild>
                <Link href="/sign-up?redirect_url=/app/parse">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Extract Video Metadata
            <span className="block text-blue-600">Compliantly & Securely</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Parse video URLs from supported platforms and get metadata with full compliance. 
            Download only when explicitly permitted by platform policies and content licenses.
          </p>
          
          {/* URL Input */}
          <div className="mt-10 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="Paste video URL here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button size="lg" asChild>
                <Link href="/app/parse">Parse URL</Link>
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              ⚠️ Only provide URLs for content you have permission to access
            </p>
          </div>

          {/* Compliance Notice */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-2xl mx-auto">
            <p className="text-sm text-amber-800">
              <Shield className="inline h-4 w-4 mr-1" />
              <strong>Compliance First:</strong> We respect platform terms of service and copyright. 
              Downloads are only available for explicitly permitted content.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-extrabold text-gray-900">
              Built for Compliance & Security
            </h3>
            <p className="mt-4 text-lg text-gray-500">
              Every feature designed with legal compliance and platform respect in mind
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle>Platform Compliance</CardTitle>
                <CardDescription>
                  Strict adherence to platform terms of service and copyright policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Respects platform download policies
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    License-aware content handling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Audit logging for all actions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600" />
                <CardTitle>Smart Metadata Extraction</CardTitle>
                <CardDescription>
                  Get rich metadata using official APIs and compliant services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Title, author, thumbnail extraction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Duration and platform detection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Embedding support when allowed
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle>User-Friendly Interface</CardTitle>
                <CardDescription>
                  Clear compliance messaging and intuitive controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Clear permission indicators
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Usage tracking and limits
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Detailed compliance messaging
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold text-gray-900">Simple Pricing</h3>
          <p className="mt-4 text-lg text-gray-500 mb-8">
            Start free, upgrade when you need more
          </p>
          
          <div className="flex justify-center">
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">VideoParser</h4>
              <p className="text-gray-400">
                Compliant video metadata extraction and downloads
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/legal/aup" className="hover:text-white">Acceptable Use</Link></li>
                <li><Link href="/legal/dmca" className="hover:text-white">DMCA</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/app/parse" className="hover:text-white">Parse Video</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Compliance</h5>
              <p className="text-gray-400 text-sm">
                We respect platform terms of service and copyright. Only permitted downloads are enabled.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VideoParser. Built with compliance in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}