import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  
  // Create a test user (you'll need to update this with a real Clerk user ID)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      clerkId: 'test_clerk_id',
      email: 'test@example.com',
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

  console.log('Test user created:', testUser)
  
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })