import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

function mapStatus(s: string) {
  // 简化映射
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid" || s === "incomplete" || s === "incomplete_expired") return "past_due";
  if (s === "canceled") return "canceled";
  return s;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;
  let evt: Stripe.Event;

  try {
    evt = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  // 统一取关键信息
  const handleUpsert = async (args: {
    clerkUserId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    status?: string | null;
    currentPeriodEnd?: number | null; // unix seconds
  }) => {
    const { clerkUserId, customerId, subscriptionId, status, currentPeriodEnd } = args;

    if (!clerkUserId && !customerId) return;

    // 如果没有 clerkUserId，但有 customerId，可以在此处按需建立映射表；此处先跳过
    if (!clerkUserId) return;

    // 确保 User 存在
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {},
      create: { clerkId: clerkUserId, email: "" } // 邮箱可在别处补充
    });

    // Upsert 订阅
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: "PRO",
        status: mapStatus(status ?? "active"),
        stripeCustomerId: customerId ?? undefined,
        stripeSubId: subscriptionId ?? undefined,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined
      },
      update: {
        plan: "PRO",
        status: mapStatus(status ?? "active"),
        stripeCustomerId: customerId ?? undefined,
        stripeSubId: subscriptionId ?? undefined,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined
      }
    });
  };

  try {
    switch (evt.type) {
      case "checkout.session.completed": {
        const s = evt.data.object as Stripe.Checkout.Session;
        await handleUpsert({
          clerkUserId: (s.metadata as any)?.clerkUserId || s.client_reference_id || null,
          customerId: (s.customer as string) || null,
          subscriptionId: (s.subscription as string) || null,
          status: "active"
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = evt.data.object as Stripe.Subscription;
        await handleUpsert({
          clerkUserId: (sub.metadata as any)?.clerkUserId || null,
          customerId: (sub.customer as string) || null,
          subscriptionId: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ?? null
        });
        break;
      }
      case "invoice.paid": {
        const inv = evt.data.object as Stripe.Invoice;
        // 可选：续费时刷新 currentPeriodEnd
        const sub = inv.subscription as string | null;
        if (sub && inv.customer) {
          await handleUpsert({
            clerkUserId: (inv.metadata as any)?.clerkUserId || null,
            customerId: inv.customer as string,
            subscriptionId: sub,
            status: "active"
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = evt.data.object as Stripe.Subscription;
        const userId = (sub.metadata as any)?.clerkUserId || null;
        if (userId) {
          const user = await prisma.user.findUnique({ where: { clerkId: userId } });
          if (user) {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: { status: "canceled", plan: "FREE" }
            }).catch(() => {});
          }
        }
        break;
      }
    }
  } catch (e: any) {
    return new NextResponse(`Webhook handler error: ${e.message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
