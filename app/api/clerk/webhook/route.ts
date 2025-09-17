import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Webhook } from 'svix'
import { env } from '@/lib/env'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = request.headers

    const webhook = new Webhook(env.CLERK_SECRET_KEY)
    
    let event
    try {
      event = webhook.verify(body, {
        'svix-id': headers.get('svix-id') || '',
        'svix-timestamp': headers.get('svix-timestamp') || '',
        'svix-signature': headers.get('svix-signature') || '',
      })
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const { type, data } = event as { type: string; data: any }

    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break
      
      case 'user.updated':
        await handleUserUpdated(data)
        break
      
      case 'user.deleted':
        await handleUserDeleted(data)
        break
      
      default:
        console.log('Unhandled webhook type:', type)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  try {
    const email = userData.email_addresses?.find((e: any) => e.id === userData.primary_email_address_id)?.email_address
    
    if (!email) {
      console.error('No email found for user:', userData.id)
      return
    }

    // Create user record
    const user = await prisma.user.create({
      data: {
        clerkId: userData.id,
        email,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'active',
          }
        },
        usage: {
          create: {
            month: new Date().toISOString().slice(0, 7), // YYYY-MM
            parses: 0,
            downloads: 0,
          }
        }
      }
    })

    console.log('User created:', user.id)

  } catch (error) {
    console.error('Error creating user:', error)
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const email = userData.email_addresses?.find((e: any) => e.id === userData.primary_email_address_id)?.email_address
    
    if (!email) {
      console.error('No email found for user:', userData.id)
      return
    }

    // Update user record
    await prisma.user.upsert({
      where: { clerkId: userData.id },
      update: { email },
      create: {
        clerkId: userData.id,
        email,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'active',
          }
        },
        usage: {
          create: {
            month: new Date().toISOString().slice(0, 7),
            parses: 0,
            downloads: 0,
          }
        }
      }
    })

    console.log('User updated:', userData.id)

  } catch (error) {
    console.error('Error updating user:', error)
  }
}

async function handleUserDeleted(userData: any) {
  try {
    // Delete user and all related data (cascade deletes will handle the rest)
    await prisma.user.delete({
      where: { clerkId: userData.id }
    })

    console.log('User deleted:', userData.id)

  } catch (error) {
    console.error('Error deleting user:', error)
  }
}