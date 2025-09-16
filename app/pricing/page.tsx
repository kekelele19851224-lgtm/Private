import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star } from 'lucide-react'
import { createCheckoutSession } from './actions'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      interval: 'forever',
      description: 'Perfect for getting started with video metadata extraction',
      features: [
        '10 parses per day',
        'Basic metadata extraction',
        'Platform compliance checks',
        'Embed previews',
        'Community support',
      ],
      limitations: [
        'No download functionality',
        'Limited parse history',
        'No API access',
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const,
      href: '/sign-up',
    },
    {
      name: 'Pro',
      price: '$9.99',
      interval: 'month',
      description: 'Full access to all features with higher limits and download capabilities',
      features: [
        '100 parses per day',
        'Download permitted content',
        'Full metadata extraction',
        'Priority support',
        'API access',
        'Batch processing',
        'Advanced analytics',
        'Compliance reporting',
      ],
      limitations: [],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default' as const,
      href: '/sign-up',
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              VideoParser
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include full compliance features 
            and respect for platform terms of service.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-4">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-3">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-4">
                  {plan.name === 'Pro' ? (
                    <form action={createCheckoutSession}>
                      <Button 
                        type="submit"
                        variant={plan.buttonVariant} 
                        size="lg" 
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </form>
                  ) : (
                    <Link href={plan.href} className="block">
                      <Button 
                        variant={plan.buttonVariant} 
                        size="lg" 
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compliance Notice */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Compliance Guarantee</h3>
          <p className="text-blue-800">
            All plans include our commitment to platform compliance and copyright respect. 
            Downloads are only enabled for content that explicitly permits third-party access, 
            and we maintain full audit logs for transparency.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What platforms do you support?
              </h3>
              <p className="text-gray-600">
                We support metadata extraction from major platforms including YouTube, TikTok, 
                Vimeo, and others. Downloads are only available when explicitly permitted by 
                platform policies and content licenses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How do you ensure compliance?
              </h3>
              <p className="text-gray-600">
                We maintain strict adherence to platform terms of service and copyright laws. 
                Our system checks platform policies and content licenses before enabling any 
                download functionality.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your Pro subscription at any time. Your access will continue 
                until the end of your current billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your parse history and metadata remain accessible. However, download functionality 
                will be disabled, and you'll be subject to the free tier's usage limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}