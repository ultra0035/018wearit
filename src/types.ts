export type ProductCategory =
  | 'All Pieces'
  | 'Caps'
  | 'Hats'
  | 'Bags'
  | 'Accessories'
  | 'Luxury Knitwear'
  | 'Dresses'
  | 'Hoodies & Sweats'
  | 'Polos & Knits'
  | 'T-Shirts'
  | 'Headwear & Beanies'
  | 'Combos';

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: number; // in South African Rand (ZAR)
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  sizes: string[];
  colors: string[];
  description: string;
  features: string[];
  image: string;
  secondaryImages: string[];
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  tag?: 'NEW DROP' | 'BESTSELLER' | 'LIMITED' | 'SAVE R700';
  isNew?: boolean;
  isBestseller?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export type DeliveryMethod = 'courier_guy' | 'paxi' | 'studio_pickup';

export interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export const SOUTH_AFRICA_PROVINCES = [
  'North West',
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'Northern Cape'
] as const;

export type SouthAfricaProvince = typeof SOUTH_AFRICA_PROVINCES[number];

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  paymentMethod: 'payfast' | 'capitec_pay' | 'instant_eft' | 'card';
  payfastData?: {
    pfPaymentId?: string;
    signature?: string;
    token?: string;
    statusText?: string;
  };
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPhoto {
  id: string;
  userName: string;
  handle: string;
  location: string;
  caption: string;
  imageUrl: string;
  productTagged?: string;
  likes: number;
  createdAt: string;
  source: 'camera' | 'gallery' | 'curated';
}

export interface PayFastPaymentRequest {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  signature?: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  communityPhotosCount: number;
}

export type ThemeMode = 'dark' | 'light';

export interface StoreSettings {
  defaultTheme: ThemeMode;
  freeShippingThreshold: number;
  whatsappContact: string;
  studioAddress: string;
  supabaseConnected: boolean;
}

export interface SupabaseStatus {
  isConfigured: boolean;
  connected: boolean;
  url: string;
  message: string;
}

