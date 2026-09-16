import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  discount: number;
  onApplyPromo: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discount,
  onApplyPromo
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const discountAmount = discount > 0 ? (subtotal * discount) / 100 : 0;
  const shippingFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 95;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const success = onApplyPromo(promoCode.trim().toUpperCase());
    if (success) {
      setPromoMessage({ text: '10% 018 VIP Discount applied!', success: true });
    } else {
      setPromoMessage({ text: 'Invalid promo code (Try "018VIP")', success: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#111216] border-l border-[#242630] h-full flex flex-col justify-between text-left shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21232c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#ff5500]" />
            <h3 className="font-black text-lg text-white uppercase font-display tracking-wide">
              Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#171820] p-3.5 border-b border-[#21232c]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            {remainingForFreeShipping > 0 ? (
              <span className="text-zinc-300 font-medium">
                Add <strong className="text-[#ff5500] font-mono font-bold">R{remainingForFreeShipping.toLocaleString()}</strong> for <strong className="text-white">FREE Courier Guy Delivery</strong>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Unlocked FREE Nationwide Courier Guy Delivery! 🇿🇦
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#ff5500] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-zinc-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-zinc-600 stroke-1" />
              <p className="text-sm font-semibold text-zinc-300">Your bag is currently empty</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Explore our curated knitwear, caps, and signature North West drops.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-[#ff5500] text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="bg-[#16171d] border border-[#262833] rounded-xl p-3 flex gap-3 items-center justify-between"
              >
                <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden flex-shrink-0 border border-zinc-800">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-bold text-white truncate font-display">
                    {item.product.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    <span className="font-mono bg-[#20222a] px-1.5 py-0.5 rounded text-zinc-300">
                      {item.selectedSize}
                    </span>
                    <span className="truncate">{item.selectedColor}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#ff5500] mt-1">
                    R{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => onRemoveItem(idx)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-[#20222a] border border-[#2b2d38] rounded-md">
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      className="px-2 py-0.5 text-zinc-400 hover:text-white text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="px-2 py-0.5 text-zinc-400 hover:text-white text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code & Summary Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#14151a] border-t border-[#21232c] space-y-3">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. 018VIP)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-[#1c1e25] border border-[#2c2e3a] text-white text-xs px-3 py-2 rounded-lg uppercase tracking-wider placeholder:normal-case placeholder:text-zinc-500 focus:outline-none focus:border-[#ff5500]"
                />
                <Tag className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-[#262832] hover:bg-[#323442] text-zinc-200 text-xs font-bold rounded-lg border border-[#373946]"
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <p
                className={`text-[11px] font-medium ${
                  promoMessage.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {promoMessage.text}
              </p>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-[#22242e]">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">R{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>018 VIP Discount (10%)</span>
                  <span className="font-mono">-R{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>The Courier Guy Shipping</span>
                <span className="font-mono text-zinc-200">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `R${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#282a36]">
                <span>Total Due</span>
                <span className="font-mono text-lg text-[#ff5500]">R{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>PayFast South Africa Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Instant EFT • Capitec Pay • Visa / Mastercard</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
