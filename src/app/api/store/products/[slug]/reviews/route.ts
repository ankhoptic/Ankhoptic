import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { name, rating, heading, text, customerMeta, image } = body;

    if (!name || !rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating or missing name." },
        { status: 400 }
      );
    }

    // Find the product id from the slug
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create the review, initially unapproved
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        name,
        rating,
        heading: heading || null,
        text: text || null,
        customerMeta: customerMeta || null,
        image: image || null,
        approved: false, // Default to false
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/store/products/[slug]/reviews]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
