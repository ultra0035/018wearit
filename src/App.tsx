import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { AdminDashboard } from './components/AdminDashboard';
import { QuickSearchModal } from './components/QuickSearchModal';
import { FilterDrawer } from './components/FilterDrawer';
import { CommunitySection } from './components/CommunitySection';
import { Footer } from './components/Footer';

import { Product, CartItem, CommunityPhoto, Order, ProductCategory, OrderStatus, ThemeMode } from './types';
import { INITIAL_PRODUCTS, INITIAL_COMMUNITY_PHOTOS } from './data/mockProducts';

export default function App() {
  // --- THEME STATE (Requirement 1: Light & Dark mode for frontend and backend) ---
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('018_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // Apply theme to document root
  useEffect(() => {
    try {
      localStorage.setItem('018_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Sync theme with backend API
  const handleToggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);

    try {
      await fetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme })
      });
    } catch (e) {
      // Offline fallback
    }
  };

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>(INITIAL_COMMUNITY_PHOTOS);
  const [orders, setOrders] = useState<Order[]>([]);


  // Filtering & Catalog State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All Pieces');
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 3000]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('newest');

  // Shopping Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('018_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('018_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Modals & Drawers Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Persist cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('018_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('018_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Sync with Backend (API & Supabase)
  const syncWithBackend = async () => {
    try {
      const [prodRes, commRes, orderRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/community').catch(() => null),
        fetch('/api/orders').catch(() => null)
      ]);

      if (prodRes && prodRes.ok) {
        const data = await prodRes.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      }

      if (commRes && commRes.ok) {
        const data = await commRes.json();
        if (data.photos) {
          setCommunityPhotos(data.photos);
        }
      }

      if (orderRes && orderRes.ok) {
        const data = await orderRes.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('API data sync notice:', err);
    }
  };

  // Load API Data from Backend & Setup Periodic Sync
  useEffect(() => {
    syncWithBackend();

    // Auto-sync every 15s to keep storefront and admin real-time
    const interval = setInterval(syncWithBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    selectedSize: string = 'M',
    selectedColor: string = 'Default',
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedSize, selectedColor }];
      }
    });

    showToast(`Added "${product.title}" (${selectedSize}) to Bag!`);
  };

  const handleQuickAddToCart = (product: Product) => {
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0] || 'Default';
    handleAddToCart(product, defaultSize, defaultColor, 1);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyPromo = (code: string): boolean => {
    if (code === '018VIP' || code === 'BOKONE' || code === 'KLERKSDORP') {
      setDiscountPercent(10);
      return true;
    }
    return false;
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed "${product.title}" from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Added "${product.title}" to Wishlist!`);
        return [...prev, product.id];
      }
    });
  };

  // Community Photo operations
  const handlePhotoUploaded = (photo: CommunityPhoto) => {
    setCommunityPhotos((prev) => [photo, ...prev]);
    showToast('Your 018 street look has been published to the community feed!');
  };

  const handleLikePhoto = async (photoId: string) => {
    // Optimistic UI update
    setCommunityPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likes: p.likes + 1 } : p))
    );

    try {
      await fetch(`/api/community/${photoId}/like`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  // Order fulfillment & PayFast checkout
  const handleOrderSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setPlacedOrder(order);
  };

  // Admin Actions
  const handleAdminAddProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showToast(`Added new piece "${data.product.title}" to catalog!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    tracking?: string
  ) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber: tracking })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status, trackingNumber: tracking || o.trackingNumber } : o))
        );
        showToast(`Order status updated to ${status.toUpperCase()}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product removed from catalog');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock })
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, stockQuantity: newStock, inStock: newStock > 0 } : p
          )
        );
        showToast(`Stock updated to ${newStock} units`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data.product } : p))
        );
        showToast(`Updated product "${data.product.title || ''}"`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('All Pieces');
    setPriceRange([200, 3000]);
    setSelectedSize('');
    setInStockOnly(false);
    setSortOption('newest');
  };

  // Filter and Sort Calculations
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category Filter
    if (selectedCategory !== 'All Pieces') {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Price Filter
    list = list.filter((p) => p.price <= priceRange[1]);

    // Size Filter
    if (selectedSize) {
      list = list.filter((p) => p.sizes.includes(selectedSize));
    }

    // In Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => p.stockQuantity > 0);
    }

    // Sorting
    if (sortOption === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'bestseller') {
      list.sort((a, b) => (b.tag === 'BESTSELLER' ? 1 : 0) - (a.tag === 'BESTSELLER' ? 1 : 0));
    } else {
      // newest
      list.sort((a, b) => (b.tag === 'NEW DROP' ? 1 : 0) - (a.tag === 'NEW DROP' ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, priceRange, selectedSize, inStockOnly, sortOption]);

  const activeFilterCount =
    (selectedCategory !== 'All Pieces' ? 1 : 0) +
    (priceRange[1] < 3000 ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Unique Categories
  const allCategories: ProductCategory[] = [
    'All Pieces',
    'Caps',
    'Hats',
    'Bags',
    'Accessories',
    'Luxury Knitwear',
    'Dresses',
    'Hoodies & Sweats',
    'Polos & Knits',
    'T-Shirts',
    'Headwear & Beanies',
    'Combos'
  ];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0c0d0f] text-zinc-100'} flex flex-col font-sans selection:bg-[#ff5500] selection:text-black antialiased transition-colors duration-200`}>
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16171d] border border-[#ff5500] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPhotoUpload={() => setIsPhotoUploadOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />


      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section matching screenshots */}
        <Hero
          onShopCollection={() => {
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCombo={() => {
            setSelectedCategory('Combos');
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Section */}
        <section id="catalog-section" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Bar, Studio Banner & Filters Toolbar */}
          <CategoryBar
            categories={allCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
            activeFilterCount={activeFilterCount}
            onResetFilters={handleResetFilters}
            totalProductsCount={products.length}
            filteredProductsCount={filteredProducts.length}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-[#131418] rounded-2xl border border-[#23252e]">
              <p className="text-zinc-300 font-bold text-sm">No pieces matched your selected filter criteria</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#ff5500] text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={setSelectedProductModal}
                  onQuickAddToCart={handleQuickAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* Community "Wear What We Dial (018)" Section */}
        <CommunitySection
          photos={communityPhotos}
          onLikePhoto={handleLikePhoto}
          onOpenPhotoUpload={() => setIsPhotoUploadOpen(true)}
        />
      </main>

      {/* Global Footer (Contains Admin & Inventory Portal) */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* --- DRAWERS & MODALS --- */}


      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        discount={discountPercent}
        onApplyPromo={handleApplyPromo}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        inStockOnly={inStockOnly}
        onToggleInStock={setInStockOnly}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredProducts.length}
      />

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProductModal(p)}
      />

      {/* Single Product Quick View & Specs Modal */}
      <ProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProductModal ? wishlist.includes(selectedProductModal.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* PayFast South Africa Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        subtotal={subtotal}
        discount={discountPercent}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmed Success Receipt Modal */}
      <OrderSuccessModal
        order={placedOrder}
        onClose={() => setPlacedOrder(null)}
        onContinueShopping={() => setPlacedOrder(null)}
      />

      {/* Photo Capture & Gallery Upload Modal (Req #6) */}
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        products={products}
        onPhotoUploaded={handlePhotoUploaded}
      />

      {/* Admin Store Inventory & Orders Management Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        communityPhotos={communityPhotos}
        onAddProduct={handleAdminAddProduct}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onDeleteProduct={handleAdminDeleteProduct}
        onUpdateStock={handleAdminUpdateStock}
        onUpdateProduct={handleAdminUpdateProduct}
        onRefreshData={syncWithBackend}
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
