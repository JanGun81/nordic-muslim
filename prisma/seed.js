/**
 * Seed – kategorier, abaya-produkter och färgvarianter.
 * Kör: npx prisma db seed (eller node prisma/seed.js efter db push)
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  { name: "Dirac", slug: "dirac", description: "Somaliska dirac – vardag och fest" },
  { name: "Baatis", slug: "baatis", description: "Baatis och traditionella plagg" },
  { name: "Klänningar", slug: "klanningar", description: "Abayas och klänningar" },
];

const products = [
  {
    name: "Typ 1: Abaya malaysian",
    slug: "abaya-malaysian",
    description: "Abaya Malaysia med över- och underdel.",
    priceCents: 60000,
    categorySlug: "klanningar",
    imageUrl: "/images/abaya_brun.jpg",
    variants: [
      { color: "Brun", size: "54-58", imageUrl: "/images/abaya_brun.jpg" },
      { color: "Grön", size: "54-58", imageUrl: "/images/abaya_green.jpg" },
      { color: "Lila", size: "54-58", imageUrl: "/images/abaya_purple.jpg" },
    ],
  },
  {
    name: "Typ 2: Abaya lövdekor",
    slug: "abaya-lovdekor",
    description: "Abaya öppen, lövdekoration.",
    priceCents: 60000,
    categorySlug: "klanningar",
    imageUrl: "/images/abaya_beige_dekor.jpg",
    variants: [
      { color: "Beige", size: "54-58", imageUrl: "/images/abaya_beige_dekor.jpg" },
      { color: "Rosa", size: "54-58", imageUrl: "/images/abaya_pink_dekor.jpg" },
    ],
  },
  {
    name: "Typ 3: Abaya blomsterdekor",
    slug: "abaya-blomsterdekor",
    description: "Abaya blomsterdekor.",
    priceCents: 60000,
    categorySlug: "klanningar",
    imageUrl: "/images/abaya_green_blomst_dekor.jpg",
    variants: [
      { color: "Grön", size: "54-58", imageUrl: "/images/abaya_green_blomst_dekor.jpg" },
      { color: "Mörkblå", size: "54-58", imageUrl: "/images/abaya_dark_blue_blomst_dekor.jpg" },
    ],
  },
];

async function main() {
  const created = {};
  for (const c of categories) {
    created[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, description: c.description },
    });
  }
  for (const p of products) {
    const cat = created[p.categorySlug];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        categoryId: cat.id,
      },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        categoryId: cat.id,
      },
    });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          color: v.color,
          size: v.size,
          imageUrl: v.imageUrl,
        },
      });
    }
  }
  console.log("Seed klar: kategorier, 3 abayas och färgvarianter.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
