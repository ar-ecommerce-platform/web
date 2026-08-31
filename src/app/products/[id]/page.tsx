import { notFound } from "next/navigation";
import { getProduct, getInventory, GatewayError } from "@/lib/api";
import { getSession } from "@/lib/session";
import { money } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Sign in to view this product.</p>
        <Link href={`/login?next=/products/${id}`} className="mt-4 inline-block">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  let product;
  try {
    product = await getProduct(id);
  } catch (e) {
    if (e instanceof GatewayError && e.status === 404) notFound();
    throw e;
  }

  const stock = await getInventory(id).catch(() => null);

  return (
    <article className="max-w-xl">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Catalog
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-2 text-muted-foreground">{product.description}</p>
      <p className="mt-1 text-xs text-muted-foreground">SKU {product.sku}</p>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xl font-semibold">{money(product.priceCents)}</span>
        {stock && (
          <span
            className={
              stock.quantityAvailable > 0
                ? "text-sm text-[hsl(var(--success))]"
                : "text-sm text-destructive"
            }
          >
            {stock.quantityAvailable > 0
              ? `${stock.quantityAvailable} in stock`
              : "Out of stock"}
          </span>
        )}
      </div>

      <div className="mt-6">
        <AddToCart product={product} />
      </div>
    </article>
  );
}
