import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Camera,
  Database,
  Settings,
  X,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Upload,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Sun,
  Moon,
  Trash2,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Server,
  Layers,
  Clock,
  User,
  Mail
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Product, Order, OrderStatus, ProductCategory, ThemeMode, SupabaseStatus, CommunityPhoto } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  communityPhotos: CommunityPhoto[];
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, tracking?: string) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateStock?: (id: string, newStock: number) => Promise<void>;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => Promise<void>;
  onRefreshData?: () => Promise<void>;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

type AdminPage = 'dashboard' | 'products' | 'orders' | 'community' | 'database' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  communityPhotos,
  onAddProduct,
  onUpdateOrderStatus,
  onDeleteProduct,
  onUpdateStock,
  onUpdateProduct,
  onRefreshData,
  currentTheme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  const isLight = currentTheme === 'light';

  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState<string>('all');
  
  // Mobile sidebar open
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // New Product Modal Form State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Luxury Knitwear');
  const [newPrice, setNewPrice] = useState('850');
  const [newOriginalPrice, setNewOriginalPrice] = useState('1100');
  const [newStock, setNewStock] = useState('15');
  const [newTag, setNewTag] = useState<'NEW DROP' | 'BESTSELLER' | 'LIMITED' | 'SAVE R700'>('NEW DROP');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Camera & File refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Order Details Modal
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Supabase dynamic config state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    isConfigured: false,
    connected: false,
    url: '',
    message: 'Checking connection...'
  });
  const [customDbUrl, setCustomDbUrl] = useState(() => {
    return localStorage.getItem('supabase_url') || '';
  });
  const [customDbKey, setCustomDbKey] = useState(() => {
    return localStorage.getItem('supabase_key') || '';
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [seedingDb, setSeedingDb] = useState(false);
  const [seedFeedback, setSeedFeedback] = useState<string | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDbStatus = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
        if (data.url && !customDbUrl) {
          setCustomDbUrl(data.url);
        }
      }
    } catch (e) {
      setSupabaseStatus({
        isConfigured: false,
        connected: false,
        url: '',
        message: 'Could not connect to backend server'
      });
    } finally {
      setCheckingDb(false);
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDbUrl || !customDbKey) return;
    setSavingConfig(true);
    setSeedFeedback(null);
    try {
      const cleanUrl = customDbUrl.trim();
      const cleanKey = customDbKey.trim();

      // Store in localStorage for persistent access
      localStorage.setItem('supabase_url', cleanUrl);
      localStorage.setItem('supabase_key', cleanKey);

      const res = await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          key: cleanKey,
          autoSeed: true
        })
      });
      const data = await res.json();
      setSupabaseStatus(data);
      if (data.connected) {
        setSeedFeedback('Supabase connected successfully! Database tables verified and synced with live store.');
        if (onRefreshData) await onRefreshData();
      } else {
        setSeedFeedback(`Supabase responded: ${data.message || 'Check your URL and API Key'}`);
      }
    } catch (err: any) {
      setSeedFeedback(err?.message || 'Connection failed');
    } finally {
      setSavingConfig(false);
    }
  };

  // Auto-connect if credentials already saved in localStorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('supabase_url');
    const savedKey = localStorage.getItem('supabase_key');
    if (savedUrl && savedKey) {
      fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: savedUrl, key: savedKey, autoSeed: false })
      })
        .then((r) => r.json())
        .then((data) => {
          setSupabaseStatus(data);
        })
        .catch(() => {});
    }
  }, []);

  const handleSeedDatabase = async () => {
    setSeedingDb(true);
    setSeedFeedback(null);
    try {
      const res = await fetch('/api/supabase/seed', { method: 'POST' });
      const data = await res.json();
      setSeedFeedback(data.message || 'Database seeding completed.');
      if (onRefreshData) await onRefreshData();
      await fetchDbStatus();
    } catch (err: any) {
      setSeedFeedback(err?.message || 'Seeding failed');
    } finally {
      setSeedingDb(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshData) await onRefreshData();
    await fetchDbStatus();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbStatus();
    }
  }, [isOpen]);

  // Calculations & KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const paidOrdersCount = orders.filter(o => o.status !== 'cancelled').length;
  const pendingShipmentCount = orders.filter(o => o.status === 'paid' || o.status === 'processing').length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= 6);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  // Sales chart data
  const revenueChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const baseSales = 2400 + (i * 1250) + (i === 5 || i === 6 ? 4800 : 0);
      return {
        day,
        revenue: totalRevenue > 0 ? Math.round((totalRevenue / 7) * (0.6 + (i * 0.12))) : baseSales,
        orders: Math.max(1, Math.round((orders.length / 7) * (1 + (i * 0.15))))
      };
    });
  }, [totalRevenue, orders.length]);

  // Category distribution data
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    const colors = ['#ff5500', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: map[cat],
      color: colors[idx % colors.length]
    }));
  }, [products]);

  // Start Camera
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Camera access failed. Please select an image file instead.');
      setCameraActive(false);
    }
  };

  const captureAdminPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setNewImage(dataUrl);

      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
    }
  };

  const handleAdminFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSavingProduct(true);
    try {
      await onAddProduct({
        title: newTitle.trim(),
        category: newCategory,
        price: Number(newPrice),
        originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
        description: newDescription.trim() || 'Engineered in Klerksdorp, North West.',
        stockQuantity: Number(newStock),
        tag: newTag,
        image: newImage || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        inStock: Number(newStock) > 0,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Jet Black', '018 Orange'],
        features: ['Engineered in Klerksdorp, North West', '100% Local Knitwear Heritage']
      });

      // Reset
      setNewTitle('');
      setNewPrice('850');
      setNewOriginalPrice('1100');
      setNewStock('15');
      setNewDescription('');
      setNewImage('');
      setIsAddProductOpen(false);
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  // Download SQL Schema
  const handleDownloadSql = async () => {
    try {
      const res = await fetch('/api/supabase/sql');
      const sqlContent = res.ok ? await res.text() : `-- 018 Bokone Schema\n-- View in /supabase/schema.sql`;
      const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '018-bokone-supabase-schema.sql';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not download schema file');
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = selectedOrderStatusFilter === 'all' || o.status === selectedOrderStatusFilter;
      const matchesSearch = !searchQuery ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedOrderStatusFilter, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md overflow-hidden animate-fadeIn text-left">
      {/* Container Card */}
      <div className={`relative w-full h-full max-w-[100vw] ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0d0e12] text-zinc-100'} flex flex-col md:flex-row overflow-hidden`}>
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR NAVIGATION */}
        {/* ============================================================ */}
        <aside
          className={`fixed md:relative z-30 inset-y-0 left-0 w-64 ${isLight ? 'bg-white border-r border-slate-200 shadow-lg md:shadow-none' : 'bg-[#121318] border-r border-[#22242e]'} flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand Header */}
          <div>
            <div className={`p-5 border-b ${isLight ? 'border-slate-200' : 'border-[#21232d]'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff5500] text-black font-black flex items-center justify-center text-sm shadow-md shadow-[#ff5500]/20">
                  018
                </div>
                <div>
                  <h2 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display tracking-tight leading-tight`}>
                    018 BOKONE
                  </h2>
                  <span className="text-[10px] text-[#ff5500] font-mono font-bold tracking-wider uppercase">
                    Admin Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className={`md:hidden p-1.5 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1 text-xs">
              <button
                onClick={() => {
                  setActivePage('dashboard');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'dashboard'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActivePage('products');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'products'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Products & Catalog</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activePage === 'products' ? 'bg-black/30 text-black' : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#1e2029] text-zinc-300'
                  }`}
                >
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePage('orders');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'orders'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders & Fulfillment</span>
                </div>
                {pendingShipmentCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activePage === 'orders' ? 'bg-black/30 text-black' : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                    }`}
                  >
                    {pendingShipmentCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActivePage('community');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'community'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4" />
                  <span>018 Streetwear Looks</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activePage === 'community' ? 'bg-black/30 text-black' : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#1e2029] text-zinc-300'
                  }`}
                >
                  {communityPhotos.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePage('database');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'database'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Supabase & SQL</span>
                </div>
                {supabaseStatus.connected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => {
                  setActivePage('settings');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                  activePage === 'settings'
                    ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/25'
                    : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Settings & Theme</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Info & Theme Switcher */}
          <div className={`p-3 border-t ${isLight ? 'border-slate-200' : 'border-[#21232d]'} space-y-2 text-xs`}>
            <div className={`p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#171820] border-[#262835]'} rounded-xl border flex items-center justify-between`}>
              <div>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} block font-mono`}>Database Status</span>
                <span className={`text-xs font-bold ${supabaseStatus.connected ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {supabaseStatus.connected ? 'Supabase Live' : 'Active (Local)'}
                </span>
              </div>
              <button
                onClick={fetchDbStatus}
                disabled={checkingDb}
                className={`p-1.5 ${isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'} rounded-lg transition-colors`}
                title="Refresh DB status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-[#ff5500]' : ''}`} />
              </button>
            </div>

            {/* Light / Dark Mode Toggle in Sidebar */}
            <button
              onClick={onToggleTheme}
              className={`w-full flex items-center justify-between p-2.5 ${isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#171820] hover:bg-[#20222c] border-[#262835] text-zinc-300'} rounded-xl border font-medium transition-colors`}
            >
              <div className="flex items-center gap-2">
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
                <span>{currentTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
              </div>
              <span className={`text-[10px] ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-black/40 text-zinc-400'} px-2 py-0.5 rounded uppercase font-mono`}>
                {currentTheme}
              </span>
            </button>

            {/* Close / Return to Storefront */}
            <button
              onClick={onClose}
              className={`w-full py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#20222a] hover:bg-[#2a2c38] text-zinc-300 hover:text-white'} font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5`}
            >
              <span>Back to Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ff5500]" />
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN CONTENT AREA */}
        {/* ============================================================ */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLight ? 'bg-[#f8fafc]' : 'bg-[#0c0d10]'}`}>
          
          {/* Top Header Bar */}
          <header className={`h-16 px-4 sm:px-6 ${isLight ? 'bg-white border-b border-slate-200 shadow-sm' : 'bg-[#121318] border-b border-[#21232d]'} flex items-center justify-between gap-4 flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className={`md:hidden p-2 ${isLight ? 'text-slate-600 bg-slate-100' : 'text-zinc-400 hover:text-white bg-[#1a1b22]'} rounded-lg`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display tracking-tight flex items-center gap-2`}>
                  <span>{activePage === 'dashboard' ? 'Executive Store Overview' : activePage.toUpperCase()}</span>
                  {supabaseStatus.connected && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Live DB
                    </span>
                  )}
                </h1>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} hidden sm:block`}>
                  Klerksdorp Studio Operations & Logistics • 018 Bokone Bophirima
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search */}
              <div className="relative hidden sm:block w-48 lg:w-64">
                <Search className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-zinc-400'} absolute left-3 top-1/2 -translate-y-1/2`} />
                <input
                  type="text"
                  placeholder="Search SKUs, orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181920] border-[#272935] text-white'} border text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-[#ff5500]`}
                />
              </div>

              {/* Database Quick Access Button */}
              <button
                onClick={() => setActivePage('sql')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  supabaseStatus.connected
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : isLight
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title="Manage Live Supabase Connection & Tables"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{supabaseStatus.connected ? 'Supabase Connected' : 'Connect DB'}</span>
              </button>

              {/* Add Product Trigger Button */}
              <button
                onClick={() => {
                  setActivePage('products');
                  setIsAddProductOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#ff5500]/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Add Garment</span>
              </button>

              {/* Theme Toggle Button in Header */}
              <button
                onClick={onToggleTheme}
                className={`p-2 ${isLight ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200' : 'text-zinc-400 hover:text-white bg-[#181920] hover:bg-[#22242c] border-[#272935]'} rounded-xl border transition-colors`}
                title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`p-2 ${isLight ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200' : 'text-zinc-400 hover:text-white bg-[#181920] hover:bg-[#22242c] border-[#272935]'} rounded-xl border transition-colors`}
                title="Close Admin"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Dynamic Page Views */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* ============================================================ */}
            {/* 1. DASHBOARD PAGE */}
            {/* ============================================================ */}
            {activePage === 'dashboard' && (
              <div className="space-y-6">
                {/* 4 Core Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 sm:p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Total Store Revenue</span>
                      <div className="p-2 bg-[#ff5500]/10 text-[#ff5500] rounded-lg">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-2xl sm:3xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      R{totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-500">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4% from last 30 days</span>
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Processed Orders</span>
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-2xl sm:3xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {orders.length}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>{paidOrdersCount}</strong> completed transactions
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Active Catalog SKUs</span>
                      <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className={`text-2xl sm:3xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {products.length}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      <strong className={isLight ? 'text-slate-900' : 'text-white'}>{totalStockUnits}</strong> total units in warehouse
                    </div>
                  </div>

                  <div className={`p-4 sm:p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Awaiting Courier Guy</span>
                      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                        <Truck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:3xl font-black font-mono text-amber-500">
                      {pendingShipmentCount}
                    </div>
                    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      Ready for dispatch in Klerksdorp
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Curve Chart */}
                  <div className={`lg:col-span-2 p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider font-display`}>
                          Weekly Sales & Fulfillment Performance
                        </h3>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          Daily volume across PayFast Card, Instant EFT & Capitec Pay
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#ff5500]/10 text-[#ff5500] text-[10px] font-bold rounded-lg font-mono">
                        ZAR (R)
                      </span>
                    </div>

                    <div className="h-64 w-full min-h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff5500" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#ff5500" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#232530'} />
                          <XAxis dataKey="day" stroke={isLight ? '#64748b' : '#9ca3af'} fontSize={11} />
                          <YAxis stroke={isLight ? '#64748b' : '#9ca3af'} fontSize={11} tickFormatter={(val) => `R${val}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isLight ? '#ffffff' : '#181920',
                              borderColor: isLight ? '#e2e8f0' : '#2e303e',
                              borderRadius: '12px',
                              color: isLight ? '#0f172a' : '#ffffff',
                              fontSize: '12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#ff5500"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution Pie Chart */}
                  <div className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm`}>
                    <div>
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider font-display`}>
                        Inventory by Category
                      </h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Garment SKU breakdown</p>
                    </div>

                    <div className="h-44 w-full flex items-center justify-center min-h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isLight ? '#ffffff' : '#181920',
                              borderColor: isLight ? '#e2e8f0' : '#2e303e',
                              borderRadius: '10px',
                              color: isLight ? '#0f172a' : '#ffffff',
                              fontSize: '11px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto pr-1">
                      {categoryChartData.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono font-bold">{item.value} SKUs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Low Stock Alerts & Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Low Stock Alert */}
                  <div className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-3 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider font-display`}>
                          Low Stock Garments ({lowStockProducts.length})
                        </h3>
                      </div>
                      <button
                        onClick={() => setActivePage('products')}
                        className="text-xs text-[#ff5500] hover:underline font-semibold"
                      >
                        Restock Now →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lowStockProducts.length === 0 ? (
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'} italic py-3`}>All inventory levels healthy in warehouse.</p>
                      ) : (
                        lowStockProducts.map((p) => (
                          <div
                            key={p.id}
                            className={`p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181920] border-[#272935]'} border rounded-xl flex items-center justify-between gap-3`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} line-clamp-1`}>{p.title}</h4>
                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} font-mono`}>{p.category}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-mono font-bold text-xs rounded border border-amber-500/20">
                                {p.stockQuantity} left
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Orders Overview */}
                  <div className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-3 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider font-display`}>
                          Recent Online Orders
                        </h3>
                      </div>
                      <button
                        onClick={() => setActivePage('orders')}
                        className="text-xs text-[#ff5500] hover:underline font-semibold"
                      >
                        View All Orders →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {orders.slice(0, 3).map((o) => (
                        <div
                          key={o.id}
                          className={`p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181920] border-[#272935]'} border rounded-xl flex items-center justify-between gap-3`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#ff5500]">{o.orderNumber}</span>
                              <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{o.customer.fullName}</span>
                            </div>
                            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              {o.items.length} garment(s) • {o.customer.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'} block`}>
                              R{o.total.toLocaleString()}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-500">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. PRODUCTS & CATALOG PAGE */}
            {/* ============================================================ */}
            {activePage === 'products' && (
              <div className="space-y-6">
                {/* Catalog Controls */}
                <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm`}>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {['All', 'Luxury Knitwear', 'Caps', 'Hoodies & Sweats', 'Combos'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          selectedCategoryFilter === cat
                            ? 'bg-[#ff5500] text-black'
                            : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1b22] text-zinc-300 hover:bg-[#22242c]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#ff5500] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#ff5500]/20 hover:bg-[#e04a00] transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Garment</span>
                  </button>
                </div>

                {/* Product Table */}
                <div className={`${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl overflow-hidden shadow-sm`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#171820] border-[#262835] text-zinc-400'} border-b uppercase font-mono text-[10px]`}>
                        <tr>
                          <th className="p-4">Piece / SKU</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price (ZAR)</th>
                          <th className="p-4">Stock Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#1f212a]'}`}>
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-[#181922]'}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <h4 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.title}</h4>
                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'} font-mono`}>{p.sku || p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#20222a] text-zinc-300'} rounded-lg font-medium text-[11px]`}>
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="font-mono font-bold">
                                <span className={isLight ? 'text-slate-900' : 'text-white'}>R{p.price}</span>
                                {p.originalPrice && (
                                  <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'} line-through ml-1.5`}>
                                    R{p.originalPrice}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {p.stockQuantity <= 0 ? (
                                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 font-bold rounded text-[10px]">
                                    Sold Out (0)
                                  </span>
                                ) : p.stockQuantity <= 5 ? (
                                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 font-bold rounded text-[10px]">
                                    Low Stock ({p.stockQuantity})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold rounded text-[10px]">
                                    In Stock ({p.stockQuantity})
                                  </span>
                                )}

                                {onUpdateStock && (
                                  <div className="flex items-center gap-1 ml-2">
                                    <button
                                      onClick={() => onUpdateStock(p.id, Math.max(0, p.stockQuantity - 1))}
                                      title="Decrease stock by 1"
                                      className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#22242f] hover:bg-[#2c2f3d] text-zinc-300'
                                      }`}
                                    >
                                      -1
                                    </button>
                                    <button
                                      onClick={() => onUpdateStock(p.id, p.stockQuantity + 5)}
                                      title="Add 5 units to stock"
                                      className={`px-1.5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-[#ff5500]' : 'bg-[#22242f] hover:bg-[#2c2f3d] text-[#ff5500]'
                                      }`}
                                    >
                                      +5
                                    </button>
                                    <button
                                      onClick={() => onUpdateStock(p.id, 20)}
                                      title="Restock to 20 units"
                                      className="px-1.5 h-5 flex items-center justify-center rounded text-[10px] font-bold bg-[#ff5500]/10 text-[#ff5500] hover:bg-[#ff5500] hover:text-black transition-colors"
                                    >
                                      20
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {deletingProductId === p.id ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      await onDeleteProduct(p.id);
                                      setDeletingProductId(null);
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingProductId(null)}
                                    className={`px-2 py-1 ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#22242f] text-zinc-300'} rounded-lg text-[10px] font-bold`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingProductId(p.id)}
                                  className={`p-2 ${isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'} rounded-lg transition-colors`}
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 3. ORDERS & FULFILLMENT PAGE */}
            {/* ============================================================ */}
            {activePage === 'orders' && (
              <div className="space-y-6">
                {/* Order Filters */}
                <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', 'paid', 'processing', 'shipped', 'delivered'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                          selectedOrderStatusFilter === st
                            ? 'bg-[#ff5500] text-black'
                            : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#1a1b22] text-zinc-300 hover:bg-[#22242c]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'} font-mono`}>
                    Total: {filteredOrders.length} Order(s)
                  </span>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className={`p-12 text-center ${isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#14151b] border-[#232530] text-zinc-400'} border rounded-2xl space-y-2`}>
                      <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="font-bold text-sm">No orders matching this filter</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-inherit pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#ff5500] text-sm">
                              {order.orderNumber}
                            </span>
                            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs rounded uppercase">
                              {order.status}
                            </span>
                            <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              R{order.total.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Delivery Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'} block uppercase font-mono`}>Recipient</span>
                            <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{order.customer.fullName}</p>
                            <p className={isLight ? 'text-slate-600' : 'text-zinc-400'}>{order.customer.phone}</p>
                            <p className={isLight ? 'text-slate-600' : 'text-zinc-400'}>{order.customer.email}</p>
                          </div>

                          <div>
                            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'} block uppercase font-mono`}>Delivery Destination</span>
                            <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-300'}`}>{order.customer.streetAddress}</p>
                            <p className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                              {order.customer.suburb ? `${order.customer.suburb}, ` : ''}{order.customer.city}, {order.customer.postalCode}
                            </p>
                            <span className="text-[10px] text-[#ff5500] font-mono mt-0.5 block">
                              {order.deliveryMethod === 'courier_guy' ? 'The Courier Guy Door Delivery' : 'PAXI PEP Store Collection'}
                            </span>
                          </div>

                          <div className="flex flex-col justify-between">
                            <div>
                              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'} block uppercase font-mono`}>Tracking Number</span>
                              <p className="font-mono text-xs font-bold text-blue-500">
                                {order.trackingNumber || 'Pending Courier Waybill'}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setViewingOrder(order);
                                setTrackingInput(order.trackingNumber || '');
                              }}
                              className={`mt-2 py-1.5 px-3 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1f212a] hover:bg-[#282a35] text-zinc-200'} rounded-lg text-xs font-semibold text-center transition-colors`}
                            >
                              Manage Order & Waybill →
                            </button>
                          </div>
                        </div>

                        {/* Order Items Pill list */}
                        <div className={`pt-2 flex flex-wrap gap-2 border-t ${isLight ? 'border-slate-100' : 'border-[#1b1c24]'}`}>
                          {order.items.map((it, idx) => (
                            <div key={idx} className={`px-2.5 py-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#181920] border-[#252733] text-zinc-300'} border rounded-lg text-[11px] flex items-center gap-2`}>
                              <span className="font-bold text-[#ff5500]">{it.quantity}x</span>
                              <span>{it.product.title}</span>
                              <span className="text-[10px] opacity-70">({it.selectedSize})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. 018 STREETWEAR LOOKS (COMMUNITY) */}
            {/* ============================================================ */}
            {activePage === 'community' && (
              <div className="space-y-6">
                <div className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl flex items-center justify-between shadow-sm`}>
                  <div>
                    <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} font-display uppercase`}>
                      "Wear What We Dial (018)" Community Showcase
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      User submitted photos & curated Instagram streetwear outfits from fans in Klerksdorp, JHB, and North West.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#ff5500]/10 text-[#ff5500] font-mono font-bold text-xs rounded-xl">
                    {communityPhotos.length} Total Looks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {communityPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`group ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl overflow-hidden shadow-sm flex flex-col`}
                    >
                      <div className="aspect-square relative overflow-hidden bg-zinc-900">
                        <img
                          src={photo.imageUrl}
                          alt={photo.userName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-mono">
                          ❤️ {photo.likes} Likes
                        </div>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{photo.userName}</h4>
                            <span className="text-[10px] text-[#ff5500] font-mono">{photo.handle}</span>
                          </div>
                          <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'} italic mt-1`}>
                            "{photo.caption}"
                          </p>
                        </div>

                        <div className={`pt-2 border-t ${isLight ? 'border-slate-100' : 'border-[#21232d]'} flex items-center justify-between text-[10px]`}>
                          <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>{photo.location}</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold rounded">
                            Verified Fan
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 5. SUPABASE & SQL DATABASE HUB */}
            {/* ============================================================ */}
            {activePage === 'database' && (
              <div className="space-y-6">
                {/* Status Hero Card */}
                <div className={`p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        supabaseStatus.connected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display tracking-tight`}>
                            Supabase PostgreSQL Database
                          </h2>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            supabaseStatus.connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {supabaseStatus.connected ? '● LIVE SYNC' : '○ FALLBACK'}
                          </span>
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'} mt-0.5`}>
                          {supabaseStatus.message || (supabaseStatus.connected
                            ? 'Connected to live cloud Supabase database'
                            : 'Active fallback mode. Enter credentials or run schema.sql in Supabase to sync live.')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchDbStatus}
                        disabled={checkingDb}
                        className={`flex items-center gap-2 px-3.5 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#1e2029] hover:bg-[#282a35] text-zinc-200'} rounded-xl text-xs font-semibold transition-colors`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-[#ff5500]' : ''}`} />
                        <span>Test Ping</span>
                      </button>

                      <button
                        onClick={handleSeedDatabase}
                        disabled={seedingDb}
                        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${seedingDb ? 'animate-spin' : ''}`} />
                        <span>{seedingDb ? 'Seeding...' : 'Seed Database'}</span>
                      </button>

                      <button
                        onClick={handleDownloadSql}
                        className="flex items-center gap-2 px-3.5 py-2 bg-[#ff5500] hover:bg-[#e04a00] text-black rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ff5500]/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download schema.sql</span>
                      </button>
                    </div>
                  </div>

                  {seedFeedback && (
                    <div className="p-3 bg-[#ff5500]/10 border border-[#ff5500]/30 rounded-xl text-xs text-[#ff5500] font-mono">
                      {seedFeedback}
                    </div>
                  )}
                </div>

                {/* Direct Connect & Runtime Configuration Form */}
                <div className={`p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm text-xs`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display`}>
                        Live Supabase API Credentials
                      </h3>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Configure or update your Supabase project connection dynamically.
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-[#ff5500]/10 text-[#ff5500] rounded font-mono text-[10px]">
                      Instant Cloud Sync
                    </span>
                  </div>

                  <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                          Supabase Project URL
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://your-project.supabase.co"
                          value={customDbUrl}
                          onChange={(e) => setCustomDbUrl(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181922] border-[#2c2f3d] text-white'
                          } font-mono text-xs focus:border-[#ff5500] outline-none`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                          Supabase API Key (Anon or Service Role Key)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={customDbKey}
                          onChange={(e) => setCustomDbKey(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#181922] border-[#2c2f3d] text-white'
                          } font-mono text-xs focus:border-[#ff5500] outline-none`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        Tip: You can find these in Supabase Dashboard → Settings → API.
                      </p>
                      <button
                        type="submit"
                        disabled={savingConfig}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-[#ff5500]/20"
                      >
                        {savingConfig ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{savingConfig ? 'Connecting & Syncing...' : 'Save & Connect Database'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 3 Step Setup Guide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black text-xs font-black flex items-center justify-center">1</span>
                      <ExternalLink className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                    </div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Open SQL Editor in Supabase</h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} leading-relaxed`}>
                      Go to your Supabase Project Dashboard and open the <strong>SQL Editor</strong> in the left sidebar.
                    </p>
                  </div>

                  <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black text-xs font-black flex items-center justify-center">2</span>
                      <Copy className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                    </div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Paste Full schema.sql</h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} leading-relaxed`}>
                      Click the <strong>Copy SQL</strong> button below to copy the drop-in PostgreSQL migration script.
                    </p>
                  </div>

                  <div className={`p-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-2 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black text-xs font-black flex items-center justify-center">3</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Click Run</h4>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} leading-relaxed`}>
                      Click <strong>RUN</strong>. Supabase creates the tables with RLS and seeds the luxury knitwear collection.
                    </p>
                  </div>
                </div>

                {/* Schema Code Block Preview with 1-Click Copy */}
                <div className={`${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl overflow-hidden shadow-sm`}>
                  <div className={`p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#171820] border-[#262835]'} border-b flex items-center justify-between`}>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <span className="text-[#ff5500]">018_Bokone_Schema.sql</span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>(Clean Drop & Recreate)</span>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/supabase/sql');
                          const sql = res.ok ? await res.text() : '';
                          if (sql) {
                            navigator.clipboard.writeText(sql);
                          }
                        } catch (e) {
                          // Fallback
                        }
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2500);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5500] text-black font-bold text-xs rounded-lg transition-colors hover:bg-[#e04a00]"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied Full schema.sql!' : 'Copy SQL'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-[#090a0d] text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
{`-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Drop for Idempotent Execution
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.community_photos CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 3. PRODUCTS TABLE
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    colors TEXT[] DEFAULT ARRAY['Jet Black', '018 Orange'],
    description TEXT,
    features TEXT[] DEFAULT ARRAY['Engineered in Klerksdorp, North West'],
    image TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 15,
    sku TEXT UNIQUE,
    tag TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (Includes order_number, delivery & customer details)
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    delivery_method TEXT NOT NULL DEFAULT 'courier_guy',
    status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT NOT NULL DEFAULT 'payfast',
    tracking_number TEXT,
    courier_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS POLICIES & SEED DATA INCLUDED IN FILE`}
                  </pre>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 6. SETTINGS & THEME PAGE */}
            {/* ============================================================ */}
            {activePage === 'settings' && (
              <div className="space-y-6">
                <div className={`p-5 ${isLight ? 'bg-white border-slate-200' : 'bg-[#14151b] border-[#232530]'} border rounded-2xl space-y-4 shadow-sm`}>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-wider font-display`}>
                    Store Brand & Interface Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className={`p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181920] border-[#272935]'} border rounded-xl space-y-2`}>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} font-mono uppercase`}>Appearance Theme</span>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'} capitalize`}>{currentTheme} Mode</span>
                        <button
                          onClick={onToggleTheme}
                          className="px-3 py-1.5 bg-[#ff5500] text-black font-bold rounded-lg text-xs"
                        >
                          Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                      </div>
                    </div>

                    <div className={`p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#181920] border-[#272935]'} border rounded-xl space-y-2`}>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-400'} font-mono uppercase`}>Studio Hotline</span>
                      <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>+27 64 062 9602 (WhatsApp Direct)</p>
                      <p className={isLight ? 'text-slate-500' : 'text-zinc-500'}>Wilkoppies / Flamwood, Klerksdorp, North West</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: ADD NEW GARMENT */}
      {/* ============================================================ */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-lg ${isLight ? 'bg-white border-slate-200' : 'bg-[#15161c] border-[#292b38]'} border rounded-3xl p-6 space-y-4 shadow-2xl animate-scaleUp text-left max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#ff5500]" />
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display`}>
                  Add 018 Garment to Inventory
                </h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className={`p-1.5 ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Garment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 018 Bokone Heavyweight Polo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]`}
                  >
                    <option value="Luxury Knitwear">Luxury Knitwear</option>
                    <option value="Caps">Caps</option>
                    <option value="Hats">Hats</option>
                    <option value="Bags">Bags</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Hoodies & Sweats">Hoodies & Sweats</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Price (ZAR R) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500] font-mono`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Was Price (R)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional original price"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500] font-mono`}
                  />
                </div>
              </div>

              {/* Garment Image with Camera & File Upload */}
              <div className="space-y-2">
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Garment Image Photo</label>
                
                {cameraActive ? (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={captureAdminPhoto}
                      className="w-full py-2 bg-[#ff5500] text-black font-bold rounded-xl text-xs"
                    >
                      📸 Snap Snapshot
                    </button>
                  </div>
                ) : newImage ? (
                  <div className="relative h-40 bg-zinc-900 rounded-xl overflow-hidden">
                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className={`flex-1 py-3 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-[#1a1b22] hover:bg-[#22242c] text-zinc-300 border-[#2a2c38]'} border rounded-xl flex items-center justify-center gap-2 font-semibold`}
                    >
                      <Camera className="w-4 h-4 text-[#ff5500]" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 py-3 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-[#1a1b22] hover:bg-[#22242c] text-zinc-300 border-[#2a2c38]'} border rounded-xl flex items-center justify-center gap-2 font-semibold`}
                    >
                      <Upload className="w-4 h-4 text-blue-500" />
                      <span>Upload File</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAdminFile}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Engineered in Klerksdorp, North West..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className={`w-full ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'} rounded-xl font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-[#ff5500]/20"
                >
                  {savingProduct ? 'Saving...' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: MANAGE ORDER / COURIER WAYBILL */}
      {/* ============================================================ */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-lg ${isLight ? 'bg-white border-slate-200' : 'bg-[#15161c] border-[#292b38]'} border rounded-3xl p-6 space-y-4 shadow-2xl animate-scaleUp text-left max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between border-b border-inherit pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-[#ff5500]">{viewingOrder.orderNumber}</span>
                <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase font-display`}>
                  Fulfillment & Tracking
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className={`p-1.5 ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Courier Tracking / Waybill Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. TCG-018-8472910"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className={`flex-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#1a1b22] border-[#292b38] text-white'} border p-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#ff5500]`}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await onUpdateOrderStatus(viewingOrder.id, 'shipped', trackingInput);
                      setViewingOrder(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
                  >
                    Save & Mark Shipped
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className={`block font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Update Order Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={async () => {
                        await onUpdateOrderStatus(viewingOrder.id, st, trackingInput);
                        setViewingOrder(null);
                      }}
                      className={`py-2 px-3 rounded-xl font-semibold capitalize text-xs border transition-colors ${
                        viewingOrder.status === st
                          ? 'bg-[#ff5500] text-black border-[#ff5500]'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-[#1a1b22] border-[#292b38] text-zinc-300 hover:bg-[#22242c]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
