import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { PrismaClient } from '@prisma/client'
import { createPortalSession } from '@/lib/stripe'
import { env } from '@/lib/env'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user subscription data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Create portal session
    const session = await createPortalSession(
      user.subscription.stripeCustomerId,
      `${env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    console.error('Portal creation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}