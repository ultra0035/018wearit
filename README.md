# 018 Bokone Bophirima | Official Store & Curated Knitwear

> **"NOT JUST A BRAND, IT'S A LIFESTYLE."**  
> *Rooted in Bokone Bophirima (North West Province, Area Code 018). Born in Klerksdorp, South Africa.*

---

## 🎨 1. Color Palette & Brand Design System

Cloned from the official **018 Bokone Bophirima** brand identity:

| Token / Role | Hex Code | RGB | Description / Usage |
| :--- | :--- | :--- | :--- |
| **018 Electric Orange (Primary)** | `#FF5500` | `rgb(255, 85, 0)` | Hero CTA buttons (`SHOP THE COLLECTION`, `JOIN`), brand logo, active badge pills, promo highlights, delivery icons |
| **018 Deep Sunset (Hover)** | `#E04A00` | `rgb(224, 74, 0)` | Hover state for primary buttons and interactive links |
| **Pitch Black (Background)** | `#0C0D0E` | `rgb(12, 13, 14)` | Deep streetwear canvas, hero section, announcement bar, footer background |
| **Charcoal Surface** | `#151619` | `rgb(21, 22, 25)` | Product cards, navigation bar backdrop, search modals, drawers |
| **Elevated Card Surface** | `#1C1D22` | `rgb(28, 29, 34)` | Nested components, filter pills, input fields |
| **Subtle Border** | `#2A2C33` | `rgb(42, 44, 51)` | Clean geometric dividers and card borders |
| **Pure White** | `#FFFFFF` | `rgb(255, 255, 255)` | High-contrast display typography, modal canvas |
| **Sandstone Light (Canvas)** | `#F8F8FA` | `rgb(248, 248, 250)` | Product catalog section background (light theme contrast) |
| **Gold Star Rating** | `#F59E0B` | `rgb(245, 158, 11)` | Customer review stars (4.8, 4.9, 5.0) |

---

## 🗄️ 2. Database Architecture & Design

The database is designed with support for both **Relational SQL (PostgreSQL / Cloud SQL)** and **Document NoSQL (Firestore)**.

```
       +--------------------+          +---------------------+
       |     CUSTOMERS      |          |     CATEGORIES      |
       +--------------------+          +---------------------+
       | id (PK)            |          | id (PK)             |
       | email              |          | name                |
       | phone              |          | slug                |
       +---------+----------+          +----------+----------+
                 | 1                              | 1
                 |                                |
                 | N                              | N
       +---------v----------+          +----------v----------+
       |       ORDERS       |          |      PRODUCTS       |
       +--------------------+          +---------------------+
       | id (PK)            |          | id (PK)             |
       | order_number (018) |          | title               |
       | customer_id (FK)   |          | category_id (FK)    |
       | subtotal, total    |          | price, stock_qty    |
       | status (paid, etc) |          | sku, images []      |
       +---------+----------+          +----------+----------+
                 | 1                              | 1
                 |                                |
                 | N                              | N
       +---------v--------------------------------v----------+
       |                    ORDER_ITEMS                      |
       +-----------------------------------------------------+
       | id (PK), order_id (FK), product_id (FK)             |
       | selected_size, selected_color, quantity, unit_price |
       +-----------------------------------------------------+
                 | 1
                 |
                 | 1
       +---------v-------------------------------------------+
       |                PAYFAST_TRANSACTIONS                 |
       +-----------------------------------------------------+
       | id (PK), order_id (FK), pf_payment_id, amount       |
       | status (COMPLETE), signature, payment_method        |
       +-----------------------------------------------------+
```

### PostgreSQL DDL Schema

```sql
-- 1. Categories
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    sizes TEXT[] NOT NULL DEFAULT '{"S", "M", "L", "XL"}',
    colors TEXT[] NOT NULL DEFAULT '{"Jet Black", "018 Orange"}',
    description TEXT NOT NULL,
    features TEXT[] NOT NULL,
    image TEXT NOT NULL,
    secondary_images TEXT[],
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 15,
    tag VARCHAR(50),
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(50) REFERENCES customers(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    delivery_method VARCHAR(50) NOT NULL, -- 'courier_guy', 'paxi', 'studio_pickup'
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment', -- 'paid', 'processing', 'shipped', 'delivered'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'payfast',
    tracking_number VARCHAR(100),
    courier_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    selected_size VARCHAR(50) NOT NULL,
    selected_color VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- 6. PayFast Transactions
CREATE TABLE payfast_transactions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    m_payment_id VARCHAR(100) NOT NULL,
    pf_payment_id VARCHAR(100),
    payment_status VARCHAR(50) NOT NULL, -- 'COMPLETE', 'FAILED', 'CANCELLED'
    amount_gross DECIMAL(10, 2) NOT NULL,
    amount_fee DECIMAL(10, 2),
    amount_net DECIMAL(10, 2),
    signature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Community Street Style Looks (Camera / Gallery Uploads)
CREATE TABLE community_looks (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    handle VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    product_tagged VARCHAR(255),
    likes INT DEFAULT 0,
    source VARCHAR(20) DEFAULT 'gallery', -- 'camera', 'gallery'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payfast_order ON payfast_transactions(order_id);
```

