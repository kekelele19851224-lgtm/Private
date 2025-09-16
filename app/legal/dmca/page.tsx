import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, FileText } from 'lucide-react'

export default function DMCAPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">DMCA Copyright Policy</h1>
        
        <Alert className="mb-8">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Action Required?</strong> For immediate DMCA takedown requests, 
            email us directly at <strong>dmca@videoparser.com</strong> with your claim details.
          </AlertDescription>
        </Alert>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Our Commitment to Copyright Protection</h2>
            <p className="text-gray-700 mb-4">
              VideoParser respects intellectual property rights and complies with the Digital Millennium 
              Copyright Act (DMCA). We have implemented policies and procedures to respond promptly to 
              valid copyright infringement claims.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How Our Service Works with Copyright</h2>
            <p className="text-gray-700 mb-4">
              Our service is designed with copyright protection in mind:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>We only provide metadata extraction, not content hosting</li>
              <li>Downloads are only enabled for explicitly permitted content</li>
              <li>We respect platform terms of service and copyright policies</li>
              <li>We maintain audit logs of all user activities</li>
              <li>We cooperate with copyright holders and platforms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Filing a DMCA Takedown Notice</h2>
            <p className="text-gray-700 mb-4">
              If you believe your copyrighted work has been infringed through our service, 
              you may submit a DMCA takedown notice containing the following information:
            </p>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Required Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Identification of the copyrighted work:</strong> Describe the work you claim has been infringed</li>
              <li><strong>Identification of infringing material:</strong> Specific URLs or content accessed through our service</li>
              <li><strong>Contact information:</strong> Your name, address, phone number, and email address</li>
              <li><strong>Good faith statement:</strong> Statement that you believe the use is not authorized</li>
              <li><strong>Accuracy statement:</strong> Statement that the information is accurate under penalty of perjury</li>
              <li><strong>Authorization:</strong> Statement that you are authorized to act on behalf of the copyright owner</li>
              <li><strong>Physical or electronic signature:</strong> Your signature or that of the copyright owner</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">How to Submit</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-blue-800 mb-2"><strong>Email (Preferred):</strong></p>
              <p className="text-blue-700 mb-2">dmca@videoparser.com</p>
              <p className="text-blue-800 mb-2"><strong>Mail:</strong></p>
              <p className="text-blue-700">
                DMCA Agent<br />
                VideoParser Inc.<br />
                [Your Business Address]<br />
                [City, State, ZIP Code]
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Our Response Process</h2>
            <p className="text-gray-700 mb-4">
              Upon receiving a valid DMCA notice, we will:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 mb-4">
              <li><strong>Review the notice</strong> for completeness and validity</li>
              <li><strong>Remove or disable access</strong> to the allegedly infringing material</li>
              <li><strong>Notify the user</strong> who uploaded or accessed the content</li>
              <li><strong>Provide the user</strong> with the DMCA notice (minus your personal information)</li>
              <li><strong>Document the action</strong> in our compliance records</li>
            </ol>
            <p className="text-gray-700 mb-4">
              <strong>Response Time:</strong> We aim to respond to valid DMCA notices within 24-48 hours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Counter-Notification Process</h2>
            <p className="text-gray-700 mb-4">
              If you believe your content was removed in error, you may file a counter-notification containing:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Identification of the material that was removed</li>
              <li>Your contact information</li>
              <li>Statement under penalty of perjury that the removal was a mistake</li>
              <li>Consent to jurisdiction of federal court</li>
              <li>Your physical or electronic signature</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">Counter-Notification Timeline</h3>
            <ol className="list-decimal pl-6 text-gray-700 mb-4">
              <li>Submit counter-notification to dmca@videoparser.com</li>
              <li>We forward it to the original complainant</li>
              <li>If no court action is filed within 10-14 business days, we may restore access</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Repeat Infringer Policy</h2>
            <p className="text-gray-700 mb-4">
              We maintain a strict policy regarding repeat copyright infringers:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>First Violation:</strong> Warning and temporary access restriction</li>
              <li><strong>Second Violation:</strong> Temporary account suspension</li>
              <li><strong>Third Violation:</strong> Permanent account termination</li>
              <li><strong>Severe Violations:</strong> Immediate account termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Safe Harbor Compliance</h2>
            <p className="text-gray-700 mb-4">
              VideoParser qualifies for DMCA safe harbor protections under 17 U.S.C. § 512 because we:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Do not have actual knowledge of infringing activity</li>
              <li>Do not receive financial benefit directly attributable to infringing activity</li>
              <li>Respond expeditiously to remove infringing material upon notice</li>
              <li>Have designated an agent to receive DMCA notices</li>
              <li>Have adopted and reasonably implemented a repeat infringer policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cooperation with Platforms</h2>
            <p className="text-gray-700 mb-4">
              We actively cooperate with content platforms to respect their copyright policies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Respect platform-specific download restrictions</li>
              <li>Honor Content ID and copyright detection systems</li>
              <li>Report suspicious activity to relevant platforms</li>
              <li>Maintain direct communication channels for compliance issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. False Claims and Perjury</h2>
            <Alert>
              <AlertDescription>
                <strong>Warning:</strong> Submitting false DMCA claims is perjury and may result in 
                liability for damages, including attorney fees. Only submit claims for content you 
                own or are authorized to represent.
              </AlertDescription>
            </Alert>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. International Copyright</h2>
            <p className="text-gray-700 mb-4">
              We respect international copyright laws and treaties:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Compliance with Berne Convention standards</li>
              <li>Recognition of copyright in all member countries</li>
              <li>Cooperation with international enforcement efforts</li>
              <li>Respect for moral rights where applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Educational Resources</h2>
            <p className="text-gray-700 mb-4">
              We encourage users to understand copyright law:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><a href="https://www.copyright.gov" className="text-blue-600 hover:underline">U.S. Copyright Office</a></li>
              <li><a href="https://fairuse.stanford.edu" className="text-blue-600 hover:underline">Stanford Fair Use Project</a></li>
              <li><a href="https://creativecommons.org" className="text-blue-600 hover:underline">Creative Commons</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Our DMCA Agent</h2>
            <div className="bg-gray-50 p-6 rounded-md">
              <p className="text-gray-700 mb-4"><strong>Designated DMCA Agent:</strong></p>
              <p className="text-gray-700">
                <Mail className="inline h-4 w-4 mr-1" />
                <strong>Email:</strong> dmca@videoparser.com<br />
                <strong>Name:</strong> [DMCA Agent Name]<br />
                <strong>Address:</strong> [Your Business Address]<br />
                <strong>Phone:</strong> [Phone Number]<br />
                <strong>Fax:</strong> [Fax Number if applicable]
              </p>
              <p className="text-sm text-gray-500 mt-4">
                This agent is registered with the U.S. Copyright Office as our designated agent 
                for receiving DMCA notifications.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              This DMCA policy is effective as of {new Date().toLocaleDateString()}
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