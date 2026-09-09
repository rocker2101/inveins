import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart/form-data (Direct Phone Gallery upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file || file.size === 0) {
        return NextResponse.json(
          { success: false, message: "No image file provided." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadToCloudinary(buffer, "inveins_products");
      return NextResponse.json({
        success: true,
        message: "Photo uploaded to Cloudinary successfully!",
        url: result.url,
      });
    }

    // 2. Handle base64 JSON payload (Client Canvas compressed)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { imageBase64 } = body;

      if (!imageBase64) {
        return NextResponse.json(
          { success: false, message: "imageBase64 string is required." },
          { status: 400 }
        );
      }

      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches && matches[2]
        ? Buffer.from(matches[2], "base64")
        : Buffer.from(imageBase64, "base64");

      const result = await uploadToCloudinary(buffer, "inveins_products");
      return NextResponse.json({
        success: true,
        message: "Photo uploaded to Cloudinary successfully!",
        url: result.url,
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported content type." },
      { status: 415 }
    );
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to upload photo to Cloudinary." },
      { status: 500 }
    );
  }
}
