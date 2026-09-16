import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

import { INITIAL_PRODUCTS, INITIAL_COMMUNITY_PHOTOS } from './src/data/mockProducts';
import { Product, Order, CommunityPhoto, AdminStats, ThemeMode, OrderStatus } from './src/types';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  setRuntimeSupabaseCredentials,
  fetchSupabaseProducts,
  insertSupabaseProduct,
  updateSupabaseProduct,
  updateSupabaseProductStock,
  deleteSupabaseProduct,
  fetchSupabaseOrders,
  insertSupabaseOrder,
  updateSupabaseOrderStatus,
  fetchSupabaseCommunityPhotos,
  insertSupabaseCommunityPhoto,
  likeSupabaseCommunityPhoto,
  checkSupabaseConnection,
  seedSupabaseDatabase
} from './src/lib/supabase';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-Memory Stateful Store (Persists during server lifecycle as immediate fallback)
let products: Product[] = [...INITIAL_PRODUCTS];
let communityPhotos: CommunityPhoto[] = [...INITIAL_COMMUNITY_PHOTOS];
let storeTheme: ThemeMode = 'dark';
let orders: Order[] = [

  {
    id: 'ord-1001',
    orderNumber: '018-BK-89021',
    customer: {
      fullName: 'Kagiso Moloi',
      email: 'kagiso.moloi@gmail.com',
      phone: '082 555 1234',
      addressLine1: '14 Flamwood Drive',
      city: 'Klerksdorp',
      province: 'North West',
      postalCode: '2571',
      notes: 'Leave at front gate if not home'
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        selectedSize: '1 SIZE (Adjustable Strap)',
        selectedColor: 'Desert Sand / Ice Cream Pastel',
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[2],
        selectedSize: 'L',
        selectedColor: 'Black / Monogram Print',
        quantity: 1
      }
    ],
    subtotal: 1370,
    shippingFee: 0,
    discount: 0,
    total: 1370,
    deliveryMethod: 'courier_guy',
    status: 'processing',
    paymentMethod: 'payfast',
    payfastData: {
      pfPaymentId: 'PF-2026-948172',
      statusText: 'COMPLETE'
    },
    trackingNumber: 'TCG-018-994821',
    courierName: 'The Courier Guy',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

// Helper: PayFast signature generation
function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  // Filter empty and sort by keys
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

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: '018 Bokone Bophirima API',
    location: 'Klerksdorp, North West, South Africa',
    version: '2.1.0',
    supabase: isSupabaseConfigured() ? 'connected' : 'fallback_memory',
    theme: storeTheme,
    timestamp: new Date().toISOString()
  });
});

// Supabase Status & Credentials Management
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  const status = await checkSupabaseConnection();
  const config = getSupabaseConfig();
  res.json({
    success: true,
    isConfigured: isSupabaseConfigured(),
    url: config.url || '',
    hasKey: Boolean(config.key),
    ...status
  });
});

app.post('/api/supabase/config', async (req: Request, res: Response) => {
  const { url, key, autoSeed } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, message: 'Supabase URL and API Key are required' });
  }

  setRuntimeSupabaseCredentials(url, key);
  const status = await checkSupabaseConnection();

  let seedResult = null;
  if (status.connected && autoSeed) {
    seedResult = await seedSupabaseDatabase(products, communityPhotos);
    // Refresh in-memory lists from Supabase
    const dbProds = await fetchSupabaseProducts();
    if (dbProds && dbProds.length > 0) {
      products = dbProds;
    }
    const dbPhotos = await fetchSupabaseCommunityPhotos();
    if (dbPhotos && dbPhotos.length > 0) {
      communityPhotos = dbPhotos;
    }
  }

  res.json({
    success: true,
    isConfigured: isSupabaseConfigured(),
    ...status,
    seedResult
  });
});

// Seed Supabase Database On-Demand
app.post('/api/supabase/seed', async (req: Request, res: Response) => {
  if (!isSupabaseConfigured()) {
    return res.status(400).json({ success: false, message: 'Supabase is not configured yet' });
  }

  const result = await seedSupabaseDatabase(products, communityPhotos);
  const dbProds = await fetchSupabaseProducts();
  if (dbProds && dbProds.length > 0) {
    products = dbProds;
  }
  const dbPhotos = await fetchSupabaseCommunityPhotos();
  if (dbPhotos && dbPhotos.length > 0) {
    communityPhotos = dbPhotos;
  }

  res.json({
    success: result.success,
    message: result.message,
    totalProducts: products.length,
    totalPhotos: communityPhotos.length
  });
});

