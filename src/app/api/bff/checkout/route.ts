import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const GATEWAY = process.env.GATEWAY_URL ?? "http://localhost:8080";

interface Line {
  productId: number;
  quantity: number;
}

// Places an order. The userId is taken from the session, never from the client -
// the browser only sends line items.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "NO_SESSION" }, { status: 401 });
  }

  const { items } = (await req.json().catch(() => ({}))) as { items?: Line[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { code: "EMPTY_CART", message: "No items" },
      { status: 400 },
    );
  }

  const res = await fetch(`${GATEWAY}/api/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: session.subject,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    }),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
