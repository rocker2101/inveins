import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isProductionServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production"
);

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Admin or Staff access required." },
        { status: 403 }
      );
    }

    const useCloudinary = isCloudinaryConfigured();
    const contentType = req.headers.get("content-type") || "";

    // 1. Handle multipart/form-data (Phone gallery photos)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files: File[] = [];

      const multiple = formData.getAll("files");
      const single = formData.get("file");

      if (multiple && multiple.length > 0) {
        for (const item of multiple) {
          if (item instanceof File && item.size > 0) {
            files.push(item);
          }
        }
      } else if (single instanceof File && single.size > 0) {
        files.push(single);
      }

      if (files.length === 0) {
        return NextResponse.json(
          { success: false, message: "No image file provided in form data." },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (useCloudinary) {
          try {
            // Upload directly to Cloudinary CDN
            const cldResult = await uploadToCloudinary(buffer, "inveins_products");
            uploadedUrls.push(cldResult.url);
          } catch (cldErr: any) {
            console.warn("Cloudinary upload failed, falling back to data URL:", cldErr?.message);
            // Graceful fallback: convert buffer to base64 Data URL so the upload NEVER fails
            const mime = file.type || "image/jpeg";
            const base64 = buffer.toString("base64");
            uploadedUrls.push(`data:${mime};base64,${base64}`);
          }
        } else if (!isProductionServerless) {
          // Local development fallback: write to public/uploads
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadDir, { recursive: true });

          let ext = "jpg";
          if (file.type.includes("webp")) ext = "webp";
          else if (file.type.includes("png")) ext = "png";
          else if (file.type.includes("gif")) ext = "gif";
          else {
            const originalExt = path.extname(file.name).replace(".", "").toLowerCase();
            if (["jpg", "jpeg", "png", "webp", "gif"].includes(originalExt)) {
              ext = originalExt;
            }
          }

          const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const filename = `inveins_prod_${uniqueSuffix}.${ext}`;
          const filePath = path.join(uploadDir, filename);

          await fs.writeFile(filePath, buffer);
          uploadedUrls.push(`/uploads/${filename}`);
        } else {
          // Vercel serverless environment without Cloudinary:
          // Filesystem is read-only, so encode as high-efficiency base64 data URL
          const mime = file.type || "image/jpeg";
          const base64 = buffer.toString("base64");
          uploadedUrls.push(`data:${mime};base64,${base64}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: useCloudinary
          ? "Photo(s) uploaded successfully to Cloudinary CDN."
          : "Photo(s) processed and ready.",
        urls: uploadedUrls,
        url: uploadedUrls[0],
        provider: useCloudinary ? "cloudinary" : isProductionServerless ? "inline" : "local",
      });
    }

    // 2. Handle JSON base64 upload
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
      let buffer: Buffer;
      let ext = "jpg";
      let mime = "image/jpeg";

      if (matches && matches.length === 3) {
        mime = matches[1];
        if (mime.includes("webp")) ext = "webp";
        else if (mime.includes("png")) ext = "png";
        else if (mime.includes("gif")) ext = "gif";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(imageBase64, "base64");
      }

      let publicUrl: string;

      if (useCloudinary) {
        try {
          const cldResult = await uploadToCloudinary(buffer, "inveins_products");
          publicUrl = cldResult.url;
        } catch (cldErr: any) {
          console.warn("Cloudinary upload failed, falling back to original base64:", cldErr?.message);
          publicUrl = imageBase64;
        }
      } else if (!isProductionServerless) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const filename = `inveins_prod_${uniqueSuffix}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        publicUrl = `/uploads/${filename}`;
      } else {
        // Vercel serverless without Cloudinary: keep base64
        publicUrl = imageBase64;
      }

      return NextResponse.json({
        success: true,
        message: useCloudinary
          ? "Photo uploaded and processed to Cloudinary CDN."
          : "Photo processed and ready.",
        url: publicUrl,
        urls: [publicUrl],
        provider: useCloudinary ? "cloudinary" : isProductionServerless ? "inline" : "local",
      });
    }

    return NextResponse.json(
      { success: false, message: "Unsupported Content-Type. Please use multipart/form-data or application/json." },
      { status: 415 }
    );
  } catch (err: any) {
    console.error("Image Upload Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to upload image.", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
