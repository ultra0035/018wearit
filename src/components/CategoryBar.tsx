import React from 'react';
import { SlidersHorizontal, RotateCcw, Sparkles, MapPin, Truck, ChevronDown } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryBarProps {
  categories: ProductCategory[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  onResetFilters: () => void;
  totalProductsCount: number;
  filteredProductsCount: number;
  sortOption: string;
  onSortChange: (sort: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenFilterDrawer,
  activeFilterCount,
  onResetFilters,
  totalProductsCount,
  filteredProductsCount,
  sortOption,
  onSortChange
}) => {
  return (
    <div className="space-y-6 pt-4">
      {/* 018 Heritage Studio Banner matching screenshot */}
      <div className="bg-[#15161a] border border-[#23252d] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5500] to-[#d44300] flex items-center justify-center flex-shrink-0 text-black shadow-md shadow-[#ff5500]/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              018 HERITAGE KNITTING STUDIO • KLERKSDORP
            </h3>
            <p className="text-zinc-400 text-xs mt-0.5 max-w-2xl leading-relaxed">
              Every monogram, stripe, and silhouette is engineered in North West Province. Sustainable yarn, precision ribbing, and authentic South African identity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] font-medium text-zinc-400 border-t md:border-t-0 border-[#23252d] pt-3 md:pt-0 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>North West (018)</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-zinc-400" />
            <span>The Courier Guy Door-to-Door</span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span>Paxi Collection</span>
        </div>
      </div>

      {/* Collection Title Header */}
      <div className="text-left space-y-2 pt-2">
        <span className="text-[#ff5500] font-mono text-xs uppercase tracking-widest font-extrabold block">
          BOKONE BOPHIRIMA COLLECTION
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white font-display tracking-tight">
          Curated Knitwear & Streetwear
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
          Knitted from scratch in the North West. Every piece features bespoke jacquard knits, signature 018 crests, and breathable comfort tailored for South African seasons.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 flex-shrink-0 ${
                isSelected
                  ? 'bg-black text-white border-2 border-white/80 shadow-md'
                  : 'bg-[#18191e] hover:bg-[#23252c] text-zinc-300 border border-[#272932]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar matching screenshots */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1c1d22]">
        {/* Left Toolbar: Filter Button + Reset + Count */}
        <div className="flex items-center gap-3">
          <button
            id="filter-trigger-btn"
            onClick={onOpenFilterDrawer}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeFilterCount > 0
                ? 'bg-[#ff5500]/10 border-[#ff5500] text-[#ff5500]'
                : 'bg-[#16171b] border-[#282a33] text-zinc-300 hover:text-white hover:border-zinc-600'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
            )}
          </button>

          {(activeFilterCount > 0 || selectedCategory !== 'All Pieces') && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}

          <span className="text-xs text-zinc-400 pl-1">
            Showing <strong className="text-white font-bold">{filteredProductsCount}</strong> of {totalProductsCount} pieces
          </span>
        </div>

        {/* Right Toolbar: Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-zinc-400 hidden sm:inline">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-[#16171b] text-zinc-200 text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-[#282a33] focus:outline-none focus:border-[#ff5500] cursor-pointer"
            >
              <option value="newest">Newest First (By Date)</option>
              <option value="bestseller">Bestsellers First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
