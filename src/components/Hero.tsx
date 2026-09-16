import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, MapPin } from 'lucide-react';
import { ProductCategory } from '../types';

interface HeroProps {
  onShopCollection: () => void;
  onSelectCombo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopCollection, onSelectCombo }) => {
  return (
    <section className="relative bg-[#0c0d0e] border-b border-[#1c1d22] overflow-hidden py-12 md:py-20">
      {/* Subtle Background glow in Bokone Orange */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#ff5500]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Origin Location Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1d22] border border-[#2e3038] text-xs font-semibold tracking-wider text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
              <span className="text-[#ff5500]">KLERKSDORP, NORTH WEST (018)</span>
              <span className="text-zinc-500">•</span>
              <span>SOUTH AFRICA</span>
            </div>

            {/* Massive Display Title */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95] font-display">
              NOT JUST A <br />
              <span className="text-white">BRAND, IT'S A</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                LIFESTYLE.
              </span>
            </h1>

            {/* Body Description */}
            <p className="text-zinc-300 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              Rooted in Bokone Bophirima. Designed for wherever life takes you. Explore bespoke knitwear, luxury polos, hoodies, and signature drops.
            </p>

            {/* 3 Value Pillars */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-1 text-xs sm:text-sm font-medium text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff5500] flex-shrink-0" />
                <span>Knitted From Scratch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff5500] flex-shrink-0" />
                <span>100% Proudly North West</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ff5500] flex-shrink-0" />
                <span>Limited Edition Runs</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-shop-collection-btn"
                onClick={onShopCollection}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-sm uppercase tracking-wider rounded-full shadow-lg shadow-[#ff5500]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-weekend-combo-btn"
                onClick={onSelectCombo}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#18191e] hover:bg-[#23252c] text-zinc-200 font-bold text-sm rounded-full border border-[#2e3039] hover:border-[#ff5500]/50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#ff5500]" />
                <span>Weekend Combo (Save R700)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Card matching screenshots */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-[#2a2c33] bg-[#141519] shadow-2xl group">
              {/* Image with subtle overlay */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80"
                  alt="018 Bokone Streetwear Models"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Top Logo Badge inside card */}
                <div className="absolute top-5 left-5">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="bg-[#ff5500] text-black font-black text-sm px-1.5 py-0.5 rounded">018</span>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-bold">
                      BOKONE BOPHIRIMA
                    </span>
                  </div>
                </div>

                {/* Card Content Overlay */}
                <div className="absolute bottom-5 left-5 right-5 space-y-2 text-left">
                  <span className="text-zinc-300 font-mono text-xs uppercase tracking-widest block font-bold">
                    THIS IS HOW YOU
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white font-display leading-tight">
                    STYLE <span className="text-[#ff5500]">018.</span>
                  </h2>
                  <p className="text-zinc-300 text-xs sm:text-sm font-medium">
                    Three weekend looks. One identity.
                  </p>

                  <div className="pt-3 flex items-center justify-between border-t border-white/10 text-[11px] text-zinc-400 font-mono">
                    <span>WEAR YOUR <span className="text-[#ff5500] font-bold">ROOTS.</span></span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
