import { NextRequest, NextResponse } from "next/server";
import { prisma }        from "@/lib/db";
import { requireAdmin }  from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { searchParams } = new URL(req.url);
    const status   = searchParams.get("status");
    const brandId  = searchParams.get("brandId");
    const search   = searchParams.get("search");
    const page     = parseInt(searchParams.get("page") ?? "1");
    const limit    = parseInt(searchParams.get("limit") ?? "20");
    const skip     = (page - 1) * limit;

    const where = {
      ...(status  ? { status: status as "ACTIVE" | "DRAFT" | "ARCHIVED" } : {}),
      ...(brandId ? { brandId } : {}),
      ...(search  ? {
        OR: [
          { title:       { contains: search } },
          { description: { contains: search } },
        ],
      } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { brand: true, category: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        title:        body.title,
        slug:         body.slug,
        description:  body.description ?? null,
        productType:  body.productType,
        enableAddons: body.enableAddons !== undefined ? Boolean(body.enableAddons) : true,
        price:        parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        color:        body.color ?? null,
        disposability: body.disposability ?? null,
        inStock:      true, // Always true for now as requested
        stockCount:   parseInt(body.stockCount ?? "0"),
        images:       body.images ?? [],
        status:       body.status ?? "DRAFT",
        featured:     body.featured ?? false,
        brandId:      body.brandId ?? null,
        categoryId:   body.categoryId ?? null,
      },
      include: { brand: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
