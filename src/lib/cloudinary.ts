import { v2 as cloudinary } from "cloudinary";

// Safely configure Cloudinary without crashing during Next.js build-time page collection
let isConfigured = false;

export function configureCloudinarySafely() {
  if (isConfigured) return;

  try {
    const rawUrl = process.env.CLOUDINARY_URL?.trim();

    // Only configure with CLOUDINARY_URL if it's a valid formatted string without placeholders (<...>)
    if (rawUrl && rawUrl.startsWith("cloudinary://") && !rawUrl.includes("<") && !rawUrl.includes(">")) {
      cloudinary.config({
        cloudinary_url: rawUrl,
        secure: true,
      });
      isConfigured = true;
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "elxbroei";
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (apiKey && apiSecret && !apiKey.includes("<") && !apiSecret.includes("<")) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      isConfigured = true;
    }
  } catch (err) {
    console.warn("Cloudinary configuration skipped or invalid format:", err);
  }
}

// Initial safe attempt
configureCloudinarySafely();

export { cloudinary };

export function isCloudinaryConfigured(): boolean {
  configureCloudinarySafely();
  return isConfigured;
}

/**
 * Upload an image buffer directly to Cloudinary using async/await
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "inveins_products"
): Promise<{ url: string; public_id: string }> {
  configureCloudinarySafely();

  if (!isConfigured) {
    throw new Error(
      "Cloudinary is not yet properly configured. Please check your CLOUDINARY_URL or CLOUDINARY_API_KEY in environment variables."
    );
  }

  const base64Data = fileBuffer.toString("base64");
  const dataUri = `data:image/jpeg;base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}
