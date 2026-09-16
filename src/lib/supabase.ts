import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, CommunityPhoto, OrderStatus, StoreSettings } from '../types';

// Environment variable extraction with support for both Browser (Vite) and Server (Node.js)
const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Check Vite client-side imports
  try {
    const meta = import.meta as any;
    if (meta?.env?.[key]) {
      return meta.env[key];
    }
    if (meta?.env?.[`VITE_${key}`]) {
      return meta.env[`VITE_${key}`];
    }
  } catch {
    // Ignore in non-vite contexts
  }
  return '';
};

const supabaseUrl =
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  '';

const supabaseKey =
  getEnvVar('SUPABASE_SERVICE_ROLE_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  '';

let supabaseClientInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClientInstance;
};

// Database helper functions with fallback handling

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      url: supabaseUrl || 'Not configured',
      message: 'SUPABASE_URL and SUPABASE_ANON_KEY are not set in environment.'
    };
  }

  try {
    const client = getSupabaseClient();
    if (!client) throw new Error('Client creation failed');

    const { error } = await client.from('products').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        url: supabaseUrl,
        message: `Connected to Supabase URL, but database error: ${error.message}. Please run supabase/schema.sql.`
      };
    }

    return {
      connected: true,
      url: supabaseUrl,
      message: 'Supabase Live Database connected successfully.'
    };
  } catch (err: any) {
    return {
      connected: false,
      url: supabaseUrl,
      message: err?.message || 'Connection failed'
    };
  }
}

// Products Supabase CRUD
export async function fetchSupabaseProducts(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch products error:', error.message);
      return null;
    }

    if (!data) return null;

    // Map DB snake_case to Product interface
    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      rating: Number(row.rating || 5.0),
      reviewsCount: Number(row.reviews_count || 1),
      sizes: Array.isArray(row.sizes) ? row.sizes : ['M', 'L'],
      colors: Array.isArray(row.colors) ? row.colors : ['Jet Black'],
      description: row.description || '',
      features: Array.isArray(row.features) ? row.features : [],
      image: row.image,
      secondaryImages: Array.isArray(row.secondary_images) ? row.secondary_images : [],
      inStock: row.in_stock ?? true,
      stockQuantity: Number(row.stock_quantity || 10),
      sku: row.sku || `018-${row.id}`,
      tag: row.tag,
      isNew: row.is_new ?? false,
      isBestseller: row.is_bestseller ?? false,
      createdAt: row.created_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Supabase products fetch failed:', e);
    return null;
  }
}

export async function insertSupabaseProduct(product: Partial<Product>): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const dbPayload = {
      id: product.id || `prod-${Date.now()}`,
      title: product.title,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      rating: product.rating || 5.0,
      reviews_count: product.reviewsCount || 1,
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Jet Black', '018 Orange'],
      description: product.description,
      features: product.features || [],
      image: product.image,
      secondary_images: product.secondaryImages || [],
      in_stock: product.inStock ?? true,
      stock_quantity: product.stockQuantity || 10,
      sku: product.sku || `018-NW-${Math.floor(100 + Math.random() * 900)}`,
      tag: product.tag || 'NEW DROP',
      is_new: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await client.from('products').insert([dbPayload]).select().single();
    if (error) {
      console.warn('Supabase insert product error:', error.message);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      category: data.category,
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      rating: Number(data.rating),
      reviewsCount: Number(data.reviews_count),
      sizes: data.sizes,
      colors: data.colors,
      description: data.description,
      features: data.features,
      image: data.image,
      secondaryImages: data.secondary_images || [],
      inStock: data.in_stock,
      stockQuantity: Number(data.stock_quantity),
      sku: data.sku,
      tag: data.tag,
      isNew: data.is_new,
      isBestseller: data.is_bestseller,
      createdAt: data.created_at
    };
  } catch (e) {
    console.warn('Supabase insert product failed:', e);
    return null;
  }
}

export async function deleteSupabaseProduct(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// Orders Supabase CRUD
export async function fetchSupabaseOrders(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      customer: row.customer,
      items: row.items,
      subtotal: Number(row.subtotal),
      shippingFee: Number(row.shipping_fee || 0),
      discount: Number(row.discount || 0),
      total: Number(row.total),
      deliveryMethod: row.delivery_method,
      status: row.status,
      paymentMethod: row.payment_method,
      payfastData: row.payfast_data,
      trackingNumber: row.tracking_number,
      courierName: row.courier_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch {
    return null;
  }
}

export async function insertSupabaseOrder(order: Order): Promise<Order | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const payload = {
      id: order.id,
      order_number: order.orderNumber,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping_fee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      delivery_method: order.deliveryMethod,
      status: order.status,
      payment_method: order.paymentMethod,
      payfast_data: order.payfastData || null,
      tracking_number: order.trackingNumber || null,
      courier_name: order.courierName || null,
      created_at: order.createdAt || new Date().toISOString(),
      updated_at: order.updatedAt || new Date().toISOString()
    };

    const { error } = await client.from('orders').insert([payload]);
    if (error) {
      console.warn('Supabase insert order error:', error.message);
      return null;
    }
    return order;
  } catch {
    return null;
  }
}

export async function updateSupabaseOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    const { error } = await client
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    return !error;
  } catch {
    return false;
  }
}

// Community Photos Supabase CRUD
export async function fetchSupabaseCommunityPhotos(): Promise<CommunityPhoto[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('community_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      userName: row.user_name,
      handle: row.handle,
      location: row.location,
      caption: row.caption,
      imageUrl: row.image_url,
      productTagged: row.product_tagged,
      likes: Number(row.likes || 0),
      createdAt: row.created_at,
      source: row.source || 'gallery'
    }));
  } catch {
    return null;
  }
}

export async function insertSupabaseCommunityPhoto(photo: CommunityPhoto): Promise<CommunityPhoto | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const payload = {
      id: photo.id,
      user_name: photo.userName,
      handle: photo.handle,
      location: photo.location,
      caption: photo.caption,
      image_url: photo.imageUrl,
      product_tagged: photo.productTagged,
      likes: photo.likes,
      source: photo.source,
      created_at: photo.createdAt || new Date().toISOString()
    };

    const { error } = await client.from('community_photos').insert([payload]);
    if (error) {
      console.warn('Supabase community insert error:', error.message);
      return null;
    }
    return photo;
  } catch {
    return null;
  }
}
