"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";

export function Nav({ email }: { email: string | null }) {
  const { count } = useCart();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          ar<span className="text-muted-foreground">/store</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="rounded px-2 py-1 hover:bg-muted">
            Catalog
          </Link>
          <Link href="/orders" className="rounded px-2 py-1 hover:bg-muted">
            Orders
          </Link>
          <Link
            href="/cart"
            className="relative rounded px-2 py-1 hover:bg-muted"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {email ? (
            <>
              <span className="hidden px-2 text-muted-foreground sm:inline">
                {email}
              </span>
              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
