import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
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
  Camera,
  Upload,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Sun,
  Moon,
  Trash2,
  Edit,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  SlidersHorizontal,
  Server
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
  currentTheme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

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

  // Supabase connection state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    isConfigured: false,
    connected: false,
    url: '',
    message: 'Checking connection...'
  });
  const [checkingDb, setCheckingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchDbStatus = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
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
      alert('Camera access failed. Please select from files instead.');
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
        image: newImage || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Jet Black', '018 Orange'],
        features: ['Handcrafted in North West', 'Precision Double-Rib Weave']
      });

      setNewTitle('');
      setNewImage('');
      setNewDescription('');
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
      const sqlContent = res.ok ? await res.text() : `-- Run /supabase/schema.sql`;
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
    return products.filter(p => {
      const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
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
      <div className="relative w-full h-full max-w-[100vw] bg-[#0d0e12] flex flex-col md:flex-row overflow-hidden">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR NAVIGATION */}
        {/* ============================================================ */}
        <aside
          className={`fixed md:relative z-30 inset-y-0 left-0 w-64 bg-[#121318] border-r border-[#22242e] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand Header */}
          <div>
            <div className="p-5 border-b border-[#21232d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff5500] text-black font-black flex items-center justify-center text-sm shadow-md shadow-[#ff5500]/20">
                  018
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase font-display tracking-tight leading-tight">
                    018 BOKONE
                  </h2>
                  <span className="text-[10px] text-[#ff5500] font-mono font-bold tracking-wider uppercase">
                    Admin Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1.5 text-zinc-400 hover:text-white"
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Products & Catalog</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activePage === 'products' ? 'bg-black/30 text-black' : 'bg-[#1e2029] text-zinc-300'
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders & Fulfillment</span>
                </div>
                {pendingShipmentCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activePage === 'orders' ? 'bg-black/30 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4" />
                  <span>018 Streetwear Looks</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activePage === 'community' ? 'bg-black/30 text-black' : 'bg-[#1e2029] text-zinc-300'
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
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
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1b22]'
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
          <div className="p-3 border-t border-[#21232d] space-y-2 text-xs">
            <div className="p-3 bg-[#171820] rounded-xl border border-[#262835] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 block font-mono">Database Status</span>
                <span className={`text-xs font-bold ${supabaseStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {supabaseStatus.connected ? 'Supabase Live' : 'Memory Fallback'}
                </span>
              </div>
              <button
                onClick={fetchDbStatus}
                disabled={checkingDb}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Refresh DB status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-[#ff5500]' : ''}`} />
              </button>
            </div>

            {/* Light / Dark Mode Toggle in Sidebar */}
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between p-2.5 bg-[#171820] hover:bg-[#20222c] rounded-xl border border-[#262835] text-zinc-300 font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>{currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-zinc-400 uppercase font-mono">
                {currentTheme}
              </span>
            </button>

            {/* Close / Return to Storefront */}
            <button
              onClick={onClose}
              className="w-full py-2 bg-[#20222a] hover:bg-[#2a2c38] text-zinc-300 hover:text-white font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Back to Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#ff5500]" />
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN CONTENT AREA */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0d10]">
          
          {/* Top Header Bar */}
          <header className="h-16 px-4 sm:px-6 bg-[#121318] border-b border-[#21232d] flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 text-zinc-400 hover:text-white bg-[#1a1b22] rounded-lg"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
                  <span>{activePage === 'dashboard' ? 'Executive Store Overview' : activePage.toUpperCase()}</span>
                  {supabaseStatus.connected && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Live
                    </span>
                  )}
                </h1>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Klerksdorp Studio Operations & Logistics • 018 Bokone Bophirima
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search */}
              <div className="relative hidden sm:block w-48 lg:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search SKUs, orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                />
              </div>

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
                className="p-2 text-zinc-400 hover:text-white bg-[#181920] hover:bg-[#22242c] rounded-xl border border-[#272935] transition-colors"
                title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white bg-[#181920] hover:bg-[#22242c] rounded-xl border border-[#272935] transition-colors"
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
                  <div className="p-4 sm:p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Store Revenue</span>
                      <div className="p-2 bg-[#ff5500]/10 text-[#ff5500] rounded-lg">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                      R{totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4% from last 30 days</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Processed Orders</span>
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                      {orders.length}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      <strong className="text-white">{paidOrdersCount}</strong> completed transactions
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog SKUs</span>
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                      {products.length}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      <strong className="text-white">{totalStockUnits}</strong> total units in warehouse
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Courier Guy</span>
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Truck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                      {pendingShipmentCount}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Ready for dispatch in Klerksdorp
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Curve Chart */}
                  <div className="lg:col-span-2 p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                          Weekly Sales & Fulfillment Performance
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          Daily volume across PayFast Card, Instant EFT & Capitec Pay
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#ff5500]/10 text-[#ff5500] text-[10px] font-bold rounded-lg font-mono">
                        ZAR (R)
                      </span>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff5500" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#ff5500" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#232530" />
                          <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `R${val}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#181920',
                              borderColor: '#2e303e',
                              borderRadius: '12px',
                              color: '#ffffff',
                              fontSize: '12px'
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
                  <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                        Inventory by Category
                      </h3>
                      <p className="text-[11px] text-zinc-400">Garment SKU breakdown</p>
                    </div>

                    <div className="h-44 w-full flex items-center justify-center">
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
                              backgroundColor: '#181920',
                              borderColor: '#2e303e',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '11px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto pr-1">
                      {categoryChartData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-300">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-zinc-400">{item.value} SKUs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Orders & Stock Alerts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Orders Table */}
                  <div className="lg:col-span-2 p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                          Recent Customer Orders
                        </h3>
                        <p className="text-[11px] text-zinc-400">Direct PayFast checkout transactions</p>
                      </div>
                      <button
                        onClick={() => setActivePage('orders')}
                        className="text-xs text-[#ff5500] hover:underline font-bold flex items-center gap-1"
                      >
                        <span>View All ({orders.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center bg-[#181920] rounded-xl text-zinc-400 text-xs">
                        No orders recorded yet. As customers buy on the storefront, they appear here live.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-[10px] text-zinc-400 uppercase tracking-wider border-b border-[#232530]">
                              <th className="pb-2.5 font-semibold">Order</th>
                              <th className="pb-2.5 font-semibold">Customer</th>
                              <th className="pb-2.5 font-semibold">Total</th>
                              <th className="pb-2.5 font-semibold">Status</th>
                              <th className="pb-2.5 font-semibold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1e2029]">
                            {orders.slice(0, 5).map((order) => (
                              <tr key={order.id} className="hover:bg-[#181920]/60 transition-colors">
                                <td className="py-3 font-mono font-bold text-white">
                                  {order.orderNumber}
                                </td>
                                <td className="py-3">
                                  <div className="font-semibold text-zinc-200">{order.customer.fullName}</div>
                                  <div className="text-[10px] text-zinc-400">{order.customer.city}</div>
                                </td>
                                <td className="py-3 font-mono font-bold text-[#ff5500]">
                                  R{order.total.toLocaleString()}
                                </td>
                                <td className="py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      order.status === 'delivered'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : order.status === 'shipped'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : order.status === 'cancelled'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => {
                                      setViewingOrder(order);
                                      setTrackingInput(order.trackingNumber || '');
                                    }}
                                    className="px-2.5 py-1 bg-[#20222a] hover:bg-[#2c2e3a] text-zinc-200 text-[11px] font-medium rounded-lg transition-colors"
                                  >
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Stock Alerts Panel */}
                  <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Low Stock SKUs</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400">SKUs with 6 or fewer units</p>
                      </div>
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <div className="p-6 text-center bg-[#181920] rounded-xl text-emerald-400 text-xs font-medium flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>All products have healthy inventory levels!</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {lowStockProducts.map((p) => (
                          <div key={p.id} className="p-3 bg-[#181920] rounded-xl border border-[#272935] flex items-center justify-between gap-3">
                            <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                              <span className="text-[10px] text-zinc-400 font-mono">{p.sku}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs font-mono font-black text-amber-400 block">
                                {p.stockQuantity} left
                              </span>
                              <span className="text-[10px] text-zinc-400">R{p.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 2. PRODUCTS & CATALOG PAGE */}
            {/* ============================================================ */}
            {activePage === 'products' && (
              <div className="space-y-6">
                {/* Top Filter & Action Bar */}
                <div className="p-4 bg-[#14151b] border border-[#232530] rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Category:</span>
                    {['All', 'Caps', 'Luxury Knitwear', 'Hoodies & Sweats', 'Combos'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategoryFilter === cat
                            ? 'bg-[#ff5500] text-black font-bold'
                            : 'bg-[#181920] text-zinc-400 hover:text-white border border-[#272935]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#ff5500]/20 transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Add New Garment</span>
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-[#14151b] border border-[#232530] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] text-zinc-400 uppercase tracking-wider bg-[#181920] border-b border-[#232530]">
                          <th className="p-4 font-semibold">Garment / SKU</th>
                          <th className="p-4 font-semibold">Category</th>
                          <th className="p-4 font-semibold">Price</th>
                          <th className="p-4 font-semibold">Stock Quantity</th>
                          <th className="p-4 font-semibold">Tag</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2029]">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#181920]/70 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.title} className="w-12 h-12 rounded-xl object-cover border border-[#272935] flex-shrink-0" />
                                <div>
                                  <h4 className="font-bold text-white text-xs sm:text-sm">{p.title}</h4>
                                  <span className="text-[10px] text-zinc-400 font-mono">{p.sku}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg bg-[#1a1b22] text-zinc-300 text-[11px] font-medium border border-[#272935]">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-[#ff5500] text-sm">
                              R{p.price.toLocaleString()}
                              {p.originalPrice && (
                                <span className="text-zinc-500 line-through text-[10px] ml-1.5">
                                  R{p.originalPrice}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                                  p.stockQuantity <= 5
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {p.stockQuantity} in stock
                              </span>
                            </td>
                            <td className="p-4">
                              {p.tag ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#ff5500]/20 text-[#ff5500] border border-[#ff5500]/30 font-mono">
                                  {p.tag}
                                </span>
                              ) : (
                                <span className="text-zinc-500 text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`Delete product "${p.title}"?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete SKU"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                {/* Status Filter Strip */}
                <div className="p-4 bg-[#14151b] border border-[#232530] rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Status:</span>
                    {['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                          selectedOrderStatusFilter === status
                            ? 'bg-[#ff5500] text-black font-bold'
                            : 'bg-[#181920] text-zinc-400 hover:text-white border border-[#272935]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-zinc-400 font-mono">
                    Showing <strong className="text-white">{filteredOrders.length}</strong> of {orders.length} orders
                  </span>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center bg-[#14151b] rounded-2xl border border-[#232530] text-zinc-400 text-xs">
                      No orders match the current status filter.
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 sm:p-5 bg-[#14151b] border border-[#232530] rounded-2xl hover:border-[#ff5500]/40 transition-colors space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21232d] pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black font-mono text-white">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <strong className="text-base font-black font-mono text-[#ff5500]">
                              R{order.total.toLocaleString()}
                            </strong>
                            <button
                              onClick={() => {
                                setViewingOrder(order);
                                setTrackingInput(order.trackingNumber || '');
                              }}
                              className="px-3 py-1.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-bold text-xs rounded-xl transition-colors"
                            >
                              Fulfill & Track
                            </button>
                          </div>
                        </div>

                        {/* Order Sub-Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono">Customer</span>
                            <strong className="text-zinc-200">{order.customer.fullName}</strong>
                            <div className="text-zinc-400 text-[11px]">{order.customer.email} • {order.customer.phone}</div>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono">Delivery Address</span>
                            <div className="text-zinc-300 text-[11px] leading-snug">
                              {order.customer.address}, {order.customer.city}, {order.customer.postalCode}
                            </div>
                            <div className="text-[#ff5500] text-[10px] font-semibold mt-0.5 uppercase">
                              {order.deliveryMethod === 'courier_guy' ? 'The Courier Guy (Door)' : 'PAXI Pep Collection'}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono">Items Ordered ({order.items.length})</span>
                            <div className="text-zinc-300 text-[11px] space-y-0.5">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="truncate">
                                  {it.quantity}x {it.product.title} <span className="text-zinc-500">({it.selectedSize})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 4. 018 STREETWEAR LOOKS PAGE */}
            {/* ============================================================ */}
            {activePage === 'community' && (
              <div className="space-y-6">
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                      Community Streetwear Gallery ("Wear What We Dial")
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Customer snapshots uploaded via camera or gallery on the storefront
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-mono text-xs font-bold rounded-lg border border-purple-500/30">
                    {communityPhotos.length} Total Looks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {communityPhotos.map((photo) => (
                    <div key={photo.id} className="bg-[#14151b] border border-[#232530] rounded-2xl overflow-hidden group">
                      <div className="aspect-square relative overflow-hidden bg-black">
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-mono text-white font-bold">
                          ❤️ {photo.likes} Likes
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{photo.userName}</strong>
                          <span className="text-[10px] text-[#ff5500] font-mono">{photo.handle}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          "{photo.caption}"
                        </p>
                        <div className="pt-2 border-t border-[#21232d] flex items-center justify-between text-[10px] text-zinc-500">
                          <span>{photo.location}</span>
                          <span className="text-[#ff5500] font-semibold">{photo.productTagged}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 5. SUPABASE & SQL DATABASE HUB PAGE */}
            {/* ============================================================ */}
            {activePage === 'database' && (
              <div className="space-y-6 text-xs text-zinc-300">
                {/* Live Status Banner */}
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${supabaseStatus.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>Supabase Live PostgreSQL Engine</span>
                          {supabaseStatus.connected ? (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 font-mono">
                              CONNECTED & LIVE
                            </span>
                          ) : (
                            <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30 font-mono">
                              IN-MEMORY FALLBACK
                            </span>
                          )}
                        </h3>
                        <p className="text-zinc-400 text-xs mt-0.5">
                          {supabaseStatus.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchDbStatus}
                        disabled={checkingDb}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#20222a] hover:bg-[#2c2e3a] text-zinc-200 text-xs font-semibold rounded-xl border border-[#2c2e3c] transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-[#ff5500]' : ''}`} />
                        <span>Test Connection</span>
                      </button>

                      <button
                        onClick={handleDownloadSql}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ff5500] hover:bg-[#e04a00] text-black text-xs font-bold rounded-xl transition-colors shadow-md shadow-[#ff5500]/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download schema.sql</span>
                      </button>
                    </div>
                  </div>

                  {supabaseStatus.url && (
                    <div className="p-3 bg-[#0d0e12] rounded-xl border border-[#1e2029] font-mono text-xs text-zinc-300 flex items-center justify-between">
                      <span>Supabase Project URL: <strong className="text-white">{supabaseStatus.url}</strong></span>
                      <a
                        href={supabaseStatus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#ff5500] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Open Supabase Console</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* 3 Step Setup Guide */}
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#ff5500]" />
                    <span>How to Link Your Supabase Project (3 Easy Steps)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-[#181920] border border-[#272935] rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black font-extrabold text-xs flex items-center justify-center font-mono">
                        1
                      </span>
                      <strong className="text-white block text-xs">Create Supabase Project</strong>
                      <p className="text-zinc-400 text-[11px]">
                        Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#ff5500] hover:underline">supabase.com</a>, create a free project and select your preferred region.
                      </p>
                    </div>

                    <div className="p-4 bg-[#181920] border border-[#272935] rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black font-extrabold text-xs flex items-center justify-center font-mono">
                        2
                      </span>
                      <strong className="text-white block text-xs">Execute SQL Schema</strong>
                      <p className="text-zinc-400 text-[11px]">
                        Go to Supabase <strong>SQL Editor</strong>, paste the script below or from <code className="text-[#ff5500] font-mono">/supabase/schema.sql</code>, and click <strong>RUN</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-[#181920] border border-[#272935] rounded-xl space-y-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff5500] text-black font-extrabold text-xs flex items-center justify-center font-mono">
                        3
                      </span>
                      <strong className="text-white block text-xs">Set Environment Keys</strong>
                      <p className="text-zinc-400 text-[11px]">
                        Provide <code className="text-[#ff5500] font-mono">SUPABASE_URL</code> and <code className="text-[#ff5500] font-mono">SUPABASE_ANON_KEY</code> in your environment or Vercel settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SQL Code Preview Block */}
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">Full PostgreSQL Database Schema</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">/supabase/schema.sql</span>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20222a] hover:bg-[#2c2e3a] text-zinc-200 text-xs font-semibold rounded-lg border border-[#2c2e3c] transition-colors"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied Full schema.sql!' : 'Copy SQL'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-[#0a0b0e] border border-[#1e2029] rounded-xl text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-72 leading-relaxed">
{`-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
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

-- 2. ORDERS TABLE (PayFast Integrated)
CREATE TABLE IF NOT EXISTS public.orders (
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITY STREETWEAR PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.community_photos (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    location TEXT DEFAULT 'Klerksdorp, North West',
    caption TEXT,
    image_url TEXT NOT NULL,
    product_tagged TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public Community" ON public.community_photos FOR ALL USING (true);`}
                  </pre>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 6. SETTINGS & THEME PAGE */}
            {/* ============================================================ */}
            {activePage === 'settings' && (
              <div className="space-y-6 text-xs">
                {/* Store Appearance Card */}
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Appearance & Theme Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={onToggleTheme}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        currentTheme === 'dark'
                          ? 'bg-[#181920] border-[#ff5500] ring-1 ring-[#ff5500]'
                          : 'bg-[#181920] border-[#272935] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-white text-xs flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>Obsidian Dark Mode</span>
                        </strong>
                        {currentTheme === 'dark' && <Check className="w-4 h-4 text-[#ff5500]" />}
                      </div>
                      <p className="text-zinc-400 text-[11px]">
                        Signature high-contrast dark palette with 018 Orange vibrant highlights.
                      </p>
                    </div>

                    <div
                      onClick={onToggleTheme}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        currentTheme === 'light'
                          ? 'bg-[#ffffff] text-black border-[#ff5500] ring-1 ring-[#ff5500]'
                          : 'bg-[#181920] border-[#272935] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <strong className={`text-xs flex items-center gap-2 ${currentTheme === 'light' ? 'text-black' : 'text-white'}`}>
                          <Sun className="w-4 h-4 text-amber-400" />
                          <span>Clean Light Mode</span>
                        </strong>
                        {currentTheme === 'light' && <Check className="w-4 h-4 text-[#ff5500]" />}
                      </div>
                      <p className={currentTheme === 'light' ? 'text-zinc-600 text-[11px]' : 'text-zinc-400 text-[11px]'}>
                        Crisp white canvases, dark typography, and constant 018 Orange buttons.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Studio & Logistics Configuration */}
                <div className="p-5 bg-[#14151b] border border-[#232530] rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Klerksdorp Studio & Contact Info
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Studio Location</label>
                      <input
                        type="text"
                        readOnly
                        value="Flamwood / Wilkoppies, Klerksdorp, North West, 2571"
                        className="w-full bg-[#181920] border border-[#272935] text-zinc-300 p-2.5 rounded-xl font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">WhatsApp Customer Line</label>
                      <input
                        type="text"
                        readOnly
                        value="+27 64 062 9602"
                        className="w-full bg-[#181920] border border-[#272935] text-zinc-300 p-2.5 rounded-xl font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Free Shipping Threshold</label>
                      <input
                        type="text"
                        readOnly
                        value="R999.00 (South Africa Nationwide)"
                        className="w-full bg-[#181920] border border-[#272935] text-zinc-300 p-2.5 rounded-xl font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Payment Gateway</label>
                      <input
                        type="text"
                        readOnly
                        value="PayFast South Africa (Instant EFT, Cards, Capitec Pay)"
                        className="w-full bg-[#181920] border border-[#272935] text-zinc-300 p-2.5 rounded-xl font-mono text-xs"
                      />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#14151a] border border-[#272935] rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-[#21232d] pb-3">
              <h3 className="font-black text-white uppercase text-base font-display flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ff5500]" />
                <span>Add Garment to 018 Catalog</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  if (videoRef.current && videoRef.current.srcObject) {
                    const s = videoRef.current.srcObject as MediaStream;
                    s.getTracks().forEach((t) => t.stop());
                  }
                  setCameraActive(false);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Image capture or gallery */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-zinc-300 block">
                  Garment Photo (Camera Snap or Upload)
                </label>

                {cameraActive ? (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={captureAdminPhoto}
                      className="w-full py-2 bg-[#ff5500] text-black font-black uppercase tracking-wider rounded-lg"
                    >
                      Capture Photo
                    </button>
                  </div>
                ) : newImage ? (
                  <div className="relative w-full h-44 bg-black rounded-xl overflow-hidden group">
                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="py-3 px-3 bg-[#1e2029] hover:bg-[#282a36] text-zinc-200 text-xs font-bold rounded-xl border border-[#2d2f3c] flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-[#ff5500]" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-3 bg-[#1e2029] hover:bg-[#282a36] text-zinc-200 text-xs font-bold rounded-xl border border-[#2d2f3c] flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span>Upload Gallery</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAdminFile}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 018 Jacquard Winter Beanie"
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="Caps">Caps</option>
                    <option value="Luxury Knitwear">Luxury Knitwear</option>
                    <option value="Hoodies & Sweats">Hoodies & Sweats</option>
                    <option value="Combos">Combos</option>
                    <option value="Polos & Knits">Polos & Knits</option>
                    <option value="Dresses">Dresses</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Tag / Badge</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as any)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="NEW DROP">NEW DROP</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="SAVE R700">SAVE R700</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Price (ZAR)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-zinc-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Bespoke jacquard knit engineered in North West..."
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs p-3 rounded-xl focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{savingProduct ? 'Saving to Database...' : 'Save & Publish Garment'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ORDER FULFILLMENT & TRACKING */}
      {/* ============================================================ */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#14151a] border border-[#272935] rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-[#21232d] pb-3">
              <div>
                <h3 className="font-black text-white uppercase text-base font-display">
                  Order #{viewingOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {new Date(viewingOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status updates */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-semibold uppercase">Update Order Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateOrderStatus(viewingOrder.id, st, trackingInput)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all ${
                        viewingOrder.status === st
                          ? 'bg-[#ff5500] text-black'
                          : 'bg-[#1e2029] text-zinc-300 hover:bg-[#282a38]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1 font-semibold uppercase">Courier Tracking Number</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g. TCG-018-984729"
                    className="flex-1 bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2 rounded-xl font-mono"
                  />
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(viewingOrder.id, viewingOrder.status, trackingInput);
                      alert('Tracking number updated!');
                    }}
                    className="px-3 py-2 bg-[#ff5500] text-black font-bold text-xs rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-[#21232d] space-y-2">
                <span className="text-[11px] text-zinc-400 uppercase font-bold block">Ordered Garments</span>
                {viewingOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-[#181920] rounded-xl">
                    <div>
                      <div className="font-bold text-white text-xs">{item.product.title}</div>
                      <div className="text-[10px] text-zinc-400">
                        Size: {item.selectedSize} • Color: {item.selectedColor} • Qty: {item.quantity}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#ff5500]">
                      R{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
