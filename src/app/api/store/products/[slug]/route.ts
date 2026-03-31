import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveAutomaticDiscounts, applyDiscountToProduct } from "@/lib/discounts";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [product, activeDiscounts] = await Promise.all([
      prisma.product.findFirst({
        where: { slug, status: "ACTIVE" },
        include: {
          brand:        { select: { name: true, slug: true, id: true } },
          category:     { select: { name: true, slug: true, id: true } },
          powerOptions: { orderBy: { position: "asc" } },
          reviews: {
            where:   { approved: true },
            select:  { id: true, name: true, rating: true, heading: true, text: true, customerMeta: true, image: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take:    10,
          },
          _count: { select: { reviews: { where: { approved: true } } } },
        },
      }),
      getActiveAutomaticDiscounts(),
    ]);

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const enriched = applyDiscountToProduct(product, activeDiscounts);
    return NextResponse.json(enriched);
  } catch (err) {
    console.error("[GET /api/store/products/[slug]]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