// Serve Supabase schema.sql file directly
app.get('/api/supabase/sql', (req: Request, res: Response) => {
  try {
    const sqlPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(sqlContent);
    } else {
      res.status(404).json({ error: 'schema.sql not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read schema.sql' });
  }
});

// Store Settings & Theme
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

// Products CRUD & Search
app.get('/api/products', async (req: Request, res: Response) => {
  let result: Product[] = [];

  if (isSupabaseConfigured()) {
    const dbProds = await fetchSupabaseProducts();
    if (dbProds && dbProds.length > 0) {
      result = dbProds;
      products = dbProds; // Sync local cache
    } else {
      result = [...products];
    }
  } else {
    result = [...products];
  }

  const { category, search, sort, minPrice, maxPrice, inStockOnly } = req.query;

  if (category && category !== 'All Pieces') {
    result = result.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    result = result.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter((p) => p.price <= Number(maxPrice));
  }

  if (inStockOnly === 'true') {
    result = result.filter((p) => p.inStock && p.stockQuantity > 0);
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'bestseller') {
    result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
  } else {
    // Default newest
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({
    success: true,
    total: result.length,
    products: result
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const item = products.find((p) => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product: item });
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
    features: body.features && body.features.length ? body.features : ['Engineered in Klerksdorp, North West', '100% Proudly Local'],
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
      products.unshift(saved);
      return res.status(201).json({ success: true, product: saved });
    }
  }

  products.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const index = products.findIndex((p) => p.id === id);

  if (isSupabaseConfigured()) {
    await updateSupabaseProduct(id, req.body);
  }

  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...req.body,
      stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : products[index].stockQuantity,
      inStock: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) > 0 : products[index].inStock
    };
    return res.json({ success: true, product: products[index] });
  }

  res.json({ success: true, product: req.body });
});

app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { stockQuantity } = req.body;
  const qty = Number(stockQuantity);

  if (isNaN(qty)) {
    return res.status(400).json({ success: false, message: 'Invalid stock number' });
  }

  if (isSupabaseConfigured()) {
    await updateSupabaseProductStock(id, qty);
  }

  const prod = products.find((p) => p.id === id);
  if (prod) {
    prod.stockQuantity = qty;
    prod.inStock = qty > 0;
  }

  res.json({ success: true, id, stockQuantity: qty, inStock: qty > 0 });
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (isSupabaseConfigured()) {
    await deleteSupabaseProduct(id);
  }
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
  }
  res.json({ success: true, id });
});

// Categories summary
app.get('/api/categories', (req: Request, res: Response) => {
  const categoriesMap: Record<string, number> = {};
  products.forEach((p) => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });

  const categories = Object.keys(categoriesMap).map((name) => ({
    name,
    count: categoriesMap[name]
  }));

  res.json({ success: true, categories });
});

