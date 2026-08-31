import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { CartProvider } from "@/components/cart-provider";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Storefront — ar-ecommerce-platform",
  description: "Demo storefront for the ar-ecommerce-platform microservices backend.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CartProvider>
          <Nav email={session?.subject ?? null} />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
