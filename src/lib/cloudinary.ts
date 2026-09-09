// Safely configure Cloudinary without crashing during Next.js build-time page collection

function sanitizeCloudinaryEnv() {
  if (typeof process !== "undefined" && process.env.CLOUDINARY_URL) {
    const val = process.env.CLOUDINARY_URL.trim();
    // If the URL contains placeholder tags like <your_api_key> or spaces, delete it so Cloudinary SDK doesn't throw ERR_INVALID_URL
    if (val.includes("<") || val.includes(">") || val.includes(" ") || !val.startsWith("cloudinary://")) {
      console.warn("Invalid CLOUDINARY_URL detected with placeholders. Disabling raw CLOUDINARY_URL to prevent crashes.");
      delete process.env.CLOUDINARY_URL;
    }
  }
}

// Pre-sanitize on file load
sanitizeCloudinaryEnv();

export function isCloudinaryConfigured(): boolean {
  if (typeof process === "undefined") return false;

  const rawUrl = process.env.CLOUDINARY_URL?.trim();
  if (rawUrl && rawUrl.startsWith("cloudinary://") && !rawUrl.includes("<") && !rawUrl.includes(">") && !rawUrl.includes(" ")) {
    return true;
  }

  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (apiKey && apiSecret && !apiKey.includes("<") && !apiSecret.includes("<")) {
    return true;
  }

  return false;
}

/**
 * Dynamically import and initialize Cloudinary on demand.
 * This prevents Next.js from evaluating the Cloudinary Node SDK at build time.
 */
async function getCloudinaryClient() {
  sanitizeCloudinaryEnv();
  const { v2: cloudinary } = await import("cloudinary");

  const rawUrl = process.env.CLOUDINARY_URL?.trim();
  if (rawUrl && rawUrl.startsWith("cloudinary://") && !rawUrl.includes("<") && !rawUrl.includes(">") && !rawUrl.includes(" ")) {
    cloudinary.config({
      cloudinary_url: rawUrl,
      secure: true,
    });
  } else {
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
    }
  }

  return cloudinary;
}

/**
 * Upload an image buffer directly to Cloudinary using async/await
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "inveins_products"
): Promise<{ url: string; public_id: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not yet properly configured. Please check your CLOUDINARY_URL or CLOUDINARY_API_KEY in environment variables."
    );
  }

  const cloudinary = await getCloudinaryClient();

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
