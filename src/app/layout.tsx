import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CategoryNavRail } from "@/components/CategoryNavRail";

export const metadata: Metadata = {
  title: "Nordic Muslim",
  description:
    "Nordic Muslim – muslimska kläder för alla tillfällen. Baati, Dirac, Macwiis, Khamis, klänningar och sjalar.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3f3530",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="min-h-screen lg:pl-56">
        <CartProvider>{children}</CartProvider>
        <Suspense fallback={null}>
          <CategoryNavRail />
        </Suspense>
      </body>
    </html>
  );
}
