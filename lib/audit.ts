import { prisma } from "@/lib/db";
import { toJsonString, JsonLike } from "./serialize";

type AuditAction = "parse" | "download" | "upload" | "subscription_change";

export interface AuditLogData {
  userId: string
  action: AuditAction
  platform?: string
  url?: string
  success: boolean
  details?: JsonLike
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  const { details, ...rest } = data;
  const detailsStr = toJsonString(details);

  // 容错：审计失败不能影响主流程
  try {
    await prisma.auditLog.create({
      data: { ...rest, details: detailsStr },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

// 新的统一封装函数
export async function writeAuditLog(args: {
  userId: string;
  action: AuditAction;
  platform?: string | null;
  url?: string | null;
  success: boolean;
  details?: JsonLike;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const { details, ...rest } = args;
  const detailsStr = toJsonString(details);

  // 容错：审计失败不能影响主流程
  try {
    await prisma.auditLog.create({
      data: { ...rest, details: detailsStr },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}

export async function getAuditLogs(
  userId: string,
  filters?: {
    action?: string
    platform?: string
    success?: boolean
    limit?: number
    offset?: number
  }
) {
  const where: any = { userId }
  
  if (filters?.action) where.action = filters.action
  if (filters?.platform) where.platform = filters.platform
  if (filters?.success !== undefined) where.success = filters.success
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    select: {
      id: true,
      action: true,
      platform: true,
      url: true,
      success: true,
      details: true,
      createdAt: true,
    },
  })
}

export async function getAuditStats(userId: string) {
  const stats = await prisma.auditLog.groupBy({
    by: ['action', 'success'],
    where: { userId },
    _count: true,
  })
  
  const result = {
    totalActions: 0,
    successfulActions: 0,
    failedActions: 0,
    byAction: {} as Record<string, { total: number; successful: number; failed: number }>,
  }
  
  stats.forEach(stat => {
    result.totalActions += stat._count
    
    if (stat.success) {
      result.successfulActions += stat._count
    } else {
      result.failedActions += stat._count
    }
    
    if (!result.byAction[stat.action]) {
      result.byAction[stat.action] = { total: 0, successful: 0, failed: 0 }
    }
    
    result.byAction[stat.action].total += stat._count
    if (stat.success) {
      result.byAction[stat.action].successful += stat._count
    } else {
      result.byAction[stat.action].failed += stat._count
    }
  })
  
  return result
}

// Clean up old audit logs (run as cron job)
export async function cleanupOldAuditLogs(daysToKeep = 90): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })
}

// Security monitoring - detect suspicious patterns
export async function detectSuspiciousActivity(userId: string): Promise<{
  isSupicious: boolean
  reasons: string[]
}> {
  const reasons: string[] = []
  
  // Check for rapid requests in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentRequests = await prisma.auditLog.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  })
  
  if (recentRequests > 50) {
    reasons.push('Excessive requests in the last hour')
  }
  
  // Check for high failure rate
  const recentFailures = await prisma.auditLog.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
      success: false,
    },
  })
  
  if (recentRequests > 0 && (recentFailures / recentRequests) > 0.8) {
    reasons.push('High failure rate indicating potential abuse')
  }
  
  // Check for requests from multiple IPs in short time
  const recentIPs = await prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
      ipAddress: { not: null },
    },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  })
  
  if (recentIPs.length > 5) {
    reasons.push('Requests from multiple IP addresses')
  }
  
  return {
    isSupicious: reasons.length > 0,
    reasons,
  }
}