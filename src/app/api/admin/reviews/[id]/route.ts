import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const data = await req.json();
    const updateData: any = {};

    if (data.rating !== undefined) updateData.rating = Number(data.rating);
    if (data.heading !== undefined) updateData.heading = data.heading;
    if (data.text !== undefined) updateData.text = data.text;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.customerMeta !== undefined) updateData.customerMeta = data.customerMeta;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.productId !== undefined) updateData.productId = data.productId;
    if (data.approved !== undefined) updateData.approved = data.approved;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("PUT Review Error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const { id } = await params;
    await prisma.review.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Review Error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
