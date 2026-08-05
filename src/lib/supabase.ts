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

export function transformToSupabase(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    original_price: product.originalPrice ?? null,
    originalPrice: product.originalPrice ?? null,
    description: product.description,
    category: product.category,
    club_fit: product.clubFit,
    clubFit: product.clubFit,
    allowed_club_fits: product.allowedClubFits || null,
    allowedClubFits: product.allowedClubFits || null,
    image: product.image,
    gallery: product.gallery || [],
    material: product.material,
    is_waterproof: product.isWaterproof,
    isWaterproof: product.isWaterproof,
    is_genuine_leather: product.isGenuineLeather,
    isGenuineLeather: product.isGenuineLeather,
    stock: product.stock,
    featured: product.featured,
    hidden: product.hidden || false,
    scheduled_date: product.scheduledDate || null,
    scheduledDate: product.scheduledDate || null,
    tags: product.tags || [],
    rating: product.rating || 5.0,
    reviews_count: product.reviewsCount || 0,
    reviewsCount: product.reviewsCount || 0,
    reviews: product.reviews || [],
  };
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
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map(transformFromSupabase);
    }
  } catch (err) {
    console.warn('Failed to fetch products from Supabase:', err);
  }
  return null;
}

export async function saveProductToSupabase(product: Product): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = transformToSupabase(product);
    const { error } = await supabase.from('products').upsert(payload);
    if (error) {
      console.error('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save product to Supabase:', err);
    return false;
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
    const payloads = products.map(transformToSupabase);
    const { error } = await supabase.from('products').upsert(payloads);
    if (error) {
      console.error('Supabase batch upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to batch save products to Supabase:', err);
    return false;
  }
}
