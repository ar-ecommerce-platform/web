"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { items, totalCents, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Your cart is empty.{" "}
        <Link href="/" className="underline">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Cart</h1>
      <ul className="mt-4 divide-y divide-border">
        {items.map((i) => (
          <li key={i.productId} className="flex items-center gap-4 py-3">
            <div className="flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-muted-foreground">
                {money(i.priceCents)} each
              </p>
            </div>
            <Input
              type="number"
              min={1}
              value={i.quantity}
              onChange={(e) => setQty(i.productId, Number(e.target.value))}
              className="w-20"
            />
            <span className="w-24 text-right font-medium">
              {money(i.priceCents * i.quantity)}
            </span>
            <button
              onClick={() => remove(i.productId)}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-lg font-semibold">{money(totalCents)}</span>
        <Link href="/checkout">
          <Button>Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
