import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveProductPhoto } from "@/lib/images";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const productId = form.get("productId");

  if (!(file instanceof File) || typeof productId !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    const url = await saveProductPhoto(file);
    const image = await db.productImage.create({
      data: {
        productId,
        url,
        alt: product.name,
        position: product.images.length,
      },
    });
    return NextResponse.json({ id: image.id, url });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
