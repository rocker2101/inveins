import fs from 'fs';
import path from 'path';

export interface StoreSettings {
  standardShippingFee: number;
  freeShippingThreshold: number;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  standardShippingFee: 70,
  freeShippingThreshold: 999,
  updatedAt: new Date().toISOString(),
};

// In-memory cache for fast, reliable reads across API routes
let cachedSettings: StoreSettings = { ...DEFAULT_SETTINGS };

const settingsFilePath = path.join(process.cwd(), 'src', 'data', 'settings.json');

let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Reads store settings with hierarchical fallback: In-Memory -> Supabase -> Disk JSON -> Defaults
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const now = Date.now();
  if (now - lastFetchedAt < CACHE_TTL_MS && cachedSettings.updatedAt) {
    return cachedSettings;
  }

  // 1. Try fetching from Supabase database table
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data: dbSettings, error: dbErr } = await supabaseAdmin
      .from('inveins_store_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (!dbErr && dbSettings) {
      cachedSettings = {
        standardShippingFee: Number(dbSettings.standard_shipping_fee) ?? DEFAULT_SETTINGS.standardShippingFee,
        freeShippingThreshold: Number(dbSettings.free_shipping_threshold) ?? DEFAULT_SETTINGS.freeShippingThreshold,
        updatedAt: dbSettings.updated_at || new Date().toISOString(),
      };
      lastFetchedAt = now;
      return cachedSettings;
    }
  } catch (supabaseErr) {
    // Non-blocking fallback to local/in-memory
  }

  // 2. Fall back to reading settings.json from local disk if available
  try {
    if (fs.existsSync(settingsFilePath)) {
      const content = fs.readFileSync(settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      cachedSettings = {
        standardShippingFee: typeof parsed.standardShippingFee === 'number' ? parsed.standardShippingFee : DEFAULT_SETTINGS.standardShippingFee,
        freeShippingThreshold: typeof parsed.freeShippingThreshold === 'number' ? parsed.freeShippingThreshold : DEFAULT_SETTINGS.freeShippingThreshold,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      lastFetchedAt = now;
      return cachedSettings;
    }
  } catch (diskErr) {
    // Read-only serverless environment
  }

  lastFetchedAt = now;
  return cachedSettings;
}

/**
 * Updates store settings across memory, Supabase database, and disk
 */
export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();

  const standardFee = typeof newSettings.standardShippingFee === 'number' && !isNaN(newSettings.standardShippingFee)
    ? Math.max(0, Math.round(newSettings.standardShippingFee))
    : current.standardShippingFee;

  const freeThreshold = typeof newSettings.freeShippingThreshold === 'number' && !isNaN(newSettings.freeShippingThreshold)
    ? Math.max(0, Math.round(newSettings.freeShippingThreshold))
    : current.freeShippingThreshold;

  const nowIso = new Date().toISOString();
  const updated: StoreSettings = {
    standardShippingFee: standardFee,
    freeShippingThreshold: freeThreshold,
    updatedAt: nowIso,
  };

  cachedSettings = { ...updated };
  lastFetchedAt = Date.now();

  // 1. Try persisting to Supabase table
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    await supabaseAdmin
      .from('inveins_store_settings')
      .upsert({
        id: 'global',
        standard_shipping_fee: standardFee,
        free_shipping_threshold: freeThreshold,
        updated_at: nowIso,
      });
  } catch (dbErr) {
    console.warn('[SETTINGS] Notice: Supabase settings table sync pending:', dbErr);
  }

  // 2. Try writing to disk if writable (e.g. local development or persistent VM)
  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    // In serverless Vercel, filesystem is read-only. In-memory and Supabase handle persistence.
  }

  return updated;
}
