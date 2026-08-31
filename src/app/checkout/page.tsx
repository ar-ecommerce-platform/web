"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";

export default function CheckoutPage() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  async function placeOrder() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/bff/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    setBusy(false);
    const body = await res.json().catch(() => null);

    if (res.ok) {
      setOrder(body as Order);
      clear();
    } else if (res.status === 409) {
      setError("Some items are out of stock (REJECTED_STOCK).");
    } else if (res.status === 402) {
      setError("Payment was declined (PAYMENT_FAILED).");
    } else {
      setError(body?.message ?? "Could not place the order.");
    }
  }

  if (order) {
    return (
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold text-[hsl(var(--success))]">
          Order #{order.id} — {order.status}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Total {money(order.totalCents)} · payment #{order.paymentId}
        </p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          View my orders
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Nothing to check out.
      </p>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <ul className="mt-4 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i.productId} className="flex justify-between">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{money(i.priceCents * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
        <span>Total</span>
        <span>{money(totalCents)}</span>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-6 w-full" disabled={busy} onClick={placeOrder}>
        {busy ? "Placing order…" : "Place order"}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Orders over $5,000 are declined by the demo payment service; product 5 is
        seeded low to demo the out-of-stock path.
      </p>
    </div>
  );
}
