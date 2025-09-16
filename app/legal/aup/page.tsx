import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AUPPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Acceptable Use Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Purpose and Scope</h2>
            <p className="text-gray-700 mb-4">
              This Acceptable Use Policy (AUP) governs your use of VideoParser's video metadata extraction 
              and download service. This policy is designed to ensure compliance with platform terms of service, 
              copyright laws, and ethical usage standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Permitted Uses</h2>
            <p className="text-gray-700 mb-4">You may use our service to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Extract metadata from videos you have permission to access</li>
              <li>Download content that is explicitly permitted by platform policies</li>
              <li>Access content you own or have been granted rights to</li>
              <li>Use content under fair use provisions where applicable</li>
              <li>Download content with Creative Commons or other open licenses</li>
              <li>Extract metadata for research purposes (within legal boundaries)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">You may NOT use our service to:</p>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Copyright and Intellectual Property Violations</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Download copyrighted content without explicit permission</li>
              <li>Circumvent platform access controls or DRM systems</li>
              <li>Violate copyright, trademark, or other intellectual property rights</li>
              <li>Download content for commercial redistribution without proper licensing</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Platform Terms Violations</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Violate any platform's terms of service or community guidelines</li>
              <li>Access private or restricted content without authorization</li>
              <li>Engage in activities prohibited by the originating platform</li>
              <li>Bypass platform-imposed restrictions or limitations</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Abuse and Misuse</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Perform automated scraping or bulk downloading</li>
              <li>Exceed rate limits or attempt to circumvent usage restrictions</li>
              <li>Share your account credentials with others</li>
              <li>Use the service for illegal purposes</li>
              <li>Attempt to reverse engineer or hack our service</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Harmful Content</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Download content that promotes violence, hate, or discrimination</li>
              <li>Access content involving minors inappropriately</li>
              <li>Download content for harassment or stalking purposes</li>
              <li>Use the service to spread malware or malicious content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Platform-Specific Guidelines</h2>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">YouTube</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Downloads are generally prohibited by YouTube's Terms of Service</li>
              <li>Metadata extraction is permitted for your own videos</li>
              <li>Respect Creative Commons licensed content when available</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">TikTok</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Downloads are prohibited except for your own content</li>
              <li>Metadata extraction for research may be permitted</li>
              <li>Respect creator rights and platform policies</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Vimeo</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Downloads depend on creator settings and privacy controls</li>
              <li>Respect creator-specified download permissions</li>
              <li>Business accounts may have different restrictions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">As a user of our service, you are responsible for:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Ensuring you have the right to access and download content</li>
              <li>Complying with all applicable laws and regulations</li>
              <li>Respecting intellectual property rights</li>
              <li>Following platform terms of service</li>
              <li>Reporting violations or suspicious activity</li>
              <li>Keeping your account secure and confidential</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Compliance Monitoring</h2>
            <p className="text-gray-700 mb-4">
              We actively monitor usage to ensure compliance with this policy:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Automated checks for platform policy violations</li>
              <li>Usage pattern analysis to detect abuse</li>
              <li>Regular audits of download activities</li>
              <li>DMCA and copyright infringement monitoring</li>
              <li>Cooperation with platform compliance teams</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Enforcement and Consequences</h2>
            <p className="text-gray-700 mb-4">
              Violations of this policy may result in:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Warning:</strong> Initial notification for minor violations</li>
              <li><strong>Temporary Suspension:</strong> Limited access for repeated violations</li>
              <li><strong>Account Termination:</strong> Permanent ban for serious violations</li>
              <li><strong>Legal Action:</strong> Prosecution for illegal activities</li>
              <li><strong>Platform Reporting:</strong> Notification to affected platforms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Reporting Violations</h2>
            <p className="text-gray-700 mb-4">
              If you become aware of any violations of this policy, please report them immediately:
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-gray-700">
                <strong>Report Abuse:</strong> abuse@videoparser.com<br />
                <strong>DMCA Notices:</strong> dmca@videoparser.com<br />
                <strong>General Support:</strong> support@videoparser.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Safe Harbor and DMCA Compliance</h2>
            <p className="text-gray-700 mb-4">
              We comply with the Digital Millennium Copyright Act (DMCA) and maintain safe harbor protections:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Prompt response to valid DMCA takedown notices</li>
              <li>Counter-notification process for disputed claims</li>
              <li>Repeat infringer policy and account termination</li>
              <li>Cooperation with copyright holders and platforms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Acceptable Use Policy to reflect changes in laws, platform policies, 
              or our service. Material changes will be communicated via email or service notifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about this Acceptable Use Policy or to report violations:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">
                Email: legal@videoparser.com<br />
                Address: [Your Business Address]<br />
                Compliance Team: compliance@videoparser.com
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              This policy is effective as of {new Date().toLocaleDateString()}
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