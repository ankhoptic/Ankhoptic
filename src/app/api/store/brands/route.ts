import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "LENS" | "GLASSES" | "ACCESSORY" | null;

    const brands = await prisma.brand.findMany({
      where: type
        ? {
            products: {
              some: {
                productType: type,
              },
            },
          }
        : undefined,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        categories: {
          select: { id: true, name: true, slug: true },
          orderBy: { position: "asc" },
        },
      },
    });
    return NextResponse.json(brands);
  } catch (err) {
    console.error("[GET /api/store/brands]", err);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
