import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { deleteImage } from "@/lib/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { name, slug, parentId, brandId, image } = await req.json();
    const { id } = await params;

    let finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Ensure uniqueness
    const slugExists = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (slugExists && slugExists.id !== id) {
      const suffix = Math.random().toString(36).substring(2, 6);
      finalSlug = `${finalSlug}-${suffix}`;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        image: image || null,
        parentId: parentId || null,
        brandId: brandId || null,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });
    if (category.image) {
      await deleteImage(category.image);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
