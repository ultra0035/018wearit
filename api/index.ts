import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, INITIAL_COMMUNITY_PHOTOS } from '../src/data/mockProducts';
import { Product, Order, CommunityPhoto, AdminStats, OrderStatus, ThemeMode } from '../src/types';
import {
  isSupabaseConfigured,
  fetchSupabaseProducts,
  insertSupabaseProduct,
  deleteSupabaseProduct,
  fetchSupabaseOrders,
  insertSupabaseOrder,
  updateSupabaseOrderStatus,
  fetchSupabaseCommunityPhotos,
  insertSupabaseCommunityPhoto,
  checkSupabaseConnection
} from '../src/lib/supabase';

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-Memory Fallback State
let products: Product[] = [...INITIAL_PRODUCTS];
let communityPhotos: CommunityPhoto[] = [...INITIAL_COMMUNITY_PHOTOS];
let orders: Order[] = [];
let storeTheme: ThemeMode = 'dark';

// PayFast helper
function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  const keys = Object.keys(data).filter((k) => k !== 'signature' && data[k] !== undefined && data[k] !== '');
  let pfOutput = '';
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = data[key].trim();
    pfOutput += `${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`;
    if (i < keys.length - 1) {
      pfOutput += '&';
    }
  }

  if (passphrase && passphrase.trim() !== '') {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return crypto.createHash('md5').update(pfOutput).digest('hex');
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: '018 Bokone Bophirima API (Vercel Serverless & Express)',
    location: 'Klerksdorp, North West, South Africa',
    supabase: isSupabaseConfigured() ? 'configured' : 'fallback-memory',
    theme: storeTheme,
    timestamp: new Date().toISOString()
  });
});

// Supabase Status
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const status = await checkSupabaseConnection();
  res.json({
    success: true,
    isConfigured: isSupabaseConfigured(),
    ...status
  });
});

// Settings & Theme
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    settings: {
      defaultTheme: storeTheme,
      freeShippingThreshold: 999,
      whatsappContact: '+27 64 062 9602',
      studioAddress: 'Flamwood / Wilkoppies, Klerksdorp, North West, 2571',
      supabaseConnected: isSupabaseConfigured()
    }
  });
});

app.post('/api/settings/theme', (req: Request, res: Response) => {
  const { theme } = req.body;
  if (theme === 'dark' || theme === 'light') {
    storeTheme = theme;
  }
  res.json({ success: true, theme: storeTheme });
});

// Products
app.get('/api/products', async (req: Request, res: Response) => {
  let list: Product[] = [];

  if (isSupabaseConfigured()) {
    const dbProds = await fetchSupabaseProducts();
    if (dbProds && dbProds.length > 0) {
      list = dbProds;
    } else {
      list = [...products];
    }
  } else {
    list = [...products];
  }

  const { category, search, sort, minPrice, maxPrice, inStockOnly } = req.query;

  if (category && category !== 'All Pieces') {
    list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    list = list.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter((p) => p.price <= Number(maxPrice));
  }
  if (inStockOnly === 'true') {
    list = list.filter((p) => p.inStock && p.stockQuantity > 0);
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'bestseller') {
    list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  }

  res.json({ success: true, total: list.length, products: list });
});

app.post('/api/products', async (req: Request, res: Response) => {
  const body = req.body;
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title: body.title || 'Untitled 018 Piece',
    category: body.category || 'Luxury Knitwear',
    price: Number(body.price) || 450,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    rating: 5.0,
    reviewsCount: 1,
    sizes: body.sizes && body.sizes.length ? body.sizes : ['S', 'M', 'L', 'XL'],
    colors: body.colors && body.colors.length ? body.colors : ['Jet Black', '018 Orange'],
    description: body.description || 'Crafted with premium South African knitwear heritage.',
    features: body.features && body.features.length ? body.features : ['Engineered in Klerksdorp, North West'],
    image: body.image || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    secondaryImages: body.secondaryImages || [],
    inStock: body.inStock !== false,
    stockQuantity: Number(body.stockQuantity) || 15,
    sku: body.sku || `018-NW-${Math.floor(100 + Math.random() * 900)}`,
    tag: body.tag || 'NEW DROP',
    isNew: true,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const saved = await insertSupabaseProduct(newProduct);
    if (saved) {
      return res.status(201).json({ success: true, product: saved });
    }
  }

  products.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (isSupabaseConfigured()) {
    await deleteSupabaseProduct(id);
  }
  products = products.filter((p) => p.id !== id);
  res.json({ success: true, id });
});

