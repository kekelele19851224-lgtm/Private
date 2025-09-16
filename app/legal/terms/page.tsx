import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using VideoParser ("Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Compliance Requirements</h2>
            <p className="text-gray-700 mb-4">
              You agree to use this service only for legally compliant purposes and in accordance 
              with platform terms of service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>You will only parse content you have permission to access</li>
              <li>You will not attempt to download content prohibited by platform policies</li>
              <li>You will respect copyright and intellectual property rights</li>
              <li>You will not use the service to infringe on others' rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Platform Compliance</h2>
            <p className="text-gray-700 mb-4">
              Our service respects and enforces platform terms of service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Downloads are only enabled for content explicitly permitted by platform policies</li>
              <li>We do not circumvent platform access controls or DRM</li>
              <li>We maintain compliance with DMCA and copyright laws</li>
              <li>We may disable access to platforms that prohibit our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Ensuring you have the right to access and download content</li>
              <li>Complying with applicable laws and regulations</li>
              <li>Maintaining the security of your account</li>
              <li>Not sharing your account credentials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may not use our service to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Download copyrighted content without permission</li>
              <li>Violate platform terms of service</li>
              <li>Engage in automated scraping or bulk downloading</li>
              <li>Redistribute downloaded content without proper authorization</li>
              <li>Use the service for commercial purposes without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We provide the service on an "as is" basis. We may modify, suspend, or discontinue 
              the service at any time. We do not guarantee uninterrupted access or availability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              VideoParser shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, 
              goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy and Data</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand 
              how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of 
              significant changes via email or service notifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at 
              legal@videoparser.com
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              These terms are effective as of {new Date().toLocaleDateString()}
            </p>
            <Link href="/">
              <Button>Return to Service</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}