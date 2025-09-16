import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="font-semibold text-lg">VideoParser</Link>
      <nav className="flex items-center gap-3">
        <SignedIn>
          <Link href="/dashboard" className="text-sm">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="text-sm">Sign In</Link>
          <Button asChild size="sm">
            <Link href="/sign-up?redirect_url=/app/parse">Get Started</Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  );
}