---

## 💳 3. South African PayFast Payment Integration

The application integrates with **PayFast by Network**, South Africa's leading payment gateway.

### Supported South African Payment Rails:
1. **Instant EFT**: Automated bank verification across all SA banks (Capitec, FNB, Absa, Standard Bank, Nedbank, Investec, TymeBank).
2. **Capitec Pay**: One-click in-app mobile banking approval.
3. **Visa & Mastercard Credit/Debit**: 3D-Secure 2.0 compliant card processing.
4. **Scan to Pay**: SnapScan, Zapper, and Masterpass QR codes.

### Signature Generation Implementation

PayFast requires an MD5 hashed signature built from alphabetical parameter serialization plus an optional passphrase:

```typescript
function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  const keys = Object.keys(data).filter(k => k !== 'signature' && data[k] !== undefined && data[k] !== '');
  let pfOutput = '';
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = data[key].trim();
    pfOutput += `${key}=${encodeURIComponent(val).replace(/%20/g, '+')}`;
    if (i < keys.length - 1) pfOutput += '&';
  }
  if (passphrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  return crypto.createHash('md5').update(pfOutput).digest('hex');
}
```

### PayFast Flow & Webhook Architecture:
1. **Checkout Submission (`POST /api/payfast/checkout`)**:
   - Backend validates cart & totals.
   - Calculates the PayFast security signature with merchant credentials.
   - Returns structured redirect parameters to the frontend.
2. **Gateway Processing**:
   - User completes payment via Sandbox or Live PayFast portal (`https://sandbox.payfast.co.za/eng/process`).
3. **Instant Transaction Notification (`POST /api/payfast/notify`)**:
   - PayFast posts ITN status (`payment_status: COMPLETE`) to the server.
   - Backend marks order as `paid`, sets up The Courier Guy tracking ID, and notifies inventory.

---

## 📸 4. Camera & Gallery Picture Upload System

Requirement #6 specifies: *"must be able to upload pictures from gallery or take photo"*.

### Dual Capture Modes Built-In:
1. **Live Camera Capture (WebRTC)**:
   - Uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })`
   - Real-time video preview with live capture trigger
   - Flip camera support (front / rear on mobile devices)
   - Freeze frame review, retake, or accept snapshot
2. **Device Gallery & File Upload**:
   - Drag-and-drop zone or system file selector
   - Supports JPG, PNG, WEBP, and HEIC
   - Instant client-side preview with size optimization

### Available in Two Key Places:
- **"Wear Your 018 Style" Community Showcase**: Customers snap a photo in their 018 Bokone knitwear or pick an outfit photo from their camera roll to post with location and caption.
- **Admin & Inventory Manager**: Store staff can instantly snap a photo of a new garment or cap directly from the studio table to add it into inventory.

---

## 🚀 5. REST API Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Query products with category, price range, and search |
| `POST` | `/api/products` | Create new garment/cap with photo from camera/gallery |
| `PUT` | `/api/products/:id` | Update product details, pricing, and stock quantity |
| `DELETE`| `/api/products/:id` | Remove a product from the catalog |
| `GET` | `/api/orders` | List store orders with fulfillment status |
| `POST` | `/api/orders` | Create customer order and reserve stock |
| `POST` | `/api/payfast/checkout` | Generate signed PayFast gateway payload |
| `POST` | `/api/payfast/notify` | PayFast ITN Webhook receiver |
| `GET` | `/api/community` | Get live customer street looks |
| `POST` | `/api/community` | Submit outfit photo from camera or gallery |
| `POST` | `/api/community/:id/like` | Like a customer look |
| `GET` | `/api/stats` | Retrieve store revenue, order count, and low-stock alerts |

---

## 📦 6. Running Locally & Production Build

### Development Mode
```bash
npm run dev
# Starts fullstack server (Express API + Vite Dev Server) on port 3000
```

### Production Build
```bash
npm run build
# Compiles frontend assets to /dist and bundles backend with esbuild into /dist/server.cjs
```

### Production Launch
```bash
npm start
# Runs high-performance production server
```

---

*Designed & Engineered for **018 Bokone Bophirima** • Klerksdorp, North West, South Africa (2571).*
