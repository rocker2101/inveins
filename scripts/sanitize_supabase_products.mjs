import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('.env', 'utf8');
function getEnv(key) {
  const m = envContent.match(new RegExp(`${key}=([^\\r\\n]+)`));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

const u = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const k = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(u, k);

// Product clean CDN fallback mapping
const FALLBACK_IMAGES = {
  'rakshak-heavyweight-tshirt-996': ['https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg'],
  'god-s-plan-heavyweight-antibacterial-tee-472': ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
  'universe-11-11-heavyweight-inveins-tee-662': ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
  'aham-brahmashmi-oversized-heavyweight-tee-882': ['https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg'],
  'aham-brahmashmi-white-heavyweight-tee-722': ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
  'full-sleeves-n1-compression-910': ['https://5.imimg.com/data5/SELLER/Default/2026/3/590938561/TI/FE/BN/180956315/men-compression-t-shirt-500x500.jpeg'],
  'half-sleeve-n1-compression-278': ['https://5.imimg.com/data5/SELLER/Default/2026/3/590938561/TI/FE/BN/180956315/men-compression-t-shirt-500x500.jpeg'],
  'half-sleeve-n1-compression-613': ['https://5.imimg.com/data5/SELLER/Default/2026/3/590938561/TI/FE/BN/180956315/men-compression-t-shirt-500x500.jpeg'],
  'dennin-854': ['/images/categories/french-terry-lowers.png'],
};

async function sanitizeDatabase() {
  const { data: dbProducts, error } = await supabase.from('inveins_products').select('id, name, images');
  if (error) {
    console.error('Failed to query Supabase products:', error);
    return;
  }

  console.log(`Processing ${dbProducts.length} products in Supabase...`);

  for (const prod of dbProducts) {
    const fallback = FALLBACK_IMAGES[prod.id] || ['https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg'];
    
    // Check if current images contain base64
    let currentImgs = prod.images;
    if (typeof currentImgs === 'string') {
      try { currentImgs = JSON.parse(currentImgs); } catch { currentImgs = [currentImgs]; }
    }
    if (!Array.isArray(currentImgs)) currentImgs = [currentImgs];

    const hasBase64 = currentImgs.some(img => typeof img === 'string' && img.startsWith('data:image'));

    if (hasBase64) {
      console.log(`Sanitizing product ${prod.id} (${prod.name}): replacing base64 with CDN URLs...`);
      const { error: updateErr } = await supabase
        .from('inveins_products')
        .update({
          images: fallback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`  Error updating ${prod.id}:`, updateErr.message);
      } else {
        console.log(`  ✓ Updated ${prod.id} successfully!`);
      }
    } else {
      console.log(`Product ${prod.id} already clean.`);
    }
  }

  console.log('Sanitization complete!');
}

sanitizeDatabase().catch(console.error);
