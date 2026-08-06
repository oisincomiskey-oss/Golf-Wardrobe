import { createClient } from '@supabase/supabase-js';
import { Product, Order, CategoryInfo, StoreSettings } from '../types';

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
  'https://ymeuyzmwvivjfkrfuall.supabase.co';

export const SUPABASE_ANON_KEY =
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('SUPABASE_ANON_KEY') ||
  'sb_publishable_m099ZWTeqsS6_UObt5H3pw_z0TnQnmw';

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
    originalPrice: item.original_price ?? item.originalPrice ?? undefined,
    description: item.description || '',
    category: item.category || 'Leather',
    clubFit: item.club_fit ?? item.clubFit ?? 'Driver',
    allowedClubFits: Array.isArray(item.allowed_club_fits ?? item.allowedClubFits)
      ? (item.allowed_club_fits ?? item.allowedClubFits)
      : undefined,
    image: item.image || '',
    gallery: Array.isArray(item.gallery)
      ? item.gallery
      : (typeof item.gallery === 'string' ? JSON.parse(item.gallery || '[]') : []),
    material: item.material || 'Genuine Leather',
    isWaterproof: Boolean(item.is_waterproof ?? item.isWaterproof),
    isGenuineLeather: Boolean(item.is_genuine_leather ?? item.isGenuineLeather),
    stock: typeof item.stock === 'number' ? item.stock : parseInt(item.stock || '0', 10),
    featured: Boolean(productOrItemFeatured(item)),
    hidden: Boolean(item.hidden),
    scheduledDate: item.scheduled_date ?? item.scheduledDate ?? undefined,
    tags: Array.isArray(item.tags)
      ? item.tags
      : (typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : []),
    rating: typeof item.rating === 'number' ? item.rating : parseFloat(item.rating || '5.0'),
    reviewsCount: typeof (item.reviews_count ?? item.reviewsCount) === 'number'
      ? (item.reviews_count ?? item.reviewsCount)
      : parseInt((item.reviews_count ?? item.reviewsCount) || '0', 10),
    reviews: Array.isArray(item.reviews)
      ? item.reviews
      : (typeof item.reviews === 'string' ? JSON.parse(item.reviews || '[]') : []),
  };
}

function productOrItemFeatured(item: any): boolean {
  return item.featured;
}

export function transformToSupabaseSnakeCase(product: Product): any {
  return {
    id: String(product.id),
    name: product.name,
    price: product.price,
    original_price: product.originalPrice ?? null,
    originalPrice: product.originalPrice ?? null,
    description: product.description || '',
    category: product.category || 'Leather',
    club_fit: product.clubFit || 'Driver',
    clubFit: product.clubFit || 'Driver',
    allowed_club_fits: product.allowedClubFits || [],
    allowedClubFits: product.allowedClubFits || [],
    image: product.image || '',
    gallery: product.gallery || [],
    material: product.material || 'Genuine Leather',
    is_waterproof: product.isWaterproof ?? true,
    isWaterproof: product.isWaterproof ?? true,
    is_genuine_leather: product.isGenuineLeather ?? true,
    isGenuineLeather: product.isGenuineLeather ?? true,
    stock: product.stock ?? 10,
    featured: Boolean(product.featured),
    hidden: Boolean(product.hidden),
    scheduled_date: product.scheduledDate || null,
    scheduledDate: product.scheduledDate || null,
    tags: product.tags || [],
    rating: product.rating || 5.0,
    reviews_count: product.reviewsCount ?? 0,
    reviewsCount: product.reviewsCount ?? 0,
    reviews: product.reviews || [],
  };
}

export function transformToSupabaseCamelCase(product: Product): any {
  return transformToSupabaseSnakeCase(product);
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
  } catch (err: any) {
    console.warn('Failed to fetch products from Supabase:', err?.message || err);
  }
  return null;
}

export async function saveProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials are not configured in environment.' };
  }

  // 1. Try snake_case payload
  try {
    const snakePayload = transformToSupabaseSnakeCase(product);
    const { error: snakeErr } = await supabase.from('products').upsert(snakePayload);
    if (!snakeErr) {
      console.log('Successfully saved product to Supabase (snake_case):', product.id, product.name);
      return { success: true };
    }
    
    if (snakeErr.message && snakeErr.message.toLowerCase().includes('permission denied')) {
      return {
        success: false,
        error: 'Permission denied for table products (Row Level Security active). Please run the updated SQL script in supabase_schema.sql inside your Supabase SQL Editor to grant RLS policies.'
      };
    }
    console.warn('Snake case upsert failed, trying camelCase payload fallback:', snakeErr.message);
  } catch (e: any) {
    console.warn('Snake case upsert network error:', e?.message || e);
    return { 
      success: false, 
      error: e?.name === 'TypeError' || (e?.message && e.message.includes('fetch'))
        ? 'Network connection error (Failed to fetch). Please check your Supabase URL and connection.'
        : (e?.message || 'Network error connecting to Supabase')
    };
  }

  // 2. Try camelCase payload
  try {
    const camelPayload = transformToSupabaseCamelCase(product);
    const { error: camelErr } = await supabase.from('products').upsert(camelPayload);
    if (!camelErr) {
      console.log('Successfully saved product to Supabase (camelCase):', product.id, product.name);
      return { success: true };
    }
    console.warn('Camel case upsert failed, trying minimal basic payload fallback:', camelErr.message);
  } catch (e: any) {
    console.warn('Camel case upsert error:', e?.message || e);
  }

  // 3. Fallback to minimal core columns if custom columns do not exist
  try {
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
    console.error('Failed to save product to Supabase:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown network error' };
  }
}

