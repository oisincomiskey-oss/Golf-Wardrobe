import { createClient } from '@supabase/supabase-js';
import { Product, CategoryInfo, StoreSettings } from '../types';

// Obtain environment variables safely for Vite client or Node environments
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

export const SUPABASE_URL =
  getEnv('VITE_SUPABASE_URL') ||
  getEnv('SUPABASE_URL') ||
  'https://your-supabase-project.supabase.co';

export const SUPABASE_ANON_KEY =
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('SUPABASE_ANON_KEY') ||
  'your-anon-key';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('your-supabase-project') &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data Converters for Supabase <-> Product Model
export function transformFromSupabase(item: any): Product {
  return {
    id: String(item.id),
    name: item.name || 'Untitled Product',
    price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
    originalPrice: item.originalPrice ?? item.original_price ?? undefined,
    description: item.description || '',
    category: item.category || 'Leather',
    clubFit: item.clubFit ?? item.club_fit ?? 'Driver',
    allowedClubFits: Array.isArray(item.allowedClubFits ?? item.allowed_club_fits)
      ? (item.allowedClubFits ?? item.allowed_club_fits)
      : undefined,
    image: item.image || '',
    gallery: Array.isArray(item.gallery)
      ? item.gallery
      : (typeof item.gallery === 'string' ? JSON.parse(item.gallery || '[]') : []),
    material: item.material || 'Genuine Leather',
    isWaterproof: Boolean(item.isWaterproof ?? item.is_waterproof),
    isGenuineLeather: Boolean(item.isGenuineLeather ?? item.is_genuine_leather),
    stock: typeof item.stock === 'number' ? item.stock : parseInt(item.stock || '0', 10),
    featured: Boolean(item.featured),
    hidden: Boolean(item.hidden),
    scheduledDate: item.scheduledDate ?? item.scheduled_date ?? undefined,
    tags: Array.isArray(item.tags)
      ? item.tags
      : (typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : []),
    rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || '5.0'),
    reviewsCount: typeof (item.reviewsCount ?? item.reviews_count) === 'number'
      ? (item.reviewsCount ?? item.reviews_count)
      : parseInt((item.reviewsCount ?? item.reviews_count) || '0', 10),
    reviews: Array.isArray(item.reviews)
      ? item.reviews
      : (typeof item.reviews === 'string' ? JSON.parse(item.reviews || '[]') : []),
  };
}

export function transformToSupabaseSnakeCase(product: Product): any {
  return {
    id: String(product.id),
    name: product.name,
    price: product.price,
    original_price: product.originalPrice ?? null,
    description: product.description || '',
    category: product.category || 'Leather',
    club_fit: product.clubFit || 'Driver',
    allowed_club_fits: product.allowedClubFits || [],
    image: product.image || '',
    gallery: product.gallery || [],
    material: product.material || 'Genuine Leather',
    is_waterproof: product.isWaterproof ?? true,
    is_genuine_leather: product.isGenuineLeather ?? true,
    stock: product.stock ?? 10,
    featured: Boolean(product.featured),
    hidden: Boolean(product.hidden),
    scheduled_date: product.scheduledDate || null,
    tags: product.tags || [],
    rating: product.rating || 5.0,
    reviews_count: product.reviewsCount || 0,
    reviews: product.reviews || [],
  };
}

export function transformToSupabaseCamelCase(product: Product): any {
  return {
    id: String(product.id),
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    description: product.description || '',
    category: product.category || 'Leather',
    clubFit: product.clubFit || 'Driver',
    allowedClubFits: product.allowedClubFits || [],
    image: product.image || '',
    gallery: product.gallery || [],
    material: product.material || 'Genuine Leather',
    isWaterproof: product.isWaterproof ?? true,
    isGenuineLeather: product.isGenuineLeather ?? true,
    stock: product.stock ?? 10,
    featured: Boolean(product.featured),
    hidden: Boolean(product.hidden),
    scheduledDate: product.scheduledDate || null,
    tags: product.tags || [],
    rating: product.rating || 5.0,
    reviewsCount: product.reviewsCount || 0,
    reviews: product.reviews || [],
  };
}

export function transformToSupabase(product: Product): any {
  return transformToSupabaseSnakeCase(product);
}

// Supabase API CRUD Helpers
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.warn('Supabase products fetch warning:', error.message);
      return null;
    }
    if (data && Array.isArray(data)) {
      return data.map(transformFromSupabase);
    }
  } catch (err) {
    console.warn('Failed to fetch products from Supabase:', err);
  }
  return null;
}

export async function saveProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials are not configured in environment.' };
  }
  try {
    // 1. Try snake_case payload
    const snakePayload = transformToSupabaseSnakeCase(product);
    const { error: snakeErr } = await supabase.from('products').upsert(snakePayload);
    if (!snakeErr) {
      console.log('Successfully saved product to Supabase (snake_case):', product.id, product.name);
      return { success: true };
    }

    console.warn('Snake case upsert failed, trying camelCase payload fallback:', snakeErr.message);

    // 2. Try camelCase payload
    const camelPayload = transformToSupabaseCamelCase(product);
    const { error: camelErr } = await supabase.from('products').upsert(camelPayload);
    if (!camelErr) {
      console.log('Successfully saved product to Supabase (camelCase):', product.id, product.name);
      return { success: true };
    }

    console.warn('Camel case upsert failed, trying minimal basic payload fallback:', camelErr.message);

    // 3. Fallback to minimal core columns if custom columns do not exist
    const minimalPayload = {
      id: String(product.id),
      name: product.name,
      price: product.price,
      description: product.description || '',
      category: product.category || 'Leather',
      image: product.image || '',
      stock: product.stock ?? 10,
      featured: Boolean(product.featured),
      hidden: Boolean(product.hidden),
    };
    const { error: minErr } = await supabase.from('products').upsert(minimalPayload);
    if (!minErr) {
      console.log('Successfully saved product to Supabase (minimal):', product.id, product.name);
      return { success: true };
    }

    console.error('All Supabase save attempts failed:', minErr.message);
    return { success: false, error: minErr.message };
  } catch (err: any) {
    console.error('Failed to save product to Supabase:', err);
    return { success: false, error: err?.message || 'Unknown network error' };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete product from Supabase:', err);
    return false;
  }
}

export async function batchSaveProductsToSupabase(products: Product[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    for (const prod of products) {
      await saveProductToSupabase(prod);
    }
    return true;
  } catch (err) {
    console.error('Failed to batch save products to Supabase:', err);
    return false;
  }
}
