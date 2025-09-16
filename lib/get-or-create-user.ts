import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

export async function getOrCreateUser() {
  const { userId } = auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ 
    where: { clerkId: userId },
    include: { subscription: true }
  });
  if (user) return user;

  const clerk = await clerkClient.users.getUser(userId);
  const email =
    clerk.emailAddresses?.[0]?.emailAddress ??
    clerk.primaryEmailAddress?.emailAddress ??
    "";

  user = await prisma.user.create({
    data: { clerkId: userId, email }
  });

  await prisma.usage.create({
    data: { userId: user.id, month: currentMonth(), parses: 0, downloads: 0 }
  });

  return user;
}