import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { createCheckoutSession, createStripeCustomer, STRIPE_PLANS } from '@/lib/stripe'
import { env } from '@/lib/env'

const prisma = new PrismaClient()

const checkoutRequestSchema = z.object({
  plan: z.enum(['PRO']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parseResult = checkoutRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.format() },
        { status: 400 }
      )
    }

    const { plan, successUrl, cancelUrl } = parseResult.data

    // Get user data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    if (user.subscription?.status === 'active' && user.subscription?.plan === 'PRO') {
      return NextResponse.json(
        { error: 'User already has an active PRO subscription' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, user.id)
      stripeCustomerId = customer.id

      // Update subscription record with customer ID
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId },
        create: {
          userId: user.id,
          plan: 'FREE',
          status: 'inactive',
          stripeCustomerId,
        },
      })
    }

    // Create checkout session
    const planConfig = STRIPE_PLANS[plan]
    const baseUrl = env.NEXT_PUBLIC_APP_URL

    const session = await createCheckoutSession(
      stripeCustomerId,
      planConfig.priceId,
      successUrl || `${baseUrl}/dashboard?checkout=success`,
      cancelUrl || `${baseUrl}/pricing?checkout=canceled`
    )

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}