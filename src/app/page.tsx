import Link from "next/link";
import { getSession } from "@/lib/session";
import { listProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export default async function CatalogPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-semibold">The storefront demo</h1>
        <p className="mt-2 text-muted-foreground">
          A React/Next front end for the ar-ecommerce-platform microservices:
          browse the catalog, place an order, watch it flow through inventory,
          payment and notifications.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const products = await listProducts();

  return (
    <div>
      <h1 className="text-xl font-semibold">Catalog</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
