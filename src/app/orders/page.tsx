import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { myOrders, myNotifications } from "@/lib/api";
import { money, dateTime } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  CONFIRMED: "text-[hsl(var(--success))]",
  PENDING: "text-muted-foreground",
  REJECTED_STOCK: "text-destructive",
  PAYMENT_FAILED: "text-destructive",
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/orders");

  const [orders, notifications] = await Promise.all([
    myOrders(session.subject),
    myNotifications(session.subject).catch(() => []),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Your orders</h1>

      {orders.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Order #{o.id}</span>
                <span className={STATUS_STYLE[o.status]}>{o.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateTime(o.createdAt)} · {money(o.totalCents)}
                {o.paymentId ? ` · payment #${o.paymentId}` : ""}
              </p>
              <ul className="mt-2 text-sm">
                {o.lines.map((l) => (
                  <li key={l.productId} className="flex justify-between">
                    <span>
                      product {l.productId} × {l.quantity}
                    </span>
                    <span>{money(l.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {notifications.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold">Notifications</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {notifications.map((n) => (
              <li key={n.id}>
                <span className="font-mono text-xs">{n.type}</span> — {n.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
