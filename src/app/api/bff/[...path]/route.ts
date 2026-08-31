import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const GATEWAY = process.env.GATEWAY_URL ?? "http://localhost:8080";

// Catch-all authenticated proxy. The browser calls /api/bff/orders, this attaches
// the bearer token from the httpOnly cookie and forwards to the gateway's
// /api/orders. Only a short allow-list of paths is permitted.
const ALLOW = [
  /^orders(\?.*)?$/,
  /^orders\/\d+$/,
  /^products(\?.*)?$/,
  /^products\/\d+$/,
  /^inventory\/\d+$/,
  /^payments\/\d+$/,
  /^notifications(\?.*)?$/,
];

async function forward(req: NextRequest, path: string[]) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "NO_SESSION" }, { status: 401 });
  }

  const search = req.nextUrl.search;
  const rel = path.join("/") + search;
  if (!ALLOW.some((re) => re.test(rel))) {
    return NextResponse.json({ code: "FORBIDDEN_PATH" }, { status: 403 });
  }

  const init: RequestInit = {
    method: req.method,
    headers: {
      Authorization: `Bearer ${session.token}`,
      Accept: "application/json",
    },
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(`${GATEWAY}/api/${rel}`, init);
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
