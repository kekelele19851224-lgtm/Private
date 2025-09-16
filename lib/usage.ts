import { prisma } from '@/lib/db'

export async function getCurrentUsage(userId: string): Promise<{
  parses: number
  downloads: number
  month: string
}> {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  const usage = await prisma.usage.findUnique({
    where: {
      userId_month: {
        userId,
        month: currentMonth,
      },
    },
  })
  
  return {
    parses: usage?.parses || 0,
    downloads: usage?.downloads || 0,
    month: currentMonth,
  }
}

export async function incrementUsage(
  userId: string,
  type: 'parse' | 'download'
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  await prisma.usage.upsert({
    where: {
      userId_month: {
        userId,
        month: currentMonth,
      },
    },
    update: {
      [type === 'parse' ? 'parses' : 'downloads']: {
        increment: 1,
      },
    },
    create: {
      userId,
      month: currentMonth,
      parses: type === 'parse' ? 1 : 0,
      downloads: type === 'download' ? 1 : 0,
    },
  })
}

export async function getUsageLimits(subscription: 'FREE' | 'PRO'): Promise<{
  dailyParses: number
  dailyDownloads: number
  monthlyParses: number
  monthlyDownloads: number
}> {
  if (subscription === 'PRO') {
    return {
      dailyParses: 100,
      dailyDownloads: 20,
      monthlyParses: 3000,
      monthlyDownloads: 600,
    }
  }
  
  return {
    dailyParses: 10,
    dailyDownloads: 0, // Free users cannot download
    monthlyParses: 300,
    monthlyDownloads: 0,
  }
}

export async function checkUsageLimit(
  userId: string,
  type: 'parse' | 'download',
  subscription: 'FREE' | 'PRO'
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const usage = await getCurrentUsage(userId)
  const limits = await getUsageLimits(subscription)
  
  const current = type === 'parse' ? usage.parses : usage.downloads
  const limit = type === 'parse' ? limits.monthlyParses : limits.monthlyDownloads
  
  return {
    allowed: current < limit,
    current,
    limit,
  }
}

export async function getUserStats(userId: string): Promise<{
  currentMonth: {
    parses: number
    downloads: number
  }
  allTime: {
    totalParses: number
    totalDownloads: number
    firstParse?: Date
  }
  recentActivity: Array<{
    id: string
    platform: string
    title?: string
    createdAt: Date
  }>
}> {
  const currentUsage = await getCurrentUsage(userId)
  
  // Get all-time stats
  const allTimeStats = await prisma.usage.aggregate({
    where: { userId },
    _sum: {
      parses: true,
      downloads: true,
    },
  })
  
  // Get recent parse activity
  const recentActivity = await prisma.parseRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      platform: true,
      title: true,
      createdAt: true,
    },
  })
  
  // Get first parse date
  const firstParse = await prisma.parseRecord.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  })
  
  return {
    currentMonth: {
      parses: currentUsage.parses,
      downloads: currentUsage.downloads,
    },
    allTime: {
      totalParses: allTimeStats._sum.parses || 0,
      totalDownloads: allTimeStats._sum.downloads || 0,
      firstParse: firstParse?.createdAt,
    },
    recentActivity,
  }
}

// Clean up old usage records (run this as a cron job)
export async function cleanupOldUsage(): Promise<void> {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const cutoffMonth = sixMonthsAgo.toISOString().slice(0, 7)
  
  await prisma.usage.deleteMany({
    where: {
      month: {
        lt: cutoffMonth,
      },
    },
  })
}