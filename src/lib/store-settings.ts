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

/**
 * Reads store settings from disk/cache with fail-safe defaults
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const content = fs.readFileSync(settingsFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      cachedSettings = {
        standardShippingFee: typeof parsed.standardShippingFee === 'number' ? parsed.standardShippingFee : DEFAULT_SETTINGS.standardShippingFee,
        freeShippingThreshold: typeof parsed.freeShippingThreshold === 'number' ? parsed.freeShippingThreshold : DEFAULT_SETTINGS.freeShippingThreshold,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      return cachedSettings;
    }
  } catch (err) {
    console.warn('[SETTINGS] Could not read settings.json from disk, using cache:', err);
  }

  return cachedSettings;
}

/**
 * Updates store settings in cache and persists to disk
 */
export async function updateStoreSettings(newSettings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();

  const standardFee = typeof newSettings.standardShippingFee === 'number' && !isNaN(newSettings.standardShippingFee)
    ? Math.max(0, Math.round(newSettings.standardShippingFee))
    : current.standardShippingFee;

  const freeThreshold = typeof newSettings.freeShippingThreshold === 'number' && !isNaN(newSettings.freeShippingThreshold)
    ? Math.max(0, Math.round(newSettings.freeShippingThreshold))
    : current.freeShippingThreshold;

  const updated: StoreSettings = {
    standardShippingFee: standardFee,
    freeShippingThreshold: freeThreshold,
    updatedAt: new Date().toISOString(),
  };

  cachedSettings = { ...updated };

  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[SETTINGS] Could not persist to disk, updated in-memory:', err);
  }

  return updated;
}
