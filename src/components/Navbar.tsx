import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Camera,
  Package,
  Phone,
  MapPin,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import { ProductCategory, ThemeMode } from '../types';

interface NavbarProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenPhotoUpload: () => void;
  onOpenAdmin?: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onOpenPhotoUpload,
  onOpenAdmin,
  currentTheme,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const mainCategories: ProductCategory[] = [
    'All Pieces',
    'Caps',
    'Hats',
    'Bags',
    'Accessories',
    'Luxury Knitwear',
    'Dresses',
    'Hoodies & Sweats',
    'Combos'
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d0e] border-b border-[#1c1d22] transition-colors">
      {/* Top Notification Announcement Bar matching screenshots */}
      <div className="bg-[#121316] text-[#a1a1aa] text-[11px] sm:text-xs py-2 px-4 border-b border-[#1f2026] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-2xl mx-auto md:mx-0 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse inline-block flex-shrink-0" />
          <span className="font-semibold text-[#ff5500] uppercase tracking-wider">
            FREE EXPRESS DELIVERY
          </span>
          <span className="text-zinc-300">ON ALL SOUTH AFRICAN ORDERS OVER R999</span>
          <span className="hidden sm:inline text-zinc-500">•</span>
          <span className="hidden sm:inline font-mono text-zinc-300">WEAR WHAT WE DIAL (018)</span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-zinc-400 text-xs flex-shrink-0">
          <a
            href="https://wa.me/27640629602?text=Hi%20018%20Bokone%20team,%20I'm%20inquiring%20about%20the%20collection"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-[#ff5500] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>WhatsApp: 064 062 9602</span>
          </a>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>Klerksdorp, North West</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* 018 Bokone Logo */}
          <div
            onClick={() => onSelectCategory('All Pieces')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center">
              {/* Distinctive 018 Logo Typography */}
              <div className="bg-[#ff5500] text-black font-black text-2xl sm:text-3xl px-2.5 py-0.5 rounded tracking-tighter shadow-lg shadow-[#ff5500]/20 flex items-center gap-0.5 transform group-hover:scale-105 transition-transform">
                <span>01</span>
                <span className="text-white text-xl">8</span>
                <span className="text-[10px] text-black align-top font-bold">®</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] tracking-[0.25em] text-[#ff5500] uppercase font-bold">
                zerooneeight™
              </span>
              <span className="text-xs text-zinc-400 font-medium tracking-wide hidden sm:inline">
                Bokone Bophirima
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`nav-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-full transition-all duration-150 relative ${
                    isActive
                      ? 'text-[#ff5500] font-semibold bg-[#ff5500]/10'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {cat}
                  {cat === 'Combos' && (
                    <span className="ml-1 text-[9px] bg-[#ff5500] text-black font-extrabold px-1 rounded uppercase">
                      Save
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#ff5500] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              id="search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#17181c] hover:bg-[#202227] text-zinc-400 hover:text-white rounded-lg border border-[#26282f] text-xs transition-colors"
              title="Quick Search"
            >
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline text-zinc-400">Search</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 bg-black/40 text-[10px] text-zinc-400 rounded font-mono border border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* Photo / Camera Upload Look Button (Requirement 6) */}
            <button
              id="camera-look-btn"
              onClick={onOpenPhotoUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-[#ff5500]/20 hover:to-[#ff5500]/10 text-zinc-200 hover:text-[#ff5500] rounded-lg border border-zinc-700/60 hover:border-[#ff5500]/40 text-xs font-semibold transition-all shadow-sm"
              title="Snap & Upload Your 018 Look"
            >
              <Camera className="w-3.5 h-3.5 text-[#ff5500]" />
              <span className="hidden sm:inline">Wear 018</span>
            </button>

            {/* Admin Stock Portal Trigger Button in Header */}
            {onOpenAdmin && (
              <button
                id="nav-admin-btn"
                onClick={onOpenAdmin}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-[#17181c] hover:bg-[#22242a] text-zinc-300 hover:text-[#ff5500] rounded-lg border border-[#2a2c33] hover:border-[#ff5500]/40 text-xs font-semibold transition-all"
                title="Admin & Stock Portal"
              >
                <Lock className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>Admin</span>
              </button>
            )}

            {/* Dark Mode / Light Mode Toggle Button (Requirement 1) */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-2 text-zinc-300 hover:text-[#ff5500] rounded-lg bg-[#17181c] hover:bg-[#22242a] border border-[#2a2c33] transition-colors"
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme Mode"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="p-2.5 text-zinc-300 hover:text-[#ff5500] rounded-lg hover:bg-zinc-800/60 transition-colors relative"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff5500] text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon with total items */}
            <button
              id="cart-drawer-btn"
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#ff5500] hover:bg-[#e04a00] text-black font-bold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all shadow-md shadow-[#ff5500]/20 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121316] border-b border-zinc-800 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {mainCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeCategory === cat
                    ? 'bg-[#ff5500] text-black font-bold'
                    : 'bg-[#1a1b20] text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onToggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/80 text-zinc-200 rounded-lg text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                {currentTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Theme Mode</span>
              </span>
              <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded uppercase font-mono">
                {currentTheme}
              </span>
            </button>

            <button
              onClick={() => {
                onOpenPhotoUpload();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff5500] rounded-lg text-xs font-semibold"
            >
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Take / Upload 018 Street Photo
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {onOpenAdmin && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ff5500]" />
                  <span>Admin & Stock Portal</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">018 Studio</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
