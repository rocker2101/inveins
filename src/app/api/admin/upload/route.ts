import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import { logSecurityEvent } from "@/lib/audit-logger";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit per image

const isProductionServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production"
);

/**
 * Validates binary magic-bytes to prevent spoofed files (SVG script injection, PHP/executable uploads)
 */
function isValidImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

  // WebP: RIFF .... WEBP
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return true;

  // GIF: GIF87a or GIF89a
  if (buffer.toString("ascii", 0, 3) === "GIF") return true;

  return false;
}

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

    // 1. Handle multipart/form-data
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
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { success: false, message: `File "${file.name}" exceeds the 5MB size limit.` },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (!isValidImageSignature(buffer)) {
          logSecurityEvent({
            event: "INVALID_FILE_SIGNATURE_UPLOAD_ATTEMPT",
            severity: "WARNING",
            endpoint: "/api/admin/upload",
            metadata: { fileName: file.name, size: file.size, mime: file.type },
          });
          return NextResponse.json(
            { success: false, message: `File "${file.name}" is not a valid image format (JPEG, PNG, WebP, GIF only).` },
            { status: 400 }
          );
        }

        if (useCloudinary) {
          try {
            const cldResult = await uploadToCloudinary(buffer, "inveins_products");
            uploadedUrls.push(cldResult.url);
          } catch (cldErr: any) {
            console.warn("Cloudinary upload failed:", cldErr?.message);
            if (isProductionServerless && buffer.length > 50 * 1024) {
              return NextResponse.json(
                { success: false, message: `Cloudinary CDN upload failed (${cldErr?.message || "Storage unavailable"}). Large inline Base64 storage is blocked in production to protect catalog performance.` },
                { status: 502 }
              );
            }
            const mime = file.type || "image/jpeg";
            const base64 = buffer.toString("base64");
            uploadedUrls.push(`data:${mime};base64,${base64}`);
          }
        } else if (!isProductionServerless) {
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadDir, { recursive: true });

          let ext = "jpg";
          if (buffer[0] === 0x89) ext = "png";
          else if (buffer.toString("ascii", 8, 12) === "WEBP") ext = "webp";
          else if (buffer.toString("ascii", 0, 3) === "GIF") ext = "gif";

          const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const filename = `inveins_prod_${uniqueSuffix}.${ext}`;
          const filePath = path.join(uploadDir, filename);

          await fs.writeFile(filePath, buffer);
          uploadedUrls.push(`/uploads/${filename}`);
        } else {
          if (buffer.length > 50 * 1024) {
            return NextResponse.json(
              { success: false, message: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be configured in production. Large inline Base64 images are blocked." },
              { status: 503 }
            );
          }
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

      if (!imageBase64 || typeof imageBase64 !== "string") {
        return NextResponse.json(
          { success: false, message: "imageBase64 string is required." },
          { status: 400 }
        );
      }

      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(imageBase64, "base64");
      }

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, message: "Base64 image payload exceeds the 5MB size limit." },
          { status: 400 }
        );
      }

      if (!isValidImageSignature(buffer)) {
        logSecurityEvent({
          event: "INVALID_BASE64_IMAGE_SIGNATURE_ATTEMPT",
          severity: "WARNING",
          endpoint: "/api/admin/upload",
        });
        return NextResponse.json(
          { success: false, message: "Invalid binary image format. Only JPEG, PNG, WebP, and GIF are allowed." },
          { status: 400 }
        );
      }

      let publicUrl: string;

      if (useCloudinary) {
        try {
          const cldResult = await uploadToCloudinary(buffer, "inveins_products");
          publicUrl = cldResult.url;
        } catch (cldErr: any) {
          console.warn("Cloudinary upload failed:", cldErr?.message);
          if (isProductionServerless && buffer.length > 50 * 1024) {
            return NextResponse.json(
              { success: false, message: `Cloudinary CDN upload failed (${cldErr?.message || "Storage unavailable"}). Large inline Base64 storage is blocked in production to protect catalog performance.` },
              { status: 502 }
            );
          }
          publicUrl = imageBase64;
        }
      } else if (!isProductionServerless) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        let ext = "jpg";
        if (buffer[0] === 0x89) ext = "png";
        else if (buffer.toString("ascii", 8, 12) === "WEBP") ext = "webp";
        else if (buffer.toString("ascii", 0, 3) === "GIF") ext = "gif";

        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const filename = `inveins_prod_${uniqueSuffix}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        publicUrl = `/uploads/${filename}`;
      } else {
        if (buffer.length > 50 * 1024) {
          return NextResponse.json(
            { success: false, message: "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be configured in production. Large inline Base64 images are blocked." },
            { status: 503 }
          );
        }
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
      { success: false, message: "Failed to upload image." },
      { status: 500 }
    );
  }
}
