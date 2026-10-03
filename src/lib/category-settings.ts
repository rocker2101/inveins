import fs from 'fs';
import path from 'path';
import { CategoryItem, DEFAULT_CATEGORIES } from '@/data/categories';

// In-memory cache for fast, reliable reads across API routes
let cachedCategories: CategoryItem[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

/**
 * Reads homepage category items with fallback: In-Memory -> Supabase -> Disk JSON -> Defaults
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const now = Date.now();
  if (cachedCategories && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCategories;
  }

  // 1. Try reading from Supabase table if available
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data: dbCategories, error: dbErr } = await supabaseAdmin
      .from('inveins_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!dbErr && dbCategories && dbCategories.length > 0) {
      cachedCategories = dbCategories.map((c: any) => ({
        id: c.id,
        title: c.title,
        desc: c.desc_text || c.desc || '',
        image: c.image,
        href: c.href,
      }));
      lastFetchedAt = now;
      return cachedCategories!;
    }
  } catch (supabaseErr) {
    // Non-blocking fallback to local disk/defaults
  }

  // 2. Try reading categories.json from local disk if available
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
    // Read-only serverless environment
  }

  // 3. Default fallback
  cachedCategories = [...DEFAULT_CATEGORIES];
  lastFetchedAt = now;
  return cachedCategories;
}

/**
 * Updates homepage category items across memory, Supabase database, and disk
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

  // 1. Try persisting to Supabase table
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const rows = sanitized.map((item, index) => ({
      id: item.id,
      title: item.title,
      desc_text: item.desc,
      image: item.image,
      href: item.href,
      sort_order: index,
      updated_at: new Date().toISOString(),
    }));
    await supabaseAdmin.from('inveins_categories').upsert(rows);
  } catch (dbErr) {
    console.warn('[CATEGORIES] Notice: Supabase categories table sync pending:', dbErr);
  }

  // 2. Try writing to disk if writable
  try {
    const dir = path.dirname(categoriesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(sanitized, null, 2), 'utf-8');
  } catch (err) {
    // In serverless Vercel, filesystem is read-only. In-memory and Supabase handle persistence.
  }

  return sanitized;
}