export async function deleteProductFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', String(id));

    if (error) {
      console.error('Supabase delete error for product id:', id, error.message);
      return false;
    }
    console.log(`Successfully deleted product ${id} from Supabase. Rows affected: ${count}`);
    return true;
  } catch (err: any) {
    console.error('Failed to delete product from Supabase:', err?.message || err);
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

// Data Converters for Supabase <-> Order Model
export function transformOrderFromSupabase(item: any): Order {
  return {
    id: String(item.id),
    orderNumber: item.orderNumber ?? item.order_number ?? `GW-${Math.floor(10000 + Math.random() * 90000)}`,
    date: item.date || new Date().toISOString().split('T')[0],
    customer: typeof item.customer === 'string' ? JSON.parse(item.customer) : (item.customer || {}),
    items: Array.isArray(item.items) ? item.items : (typeof item.items === 'string' ? JSON.parse(item.items || '[]') : []),
    subtotal: typeof item.subtotal === 'number' ? item.subtotal : parseFloat(item.subtotal || '0'),
    discount: typeof item.discount === 'number' ? item.discount : parseFloat(item.discount || '0'),
    couponCode: item.couponCode ?? item.coupon_code ?? undefined,
    shippingFee: typeof (item.shippingFee ?? item.shipping_fee) === 'number' ? (item.shippingFee ?? item.shipping_fee) : parseFloat((item.shippingFee ?? item.shipping_fee) || '0'),
    total: typeof item.total === 'number' ? item.total : parseFloat(item.total || '0'),
    status: item.status || 'Pending',
    paymentStatus: item.paymentStatus ?? item.payment_status ?? 'Paid',
    trackingNumber: item.trackingNumber ?? item.tracking_number ?? undefined,
    carrier: item.carrier || 'An Post',
    paymentMethod: item.paymentMethod ?? item.payment_method ?? 'Card',
    shippingLabel: typeof item.shippingLabel === 'string' ? JSON.parse(item.shippingLabel) : (item.shippingLabel ?? item.shipping_label ?? undefined),
    shippedAt: item.shippedAt ?? item.shipped_at ?? undefined,
    deliveredAt: item.deliveredAt ?? item.delivered_at ?? undefined,
    notes: item.notes || undefined,
  };
}

export function transformOrderToSupabaseSnakeCase(order: Order): any {
  return {
    id: String(order.id),
    order_number: order.orderNumber,
    date: order.date,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    coupon_code: order.couponCode || null,
    shipping_fee: order.shippingFee,
    total: order.total,
    status: order.status,
    payment_status: order.paymentStatus || 'Paid',
    tracking_number: order.trackingNumber || null,
    carrier: order.carrier || 'An Post',
    payment_method: order.paymentMethod || 'Card',
    shipping_label: order.shippingLabel || null,
    shipped_at: order.shippedAt || null,
    delivered_at: order.deliveredAt || null,
    notes: order.notes || null,
  };
}

export function transformOrderToSupabaseCamelCase(order: Order): any {
  return {
    id: String(order.id),
    orderNumber: order.orderNumber,
    date: order.date,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    couponCode: order.couponCode || null,
    shippingFee: order.shippingFee,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus || 'Paid',
    trackingNumber: order.trackingNumber || null,
    carrier: order.carrier || 'An Post',
    paymentMethod: order.paymentMethod || 'Card',
    shippingLabel: order.shippingLabel || null,
    shippedAt: order.shippedAt || null,
    deliveredAt: order.deliveredAt || null,
    notes: order.notes || null,
  };
}

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.warn('Supabase orders fetch warning:', error.message);
      return null;
    }
    if (data && Array.isArray(data)) {
      return data.map(transformOrderFromSupabase);
    }
  } catch (err: any) {
    console.warn('Failed to fetch orders from Supabase:', err?.message || err);
  }
  return null;
}

export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials are not configured in environment.' };
  }

  // 1. Try snake_case payload
  try {
    const snakePayload = transformOrderToSupabaseSnakeCase(order);
    const { error: snakeErr } = await supabase.from('orders').upsert(snakePayload);
    if (!snakeErr) {
      console.log('Successfully saved order to Supabase (snake_case):', order.id, order.orderNumber);
      return { success: true };
    }

    if (snakeErr.message && snakeErr.message.toLowerCase().includes('permission denied')) {
      return {
        success: false,
        error: 'Permission denied for table orders (Row Level Security active). Please run the updated SQL script in supabase_schema.sql inside your Supabase SQL Editor to grant RLS policies.'
      };
    }
    console.warn('Order snake_case upsert failed, trying camelCase payload fallback:', snakeErr.message);
  } catch (e: any) {
    console.warn('Snake case order upsert network error:', e?.message || e);
  }

  // 2. Try camelCase payload
  try {
    const camelPayload = transformOrderToSupabaseCamelCase(order);
    const { error: camelErr } = await supabase.from('orders').upsert(camelPayload);
    if (!camelErr) {
      console.log('Successfully saved order to Supabase (camelCase):', order.id, order.orderNumber);
      return { success: true };
    }

    if (camelErr.message && camelErr.message.toLowerCase().includes('permission denied')) {
      return {
        success: false,
        error: 'Permission denied for table orders (Row Level Security active). Please run the updated SQL script in supabase_schema.sql inside your Supabase SQL Editor to grant RLS policies.'
      };
    }
    console.warn('Camel case order upsert failed:', camelErr.message);
    return { success: false, error: camelErr.message };
  } catch (err: any) {
    console.error('Failed to save order to Supabase:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown network error' };
  }
}

export async function deleteOrderFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Supabase order delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete order from Supabase:', err);
    return false;
  }
}

