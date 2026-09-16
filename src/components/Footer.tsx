import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  Sparkles,
  Heart,
  SlidersHorizontal,
  Sun,
  Moon,
  Database,
  Lock
} from 'lucide-react';
import { ThemeMode } from '../types';

interface FooterProps {
  onOpenAdmin: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  currentTheme,
  onToggleTheme
}) => {
  return (
    <footer className="bg-[#090a0c] border-t border-[#1a1b20] text-zinc-400 text-left pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ff5500] text-black font-black flex items-center justify-center text-sm">
                018
              </div>
              <span className="text-xl font-black uppercase text-white font-display tracking-tight">
                BOKONE BOPHIRIMA
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              South African luxury knitwear & streetwear brand rooted in Klerksdorp, North West Province. We engineer bespoke jacquard knits, luxury polos, and cultural statement pieces.
            </p>

            <div className="text-xs font-mono text-zinc-300 flex items-center gap-2">
              <span className="text-[#ff5500] font-bold">"WEAR WHAT WE DIAL (018)"</span>
            </div>

            {/* Quick Actions & Admin Login in Footer */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {/* Admin Portal Button (Moved from Header to Footer) */}
              <button
                id="footer-admin-login-btn"
                onClick={onOpenAdmin}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#171820] hover:bg-[#232530] text-zinc-200 hover:text-white rounded-xl border border-[#2a2c38] hover:border-[#ff5500]/50 text-xs font-semibold transition-all shadow-sm group"
                title="Open Admin & Inventory Management"
              >
                <Lock className="w-3.5 h-3.5 text-[#ff5500] group-hover:scale-110 transition-transform" />
                <span>Admin & Stock Portal</span>
              </button>

              {/* Theme Toggle Button in Footer */}
              <button
                id="footer-theme-toggle-btn"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#171820] hover:bg-[#232530] text-zinc-300 hover:text-white rounded-xl border border-[#2a2c38] text-xs font-medium transition-colors"
                title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light View</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark View</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Studio & Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              Studio & Hub
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ff5500] flex-shrink-0 mt-0.5" />
                <span>Flamwood / Wilkoppies, Klerksdorp, North West, 2571</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>WhatsApp: +27 64 062 9602</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span>orders@018bokone.co.za</span>
              </div>
            </div>
          </div>

          {/* Delivery & Security */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              Nationwide Logistics
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#ff5500]" />
                <span>The Courier Guy Door-to-Door</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>PAXI PEP Store Collection (R60)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Free Shipping on Orders &gt; R999</span>
              </li>
            </ul>
          </div>

          {/* Payment & Guarantees */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-display">
              PayFast SA Security
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Fully encrypted checkout accepting Capitec Pay, Instant EFT, SnapScan, and all SA bank cards.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-zinc-300 font-semibold">256-bit SSL Protected</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#181920] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} 018 Bokone Bophirima (Pty) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Engineered with pride in North West Province</span>
            <span className="text-[#ff5500]">🇿🇦</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

