// Safely configure Cloudinary without crashing during Next.js build-time page collection

function sanitizeCloudinaryEnv() {
  if (typeof process !== "undefined" && process.env.CLOUDINARY_URL) {
    try {
      const rawUrl = process.env.CLOUDINARY_URL.replace(/^["']|["']$/g, "").trim();
      const match = rawUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^\/\s]+)/);
      if (match && !rawUrl.includes("<") && !rawUrl.includes(">")) {
        if (!process.env.CLOUDINARY_API_KEY) process.env.CLOUDINARY_API_KEY = match[1];
        if (!process.env.CLOUDINARY_API_SECRET) process.env.CLOUDINARY_API_SECRET = match[2];
        if (!process.env.CLOUDINARY_CLOUD_NAME) process.env.CLOUDINARY_CLOUD_NAME = match[3];
      }
    } catch {
      // Ignore errors parsing raw URL
    }
    // Deleting process.env.CLOUDINARY_URL prevents the Cloudinary Node SDK
    // from calling new URL() and throwing ERR_INVALID_URL at build time
    delete process.env.CLOUDINARY_URL;
  }
}

// Pre-sanitize on file load
sanitizeCloudinaryEnv();

export function isCloudinaryConfigured(): boolean {
  if (typeof process === "undefined") return false;
  sanitizeCloudinaryEnv();

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
