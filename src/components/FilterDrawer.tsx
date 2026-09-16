import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { ProductCategory } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  selectedSize,
  onSelectSize,
  inStockOnly,
  onToggleInStock,
  onResetFilters,
  totalFilteredCount
}) => {
  if (!isOpen) return null;

  const sizes = ['ALL', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'ONE SIZE'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#111216] border-l border-[#242630] h-full flex flex-col justify-between text-left shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21232c] flex items-center justify-between">
          <h3 className="font-black text-lg text-white uppercase font-display">
            Filter Collection
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Categories */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Garment Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#ff5500] text-black font-bold'
                      : 'bg-[#181920] text-zinc-400 hover:text-white border border-[#272935]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5 pt-2 border-t border-[#1f212a]">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-300 uppercase tracking-wider">Max Price</span>
              <span className="font-mono text-[#ff5500] font-bold">R{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={200}
              max={3000}
              step={50}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#ff5500] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>R200</span>
              <span>R3,000+</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2.5 pt-2 border-t border-[#1f212a]">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Size
            </span>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => onSelectSize(s === 'ALL' ? '' : s)}
                  className={`py-2 text-xs rounded-lg font-bold border transition-all ${
                    (s === 'ALL' && !selectedSize) || selectedSize === s
                      ? 'bg-white text-black border-white'
                      : 'bg-[#181920] border-[#272935] text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-2 border-t border-[#1f212a]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                In Stock Only (Ready for Courier)
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onToggleInStock(e.target.checked)}
                className="w-4 h-4 accent-[#ff5500] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#14151a] border-t border-[#21232c] flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="p-3 rounded-xl border border-[#2c2e3a] text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 text-center"
          >
            Show {totalFilteredCount} Pieces
          </button>
        </div>
      </div>
    </div>
  );
};
