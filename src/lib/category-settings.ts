import fs from 'fs';
import path from 'path';
import { CategoryItem, DEFAULT_CATEGORIES } from '@/data/categories';

// In-memory cache for fast, reliable reads across API routes
let cachedCategories: CategoryItem[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

/**
 * Reads homepage category items with fallback: In-Memory -> Disk JSON -> Defaults
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const now = Date.now();
  if (cachedCategories && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCategories;
  }

  // 1. Try reading categories.json from local disk if available
  try {
    if (fs.existsSync(categoriesFilePath)) {
      const content = fs.readFileSync(categoriesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedCategories = parsed;
        lastFetchedAt = now;
        return cachedCategories!;
      }
    }
  } catch (diskErr) {
    console.warn('[CATEGORIES] Notice: Could not read categories.json from disk:', diskErr);
  }

  // 2. Default fallback
  cachedCategories = [...DEFAULT_CATEGORIES];
  lastFetchedAt = now;
  return cachedCategories;
}

/**
 * Updates homepage category items across memory and disk
 */
export async function saveCategories(newCategories: CategoryItem[]): Promise<CategoryItem[]> {
  if (!Array.isArray(newCategories)) {
    throw new Error('Invalid categories payload: Expected an array.');
  }

  const sanitized: CategoryItem[] = newCategories.map((item, index) => ({
    id: String(item.id || `category-${Date.now()}-${index}`),
    title: String(item.title || 'CATEGORY').trim(),
    desc: String(item.desc || '').trim(),
    image: String(item.image || '/images/categories/heavyweight-tees.png').trim(),
    href: String(item.href || '/shop').trim(),
  }));

  cachedCategories = [...sanitized];
  lastFetchedAt = Date.now();

  // Try writing to disk
  try {
    const dir = path.dirname(categoriesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[CATEGORIES] Notice: Filesystem write skipped or read-only:', err);
  }

  return sanitized;
}
