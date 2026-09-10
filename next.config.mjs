import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sanitize CLOUDINARY_URL at build-time startup so Cloudinary SDK never crashes with ERR_INVALID_URL
if (typeof process !== 'undefined' && process.env.CLOUDINARY_URL) {
  try {
    const rawUrl = process.env.CLOUDINARY_URL.replace(/^["']|["']$/g, '').trim();
    const match = rawUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^\/\s]+)/);
    if (match && !rawUrl.includes('<') && !rawUrl.includes('>')) {
      if (!process.env.CLOUDINARY_API_KEY) process.env.CLOUDINARY_API_KEY = match[1];
      if (!process.env.CLOUDINARY_API_SECRET) process.env.CLOUDINARY_API_SECRET = match[2];
      if (!process.env.CLOUDINARY_CLOUD_NAME) process.env.CLOUDINARY_CLOUD_NAME = match[3];
    }
  } catch {}
  delete process.env.CLOUDINARY_URL;
}


const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://5.imimg.com https://inveins.studio; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://res.cloudinary.com; frame-src https://api.razorpay.com;",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Prevents X-Powered-By: Next.js header info disclosure
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '5.imimg.com',
      },
      {
        protocol: 'https',
        hostname: 'inveins.studio',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.extensions = Array.from(new Set(['.tsx', '.ts', '.jsx', '.js', ...(config.resolve.extensions || [])]));
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/context/CartContext': path.resolve(__dirname, 'src/context/CartContext.tsx'),
      '@/context': path.resolve(__dirname, 'src/context'),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
