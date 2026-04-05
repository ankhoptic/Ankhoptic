import { NextRequest, NextResponse } from "next/server";
import { prisma }        from "@/lib/db";
import { requireAdmin }  from "@/lib/requireAdmin";
import { deleteImage }   from "@/lib/cloudinary";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand:        true,
        category:     true,
        powerOptions: { orderBy: { position: "asc" } },
        reviews:      {
          where:   { approved: true },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take:    10,
        },
      },
    });

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { id } = await params;
    const body = await req.json();

    // Type corrections logic similar to POST if needed, but for now just handle what's needed:
    if (body.enableAddons !== undefined) {
      body.enableAddons = Boolean(body.enableAddons);
    }
    
    // Enforce inStock = true as requested
    body.inStock = true;

    const product = await prisma.product.update({
      where: { id },
      data:  body,
      include: { brand: true, category: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error("Failed to update product:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    // Delete all images associated with the product from Cloudinary
    if (product.images && Array.isArray(product.images)) {
      await Promise.all(
        product.images.map((img: unknown) => typeof img === "string" ? deleteImage(img) : Promise.resolve())
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
