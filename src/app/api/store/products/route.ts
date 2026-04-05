import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveAutomaticDiscounts, applyDiscountToProduct } from "@/lib/discounts";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandSlug     = searchParams.get("brand");
    const categorySlug  = searchParams.get("category");
    const productType   = searchParams.get("productType");
    const color         = searchParams.get("color");
    const disposability = searchParams.get("disposability");
    const search        = searchParams.get("search");
    const featured      = searchParams.get("featured");
    const page          = parseInt(searchParams.get("page") ?? "1");
    const limit         = parseInt(searchParams.get("limit") ?? "24");
    const skip          = (page - 1) * limit;

    const where = {
      status: "ACTIVE" as const,
      ...(productType  ? { productType: productType as any } : {}),
      ...(color        ? { color }                          : {}),
      ...(disposability? { disposability }                  : {}),
      ...(featured     ? { featured: true }                 : {}),
      ...(brandSlug    ? { brand:    { slug: brandSlug    } }: {}),
      ...(categorySlug ? { category: { slug: categorySlug } }: {}),
      ...(search ? {
        OR: [
          { title:       { contains: search } },
          { description: { contains: search } },
          { brand: { name: { contains: search } } },
        ],
      } : {}),
    };

    const [products, total, activeDiscounts] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand:    { select: { name: true, slug: true, id: true } },
          category: { select: { name: true, slug: true, id: true } },
          _count:   { select: { reviews: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      getActiveAutomaticDiscounts(),
    ]);

    // Compute effective comparePrice and price for each product
    const enriched = products.map((p) => applyDiscountToProduct(p, activeDiscounts));

    return NextResponse.json({ products: enriched, total, page, limit });
  } catch (err) {
    console.error("[GET /api/store/products]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
