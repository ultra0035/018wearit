import React from 'react';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onQuickAddToCart
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-[#141519] border border-[#23252d] hover:border-[#ff5500]/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square bg-[#1b1c22] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tag && (
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm ${
                product.tag === 'NEW DROP'
                  ? 'bg-emerald-600 text-white'
                  : product.tag === 'BESTSELLER'
                  ? 'bg-black text-white border border-zinc-700'
                  : product.tag === 'SAVE R700'
                  ? 'bg-[#ff5500] text-black font-black'
                  : 'bg-zinc-800 text-zinc-200'
              }`}
            >
              {product.tag}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 z-10 ${
            isWishlisted
              ? 'bg-[#ff5500] text-black shadow-md'
              : 'bg-white/90 text-zinc-900 hover:bg-white hover:text-[#ff5500]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
        </button>

        {/* Quick View & Add Bar (matches screenshots) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="flex-1 py-2 px-3 bg-black/85 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors border border-white/10"
          >
            <Eye className="w-3.5 h-3.5 text-[#ff5500]" />
            <span>Quick View</span>
          </button>

          <button
            id={`quick-add-btn-${product.id}`}
            onClick={() => onQuickAddToCart(product)}
            className="w-9 h-9 bg-[#ff5500] hover:bg-[#e04a00] text-black rounded-lg flex items-center justify-center transition-colors shadow-md shadow-[#ff5500]/30 flex-shrink-0"
            title="Quick Add To Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-2.5">
        {/* Category & Star Rating */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            {product.category}
          </span>
          <div className="flex items-center gap-1 font-bold text-zinc-200">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Product Title */}
        <h4
          onClick={() => onQuickView(product)}
          className="font-bold text-sm sm:text-base text-white hover:text-[#ff5500] transition-colors line-clamp-1 cursor-pointer font-display"
        >
          {product.title}
        </h4>

        {/* Description snippet */}
        <p className="text-zinc-400 text-xs line-clamp-1 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Size details */}
        <div className="pt-2 border-t border-[#1f2129] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              R{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-500 line-through font-mono">
                R{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold bg-[#1a1b22] px-2 py-0.5 rounded border border-[#272933]">
            {product.sizes.length === 1 ? '1 SIZE' : `${product.sizes.length} SIZES`}
          </span>
        </div>
      </div>
    </div>
  );
};
