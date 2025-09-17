"use server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in?redirect_url=/pricing");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

  // 兼容 priceId 或 lookupKey
  const priceId = process.env.STRIPE_PRICE_ID;
  const lookupKey = process.env.STRIPE_PRICE_LOOKUP_KEY;
  let price = priceId as string | undefined;
  if (!price && lookupKey) {
    const { data } = await stripe.prices.list({ lookup_keys: [lookupKey] });
    price = data[0]?.id;
  }
  if (!price) throw new Error("Missing STRIPE_PRICE_ID / STRIPE_PRICE_LOOKUP_KEY");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    client_reference_id: userId,
    metadata: { clerkUserId: userId },
    allow_promotion_codes: true
  });

  redirect(session.url!);
}