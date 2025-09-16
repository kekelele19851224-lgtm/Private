import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { PrismaClient } from '@prisma/client'
import { getSubscription } from '@/lib/stripe'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user subscription from database
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

    let subscriptionData = null

    // If user has a Stripe subscription, get the latest data
    if (user.subscription?.stripeSubId) {
      const stripeSubscription = await getSubscription(user.subscription.stripeSubId)
      
      if (stripeSubscription) {
        subscriptionData = {
          id: user.subscription.id,
          plan: user.subscription.plan,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          stripeSubId: stripeSubscription.id,
        }
      }
    } else if (user.subscription) {
      // User has a database subscription (e.g., FREE plan)
      subscriptionData = {
        id: user.subscription.id,
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        stripeSubId: null,
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    
    return NextResponse.json(
      { error: 'Failed to retrieve subscription' },
      { status: 500 }
    )
  }
}