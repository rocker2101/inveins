import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json(
        { message: "Forbidden. Admin or Staff access required." },
        { status: 403 }
      );
    }

    const useCloudinary = isCloudinaryConfigured();
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!useCloudinary) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

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
          { message: "No image file provided in form data." },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (useCloudinary) {
          // Upload directly to Cloudinary CDN
          const cldResult = await uploadToCloudinary(buffer, "cothesis_products");
          uploadedUrls.push(cldResult.url);
        } else {
          // Fallback to local storage
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
          const filename = `cothesis_prod_${uniqueSuffix}.${ext}`;
          const filePath = path.join(uploadDir, filename);

          await fs.writeFile(filePath, buffer);
          uploadedUrls.push(`/uploads/${filename}`);
        }
      }

      return NextResponse.json({
        message: useCloudinary
          ? "Photo(s) uploaded successfully to Cloudinary CDN."
          : "Photo(s) uploaded locally. (Configure Cloudinary in .env for permanent Vercel hosting)",
        urls: uploadedUrls,
        url: uploadedUrls[0],
        provider: useCloudinary ? "cloudinary" : "local",
      });
    }

    // 2. Handle JSON base64 upload
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { imageBase64 } = body;

      if (!imageBase64) {
        return NextResponse.json(
          { message: "imageBase64 string is required." },
          { status: 400 }
        );
      }

      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = "jpg";

      if (matches && matches.length === 3) {
        const mime = matches[1];
        if (mime.includes("webp")) ext = "webp";
        else if (mime.includes("png")) ext = "png";
        else if (mime.includes("gif")) ext = "gif";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(imageBase64, "base64");
      }

      let publicUrl: string;

      if (useCloudinary) {
        const cldResult = await uploadToCloudinary(buffer, "cothesis_products");
        publicUrl = cldResult.url;
      } else {
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const filename = `cothesis_prod_${uniqueSuffix}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        publicUrl = `/uploads/${filename}`;
      }

      return NextResponse.json({
        message: useCloudinary
          ? "Photo uploaded and processed to Cloudinary CDN."
          : "Photo uploaded locally. (Configure Cloudinary in .env for permanent Vercel hosting)",
        url: publicUrl,
        urls: [publicUrl],
        provider: useCloudinary ? "cloudinary" : "local",
      });
    }

    return NextResponse.json(
      { message: "Unsupported Content-Type. Please use multipart/form-data or application/json." },
      { status: 415 }
    );
  } catch (err: any) {
    console.error("Image Upload Error:", err);
    return NextResponse.json(
      { message: "Failed to upload image.", error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
