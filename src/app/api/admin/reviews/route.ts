import { NextRequest, NextResponse } from "next/server";
import { prisma }        from "@/lib/db";
import { requireAdmin }  from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { title: true, slug: true } },
      }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const data = await req.json();
    const { rating, heading, text, name, customerMeta, image, productId, approved, isFeatured } = data;

    if (!text || !name || !productId) {
      return NextResponse.json({ error: "Text, name, and productId are required" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        name,
        customerMeta,
        image,
        rating: Number(rating) || 5,
        heading,
        text,
        approved: approved !== undefined ? approved : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
