'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Settings } from 'lucide-react'

interface BillingPortalButtonProps {
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function BillingPortalButton({ 
  children,
  variant = 'outline',
  size = 'default',
  className
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePortal}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children || (
          <>
            <Settings className="h-4 w-4 mr-2" />
            Manage Billing
          </>
        )
      )}
    </Button>
  )
}