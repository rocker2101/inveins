import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// 1. Read .env file directly
const envContent = fs.readFileSync('.env', 'utf8');
function getEnv(key) {
  const m = envContent.match(new RegExp(`${key}=([^\\r\\n]+)`));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

const u = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const k = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const cldName = getEnv('CLOUDINARY_CLOUD_NAME');
const cldKey = getEnv('CLOUDINARY_API_KEY');
const cldSecret = getEnv('CLOUDINARY_API_SECRET');

console.log('Supabase URL:', u);
console.log('Cloudinary Config:', { cloud_name: cldName, api_key: cldKey ? 'present' : 'missing', api_secret: cldSecret ? 'present' : 'missing' });

cloudinary.config({
  cloud_name: cldName,
  api_key: cldKey,
  api_secret: cldSecret,
  secure: true,
});

const supabase = createClient(u, k);

async function run() {
  const { data: products, error } = await supabase.from('inveins_products').select('*');
  if (error) {
    console.error('Failed to fetch products:', error.message);
    return;
  }

  console.log(`Found ${products.length} products in Supabase.`);

  for (const prod of products) {
    let images = prod.images;
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = [images]; }
    }
    if (!Array.isArray(images)) images = [images].filter(Boolean);

    let needsUpdate = false;
    const cleanImages = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img === 'string' && img.startsWith('data:image')) {
        needsUpdate = true;
        console.log(`Uploading base64 image ${i + 1}/${images.length} for ${prod.name} (${prod.id})...`);
        try {
          const res = await cloudinary.uploader.upload(img, {
            folder: 'inveins_products',
            public_id: `${prod.id}_img_${i + 1}`,
            overwrite: true,
            resource_type: 'image',
          });
          console.log(`  -> Uploaded successfully: ${res.secure_url}`);
          cleanImages.push(res.secure_url);
        } catch (uploadErr) {
          console.error(`  -> Cloudinary upload error: ${uploadErr.message}`);
          // If upload fails, keep original or fallback
          cleanImages.push(img);
        }
      } else {
        cleanImages.push(img);
      }
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase
        .from('inveins_products')
        .update({
          images: cleanImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`Failed to update ${prod.id} in Supabase:`, updateErr.message);
      } else {
        console.log(`✓ Product ${prod.id} updated in Supabase with clean CDN image URLs.`);
      }
    } else {
      console.log(`Product ${prod.id} already has clean CDN URLs.`);
    }
  }

  console.log('All products processed successfully!');
}

run().catch(console.error);
