/**
 * Demo-produkter – visas om API returnerar tom lista.
 * Bilder från showroom så utseendet matchar den statiska sidan.
 */

import type { ProductDto } from "@/lib/api-contract/types";

export const DEMO_PRODUCTS: ProductDto[] = [
  {
    id: "demo-1",
    name: "Typ 1: Abaya malaysian",
    slug: "abaya-malaysian",
    description: "Abaya Malaysia med över- och underdel.",
    priceCents: 60000,
    imageUrl: "/images/abaya_brun.jpg",
    categoryId: "cat-klanningar",
    category: { id: "cat-klanningar", name: "Klänningar", slug: "klanningar" },
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Typ 2: Abaya lövdekor",
    slug: "abaya-lovdekor",
    description: "Abaya öppen, lövdekoration.",
    priceCents: 60000,
    imageUrl: "/images/abaya_beige_dekor.jpg",
    categoryId: "cat-klanningar",
    category: { id: "cat-klanningar", name: "Klänningar", slug: "klanningar" },
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Typ 3: Abaya blomsterdekor",
    slug: "abaya-blomsterdekor",
    description: "Abaya blomsterdekor.",
    priceCents: 60000,
    imageUrl: "/images/abaya_green_blomst_dekor.jpg",
    categoryId: "cat-klanningar",
    category: { id: "cat-klanningar", name: "Klänningar", slug: "klanningar" },
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
