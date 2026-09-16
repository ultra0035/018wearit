import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Camera,
  Upload,
  Check,
  Truck,
  Edit2,
  Trash2,
  Loader2,
  Database,
  Sun,
  Moon,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductCategory, ThemeMode, SupabaseStatus } from '../types';

interface AdminInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, tracking?: string) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

export const AdminInventoryModal: React.FC<AdminInventoryModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onAddProduct,
  onUpdateOrderStatus,
  onDeleteProduct,
  currentTheme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'add_product' | 'database'>('orders');

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Luxury Knitwear');
  const [newPrice, setNewPrice] = useState('850');
  const [newDescription, setNewDescription] = useState('');
  const [newStock, setNewStock] = useState('15');
  const [newTag, setNewTag] = useState<'NEW DROP' | 'BESTSELLER' | 'LIMITED'>('NEW DROP');
  const [newImage, setNewImage] = useState<string>('');
  const [savingProduct, setSavingProduct] = useState(false);

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

  // Camera & File refs for admin photo capture
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

      // Stop tracks
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
        description: newDescription.trim() || 'Engineered in Klerksdorp, North West.',
        stockQuantity: Number(newStock),
        tag: newTag,
        image: newImage || 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Jet Black', '018 Orange'],
        features: ['Handcrafted in North West', 'Precision Double-Rib Weave']
      });

      // Reset form
      setNewTitle('');
      setNewImage('');
      setNewDescription('');
      setActiveTab('inventory');
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#121317] border border-[#272935] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21232c] flex items-center justify-between bg-[#15161b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff5500] text-black font-black flex items-center justify-center text-sm">
              018
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white uppercase font-display">
                  018 Bokone Store Management & Inventory
                </h3>
                {supabaseStatus.connected ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Supabase Live
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Memory Fallback
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Klerksdorp Studio Operations, Order Fulfillment, Supabase Database & Live Catalog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button for Admin */}
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20222a] hover:bg-[#2a2c38] text-zinc-200 text-xs font-semibold rounded-lg border border-[#2d2f3c] transition-colors"
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#0d0e12] border-b border-[#21232c] text-xs">
          <div className="p-3 bg-[#171820] rounded-xl border border-[#252733]">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Total Sales</span>
            <strong className="text-base sm:text-lg font-black font-mono text-[#ff5500]">
              R{totalRevenue.toLocaleString()}
            </strong>
          </div>
          <div className="p-3 bg-[#171820] rounded-xl border border-[#252733]">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Total Orders</span>
            <strong className="text-base sm:text-lg font-black font-mono text-white">
              {orders.length}
            </strong>
          </div>
          <div className="p-3 bg-[#171820] rounded-xl border border-[#252733]">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Catalog SKUs</span>
            <strong className="text-base sm:text-lg font-black font-mono text-white">
              {products.length}
            </strong>
          </div>
          <div className="p-3 bg-[#171820] rounded-xl border border-[#252733]">
            <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Database Status</span>
            <strong className={`text-base sm:text-lg font-black font-mono ${supabaseStatus.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {supabaseStatus.connected ? 'Supabase Live' : 'Active (Local)'}
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-[#21232c] bg-[#14151a] px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-[#ff5500] text-[#ff5500]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-[#ff5500] text-[#ff5500]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Stock ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('add_product')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'add_product'
                ? 'border-[#ff5500] text-[#ff5500]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Garment</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'border-[#ff5500] text-[#ff5500]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase DB & Setup</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-10">No orders received yet.</p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#171820] border border-[#262835] rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#232530] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-[#ff5500] text-sm">
                            {order.orderNumber}
                          </span>
                          <span className="text-zinc-400">• {order.customer.fullName}</span>
                          <span className="text-zinc-500 font-mono">({order.customer.phone})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white font-bold text-sm">
                            R{order.total.toLocaleString()}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                              order.status === 'paid'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : order.status === 'processing'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <option value="paid">PAID (PAYFAST)</option>
                            <option value="processing">PROCESSING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                        <div>
                          <strong className="text-zinc-400 block text-[11px]">Courier Details:</strong>
                          <p>{order.courierName} • {order.customer.city}, {order.customer.province}</p>
                          <p className="text-zinc-500">{order.customer.addressLine1}</p>
                        </div>
                        <div>
                          <strong className="text-zinc-400 block text-[11px]">Waybill Tracking:</strong>
                          <span className="font-mono text-[#ff5500] font-bold">
                            {order.trackingNumber || 'Pending Courier Dispatch'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#171820] border border-[#262835] rounded-xl p-3 flex gap-3 items-center justify-between"
                  >
                    <img src={p.image} alt={p.title} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate font-display">{p.title}</h4>
                      <p className="text-[11px] font-mono text-[#ff5500]">R{p.price}</p>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Stock: <strong className="text-white">{p.stockQuantity} units</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400"
                      title="Delete piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW PRODUCT WITH CAMERA / GALLERY */}
          {activeTab === 'add_product' && (
            <form onSubmit={handleCreateProduct} className="space-y-4 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Product Image (Snap Live Photo or Pick from Files)
                </label>

                {cameraActive ? (
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={captureAdminPhoto}
                        className="px-4 py-2 bg-[#ff5500] text-black font-bold text-xs uppercase rounded-lg shadow-lg"
                      >
                        Snap Garment Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setCameraActive(false)}
                        className="px-3 py-2 bg-black/70 text-white text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    {newImage ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0">
                        <img src={newImage} alt="New upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewImage('')}
                          className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-[#1b1c24] border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 flex-shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-2.5 px-3 bg-[#20222a] hover:bg-[#2a2c38] text-zinc-200 text-xs font-bold rounded-lg border border-[#2d2f3c] flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 text-[#ff5500]" />
                        <span>Snap with Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-3 bg-[#20222a] hover:bg-[#2a2c38] text-zinc-200 text-xs font-bold rounded-lg border border-[#2d2f3c] flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span>Choose from Gallery</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAdminFile}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 018 Jacquard Winter Beanie"
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="Caps">Caps</option>
                    <option value="Luxury Knitwear">Luxury Knitwear</option>
                    <option value="Hoodies & Sweats">Hoodies & Sweats</option>
                    <option value="Polos & Knits">Polos & Knits</option>
                    <option value="Dresses">Dresses</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Bags">Bags</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Price (ZAR)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-zinc-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Bespoke jacquard knit engineered in North West..."
                    className="w-full bg-[#181920] border border-[#272935] text-white text-xs p-3 rounded-lg focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 flex items-center justify-center gap-2 transition-all"
              >
                {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save to Live Catalog</span>}
              </button>
            </form>
          )}

          {/* TAB 4: SUPABASE DATABASE & CLOUD SQL */}
          {activeTab === 'database' && (
            <div className="space-y-6 text-xs text-zinc-300">
              {/* Connection Status Card */}
              <div className="p-4 sm:p-5 bg-[#171820] border border-[#262835] rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${supabaseStatus.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Supabase PostgreSQL Live Connection
                        {supabaseStatus.connected ? (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                            ONLINE & SYNCED
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                            IN-MEMORY MODE
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {supabaseStatus.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchDbStatus}
                    disabled={checkingDb}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20222b] hover:bg-[#2c2e3a] text-zinc-200 text-xs font-semibold rounded-lg border border-[#2c2e3c] transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin text-[#ff5500]' : ''}`} />
                    <span>Test Ping</span>
                  </button>
                </div>

                {supabaseStatus.url && (
                  <div className="p-3 bg-[#111216] rounded-xl border border-[#21232d] font-mono text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Connected Endpoint: <strong className="text-white">{supabaseStatus.url}</strong></span>
                    <a
                      href={supabaseStatus.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#ff5500] hover:underline flex items-center gap-1 text-[10px]"
                    >
                      <span>Open Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* 3-Step Setup Guide */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#ff5500]" />
                  <span>How to Link Your Supabase Project (3 Easy Steps)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#171820] border border-[#262835] rounded-xl space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#ff5500] text-black font-extrabold text-[10px] flex items-center justify-center font-mono">
                      1
                    </span>
                    <strong className="text-white block text-xs">Create Free Supabase DB</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#ff5500] hover:underline">supabase.com</a>, create a project (e.g. 018-bokone-store) in Cape Town or Europe region.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#171820] border border-[#262835] rounded-xl space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#ff5500] text-black font-extrabold text-[10px] flex items-center justify-center font-mono">
                      2
                    </span>
                    <strong className="text-white block text-xs">Execute SQL Schema</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Open the Supabase SQL Editor and execute the schema below to initialize tables, RLS security, and product seeds.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#171820] border border-[#262835] rounded-xl space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#ff5500] text-black font-extrabold text-[10px] flex items-center justify-center font-mono">
                      3
                    </span>
                    <strong className="text-white block text-xs">Set Environment Keys</strong>
                    <p className="text-zinc-400 text-[11px]">
                      Add <code className="text-[#ff5500] font-mono">SUPABASE_URL</code> and <code className="text-[#ff5500] font-mono">SUPABASE_ANON_KEY</code> to your environment or Vercel settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ready SQL Schema */}
              <div className="p-4 bg-[#14151b] border border-[#242633] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">Supabase Migration Script</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">supabase/schema.sql</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Jet Black', '018 Orange'],
  description TEXT,
  image TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 15,
  sku TEXT UNIQUE,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  delivery_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  payment_method TEXT NOT NULL DEFAULT 'payfast',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Products" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public Community" ON public.community_photos FOR ALL USING (true);`);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#ff5500] hover:bg-[#e04a00] text-black text-xs font-bold rounded-lg transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0c0d10] border border-[#1e2029] rounded-xl text-[10px] text-zinc-400 font-mono overflow-x-auto max-h-48">
{`-- Quick Summary of tables created:
• public.products (018 Luxury knitwear, caps, combos, stock)
• public.orders (PayFast transactions, delivery tracking, customer details)
• public.community_photos (Community street looks gallery & camera snaps)
• public.store_settings (Theme mode, free delivery thresholds)

-- See full file in repository: /supabase/schema.sql`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