// Orders
app.get('/api/orders', async (req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const dbOrders = await fetchSupabaseOrders();
    if (dbOrders) {
      return res.json({ success: true, total: dbOrders.length, orders: dbOrders });
    }
  }
  res.json({ success: true, total: orders.length, orders });
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const { customer, items, subtotal, shippingFee, discount, total, deliveryMethod, paymentMethod } = req.body;

  if (!customer || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Missing order items or customer' });
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `018-BK-${randomNum}`;
  const orderId = `ord-${Date.now()}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customer,
    items,
    subtotal: Number(subtotal),
    shippingFee: Number(shippingFee || 0),
    discount: Number(discount || 0),
    total: Number(total),
    deliveryMethod: deliveryMethod || 'courier_guy',
    status: 'paid',
    paymentMethod: paymentMethod || 'payfast',
    trackingNumber: deliveryMethod === 'courier_guy' ? `TCG-${randomNum}` : deliveryMethod === 'paxi' ? `PAXI-${randomNum}` : undefined,
    courierName: deliveryMethod === 'courier_guy' ? 'The Courier Guy' : deliveryMethod === 'paxi' ? 'PAXI PEP Stores' : 'Klerksdorp Studio Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const saved = await insertSupabaseOrder(newOrder);
    if (saved) {
      return res.status(201).json({ success: true, order: saved });
    }
  }

  orders.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { status, trackingNumber } = req.body;
  const id = req.params.id;

  if (isSupabaseConfigured()) {
    await updateSupabaseOrderStatus(id, status as OrderStatus, trackingNumber);
  }

  const order = orders.find((o) => o.id === id || o.orderNumber === id);
  if (order) {
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();
  }

  res.json({ success: true, order });
});

// PayFast
app.post('/api/payfast/checkout', (req: Request, res: Response) => {
  const { order, returnUrl, cancelUrl } = req.body;
  if (!order) {
    return res.status(400).json({ success: false, message: 'Order data required' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
  const passphrase = process.env.PAYFAST_PASSPHRASE || 'payfast_salt_dev';
  const isSandbox = process.env.PAYFAST_SANDBOX !== 'false';

  const hostUrl = process.env.APP_URL || 'http://localhost:3000';
  const appReturnUrl = returnUrl || `${hostUrl}/?payment=success&orderId=${order.id || order.orderNumber}`;
  const appCancelUrl = cancelUrl || `${hostUrl}/?payment=cancelled`;
  const appNotifyUrl = `${hostUrl}/api/payfast/notify`;

  const names = (order.customer?.fullName || 'Customer').split(' ');
  const firstName = names[0] || 'Customer';
  const lastName = names.slice(1).join(' ') || '018';

  const payfastData: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: appReturnUrl,
    cancel_url: appCancelUrl,
    notify_url: appNotifyUrl,
    name_first: firstName,
    name_last: lastName,
    email_address: order.customer?.email || 'customer@018.co.za',
    cell_number: order.customer?.phone || '0640629602',
    m_payment_id: order.orderNumber || `018-${Date.now()}`,
    amount: Number(order.total).toFixed(2),
    item_name: `018 Bokone Order ${order.orderNumber}`,
    item_description: `018 Curated Streetwear & Knitwear (${order.items?.length || 1} items)`
  };

  const signature = generatePayFastSignature(payfastData, passphrase);
  payfastData.signature = signature;

  const payfastGatewayUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  res.json({
    success: true,
    gatewayUrl: payfastGatewayUrl,
    isSandbox,
    payload: payfastData
  });
});

app.post('/api/payfast/notify', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Community
app.get('/api/community', async (req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const dbPhotos = await fetchSupabaseCommunityPhotos();
    if (dbPhotos && dbPhotos.length > 0) {
      return res.json({ success: true, total: dbPhotos.length, photos: dbPhotos });
    }
  }
  res.json({ success: true, total: communityPhotos.length, photos: communityPhotos });
});

app.post('/api/community', async (req: Request, res: Response) => {
  const { userName, handle, location, caption, imageUrl, productTagged, source } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  const newPhoto: CommunityPhoto = {
    id: `comm-${Date.now()}`,
    userName: userName || '018 Family Member',
    handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '@018_wearer',
    location: location || 'Klerksdorp, North West',
    caption: caption || 'Wearing 018 Bokone Bophirima boldly.',
    imageUrl,
    productTagged: productTagged || '018 Signature Collection',
    likes: Math.floor(12 + Math.random() * 20),
    createdAt: new Date().toISOString(),
    source: source === 'camera' ? 'camera' : 'gallery'
  };

  if (isSupabaseConfigured()) {
    const saved = await insertSupabaseCommunityPhoto(newPhoto);
    if (saved) {
      return res.status(201).json({ success: true, photo: saved });
    }
  }

  communityPhotos.unshift(newPhoto);
  res.status(201).json({ success: true, photo: newPhoto });
});

app.post('/api/community/:id/like', (req: Request, res: Response) => {
  const photo = communityPhotos.find((p) => p.id === req.params.id);
  if (photo) {
    photo.likes += 1;
    return res.json({ success: true, likes: photo.likes });
  }
  res.json({ success: true, likes: 1 });
});

// Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'processing' || o.status === 'paid').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= 5).length;

  const stats: AdminStats = {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    lowStockCount,
    communityPhotosCount: communityPhotos.length
  };

  res.json({ success: true, stats });
});

export default app;
