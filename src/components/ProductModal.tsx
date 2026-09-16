import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Check, Truck, ShieldCheck, Phone, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize: string, selectedColor: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const allImages = [product.image, ...(product.secondaryImages || [])];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 700);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi 018 Bokone Bophirima team! I'm interested in ordering the *${product.title}* (SKU: ${product.sku}) in Size: ${selectedSize}, Color: ${selectedColor} for R${product.price}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#121317] border border-[#262833] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-zinc-400 hover:text-white hover:bg-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 p-6 bg-[#0e0f12] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#22242d]">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-[#1f2026]">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />

              {product.tag && (
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#ff5500] text-black tracking-wider">
                    {product.tag}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail switcher */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === img ? 'border-[#ff5500] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Local Heritage Stamp */}
            <div className="mt-4 pt-4 border-t border-[#1f2026] flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-mono text-[#ff5500] font-bold">SKU: {product.sku}</span>
              <span>Klerksdorp, North West (018)</span>
            </div>
          </div>

          {/* Right Column: Information & Controls */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#ff5500] font-bold">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold bg-[#181920] px-2.5 py-1 rounded-full border border-[#2a2c35]">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-zinc-500 font-normal">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-display leading-tight">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  R{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-zinc-500 line-through font-mono">
                    R{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                  In Stock ({product.stockQuantity} remaining)
                </span>
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Garment Features */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Craftsmanship & Specs:
                </span>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ff5500] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider">Select Size</span>
                  <span className="text-zinc-500 text-[11px]">South African Standard Fit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSize === sz
                          ? 'bg-[#ff5500] text-black shadow-md shadow-[#ff5500]/20'
                          : 'bg-[#1a1b22] text-zinc-300 hover:bg-[#252630] border border-[#272933]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color options */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Color: <span className="text-zinc-400 font-normal">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 text-xs rounded-md border transition-all ${
                          selectedColor === c
                            ? 'border-[#ff5500] bg-[#ff5500]/10 text-white font-semibold'
                            : 'border-[#262833] bg-[#16171d] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Qty:</span>
                <div className="flex items-center bg-[#181920] rounded-lg border border-[#282a35]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-zinc-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-mono font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-1 text-zinc-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & WhatsApp order */}
            <div className="space-y-3 pt-4 border-t border-[#22242d]">
              <div className="flex items-center gap-3">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    addedAnimation
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#ff5500] hover:bg-[#e04a00] text-black shadow-lg shadow-[#ff5500]/30'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedAnimation ? 'Added to Bag!' : `Add to Bag • R${(product.price * quantity).toLocaleString()}`}</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'bg-[#ff5500]/20 border-[#ff5500] text-[#ff5500]'
                      : 'bg-[#181920] border-[#272935] text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#ff5500]' : ''}`} />
                </button>
              </div>

              {/* Direct WhatsApp Concierge Button */}
              <a
                href={`https://wa.me/27640629602?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#181920] hover:bg-[#20222a] border border-[#272935] hover:border-emerald-600/50 text-zinc-300 hover:text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Order or Inquire via WhatsApp (064 062 9602)</span>
              </a>

              {/* Courier badge */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#ff5500]" />
                  <span>Free Courier Guy delivery on orders &gt; R999</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Secured by PayFast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