// Orders & Checkout
app.get('/api/orders', async (req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const dbOrders = await fetchSupabaseOrders();
    if (dbOrders) {
      return res.json({ success: true, total: dbOrders.length, orders: dbOrders });
    }
  }
  res.json({ success: true, total: orders.length, orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

app.post('/api/orders', async (req: Request, res: Response) => {
  const { customer, items, subtotal, shippingFee, discount, total, deliveryMethod, paymentMethod } = req.body;

  if (!customer || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Missing order items or customer details' });
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
    shippingFee: Number(shippingFee),
    discount: Number(discount || 0),
    total: Number(total),
    deliveryMethod: deliveryMethod || 'courier_guy',
    status: 'paid', // Mark as paid for completed checkout
    paymentMethod: paymentMethod || 'payfast',
    trackingNumber: deliveryMethod === 'courier_guy' ? `TCG-${randomNum}` : deliveryMethod === 'paxi' ? `PAXI-${randomNum}` : undefined,
    courierName: deliveryMethod === 'courier_guy' ? 'The Courier Guy' : deliveryMethod === 'paxi' ? 'PAXI PEP Stores' : 'Klerksdorp Studio Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Decrement stock levels
  items.forEach((item: any) => {
    const prod = products.find((p) => p.id === item.product.id);
    if (prod) {
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      if (prod.stockQuantity === 0) {
        prod.inStock = false;
      }
    }
  });

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
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, order });
});

// -------------------------------------------------------------
// PayFast Gateway Integration (South Africa)
// -------------------------------------------------------------
app.post('/api/payfast/checkout', (req: Request, res: Response) => {
  const { order, returnUrl, cancelUrl } = req.body;

  if (!order) {
    return res.status(400).json({ success: false, message: 'Order data required' });
  }

  const merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100'; // PayFast default sandbox
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
  const passphrase = process.env.PAYFAST_PASSPHRASE || 'payfast_salt_dev';
  const isSandbox = process.env.PAYFAST_SANDBOX !== 'false';

  const hostUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const appReturnUrl = returnUrl || `${hostUrl}/?payment=success&orderId=${order.id || order.orderNumber}`;
  const appCancelUrl = cancelUrl || `${hostUrl}/?payment=cancelled`;
  const appNotifyUrl = `${hostUrl}/api/payfast/notify`;

  // PayFast formatted fields
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

  // Generate cryptographic MD5 signature
  const signature = generatePayFastSignature(payfastData, passphrase);
  payfastData.signature = signature;

  const payfastGatewayUrl = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';

  res.json({
    success: true,
    gatewayUrl: payfastGatewayUrl,
    isSandbox,
    payload: payfastData,
    supportedPaymentMethods: [
      { id: 'instant_eft', name: 'Instant EFT (Capitec, FNB, Absa, Standard Bank, Nedbank, Tyme)' },
      { id: 'visa_mastercard', name: 'Debit / Credit Card (Visa, Mastercard)' },
      { id: 'capitec_pay', name: 'Capitec Pay (Direct phone approval)' },
      { id: 'snapscan_zapper', name: 'Scan to Pay (SnapScan, Zapper, Masterpass)' }
    ]
  });
});

// PayFast Instant Transaction Notification (ITN) Webhook
app.post('/api/payfast/notify', (req: Request, res: Response) => {
  const pfData = req.body;
  const paymentId = pfData.m_payment_id;
  const paymentStatus = pfData.payment_status; // 'COMPLETE'

  const order = orders.find((o) => o.orderNumber === paymentId || o.id === paymentId);
  if (order) {
    if (paymentStatus === 'COMPLETE') {
      order.status = 'paid';
      order.payfastData = {
        pfPaymentId: pfData.pf_payment_id,
        signature: pfData.signature,
        statusText: paymentStatus
      };
      order.updatedAt = new Date().toISOString();
    }
  }

  // PayFast expects 200 OK
  res.status(200).send('OK');
});

// -------------------------------------------------------------
// Photo Uploads & Community Looks (Camera & Gallery)
// -------------------------------------------------------------
app.get('/api/community', async (req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const dbPhotos = await fetchSupabaseCommunityPhotos();
    if (dbPhotos && dbPhotos.length > 0) {
      return res.json({
        success: true,
        total: dbPhotos.length,
        photos: dbPhotos
      });
    }
  }

  res.json({
    success: true,
    total: communityPhotos.length,
    photos: communityPhotos
  });
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

app.post('/api/community/:id/like', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (isSupabaseConfigured()) {
    await likeSupabaseCommunityPhoto(id);
  }

  const photo = communityPhotos.find((p) => p.id === id);
  if (!photo) {
    return res.status(404).json({ success: false, message: 'Photo not found' });
  }
  photo.likes += 1;
  res.json({ success: true, likes: photo.likes });
});

// Generic Media / Image Upload endpoint (accepts base64 data URL)
app.post('/api/upload', (req: Request, res: Response) => {
  const { imageBase64, filename, source } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ success: false, message: 'No image data provided' });
  }

  // Return formatted URL (data URI is stored and can be rendered directly in <img> tags)
  res.json({
    success: true,
    url: imageBase64,
    source: source || 'gallery',
    filename: filename || `018-upload-${Date.now()}.jpg`,
    uploadedAt: new Date().toISOString()
  });
});

// Admin Stats
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

// -------------------------------------------------------------
// Vite Middleware & Static Server
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 018 Bokone Bophirima Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
