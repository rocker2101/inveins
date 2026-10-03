import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const uMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const kMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);

const u = uMatch ? uMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const k = kMatch ? kMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

if (!u || !k) {
  console.error('Missing Supabase URL or SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(u, k);

async function main() {
  const { data, error } = await supabase.from('inveins_products').select('id, name, is_active, images');
  if (error) {
    console.error('DB Error:', error.message);
    return;
  }

  console.log(`Total products in Supabase: ${data.length}`);
  let totalImgLength = 0;
  for (const p of data) {
    const imgStr = JSON.stringify(p.images || []);
    totalImgLength += imgStr.length;
    const isBase64 = imgStr.includes('data:image');
    console.log(`- ${p.id} | Active: ${p.is_active} | Size: ${Math.round(imgStr.length / 1024)} KB | Has Base64: ${isBase64}`);
  }
  console.log(`Total images string size: ${Math.round(totalImgLength / 1024)} KB (${Math.round(totalImgLength / 1024 / 1024 * 10) / 10} MB)`);
}

main().catch(console.error);
