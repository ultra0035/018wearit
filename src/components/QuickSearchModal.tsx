import React, { useState, useEffect } from 'react';
import { Search, X, Star, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121317] border border-[#272935] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl text-left flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#21232c] flex items-center gap-3 bg-[#15161b]">
          <Search className="w-5 h-5 text-[#ff5500] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search caps, cardigans, knitwear, hoodies, SKUs..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 mb-2 font-mono">
            <span>{query ? `RESULTS FOR "${query.toUpperCase()}"` : 'TRENDING 018 PIECES'}</span>
            <span>{filtered.length} found</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No matching pieces found for "{query}". Try "Caps", "Cardigan", or "Combo".
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="bg-[#171820] hover:bg-[#20222a] border border-[#252733] hover:border-[#ff5500]/50 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#ff5500] uppercase font-bold">
                        {product.category}
                      </span>
                      {product.tag && (
                        <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded border border-zinc-700 font-bold">
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white font-display line-clamp-1">
                      {product.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-black font-mono text-white">
                    R{product.price.toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
