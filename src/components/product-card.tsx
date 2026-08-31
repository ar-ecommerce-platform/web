import Link from "next/link";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCart } from "@/components/add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <Link href={`/products/${product.id}`} className="font-medium hover:underline">
        {product.name}
      </Link>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {product.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold">{money(product.priceCents)}</span>
        <AddToCart product={product} />
      </div>
    </div>
  );
}
