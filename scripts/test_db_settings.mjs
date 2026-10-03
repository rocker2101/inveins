import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
function getEnv(key) {
  const m = envContent.match(new RegExp(`${key}=([^\\r\\n]+)`));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

const u = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const k = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(u, k);

async function check() {
  const { data: storeSettings, error: sErr } = await supabase.from('inveins_store_settings').select('*');
  console.log('Store settings:', { storeSettings, error: sErr ? sErr.message : null });

  const { data: catSettings, error: cErr } = await supabase.from('inveins_categories').select('*');
  console.log('Categories table:', { catSettings, error: cErr ? cErr.message : null });
}

check().catch(console.error);
