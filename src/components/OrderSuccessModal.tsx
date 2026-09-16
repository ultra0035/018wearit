import React from 'react';
import { CheckCircle2, Truck, Copy, Check, MessageSquare, Phone, PackageCheck, ShoppingBag } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onContinueShopping: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onContinueShopping
}) => {
  if (!order) return null;

  const [copied, setCopied] = React.useState(false);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi 018 Bokone team! I just placed order *${order.orderNumber}* for R${order.total}. Customer: ${order.customer.fullName}. Could you confirm my tracking dispatch?`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121317] border border-[#272935] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-left space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 border border-[#ff5500] text-[#ff5500] flex items-center justify-center mx-auto shadow-lg shadow-[#ff5500]/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono text-[#ff5500] uppercase tracking-widest font-extrabold block">
            PAYMENT CONFIRMED • SECURED BY PAYFAST
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-display">
            Siyabonga! Order Placed.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
            Your 018 Bokone Bophirima knitwear piece is being prepared for dispatch in Klerksdorp.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-[#181920] border border-[#292b36] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-zinc-400 block font-mono">ORDER REFERENCE NUMBER:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-black font-mono text-white tracking-wider">
                {order.orderNumber}
              </span>
              <button
                onClick={handleCopyOrderNumber}
                className="p-1.5 rounded-lg bg-[#242630] hover:bg-[#2f3240] text-zinc-300 text-xs flex items-center gap-1 transition-colors"
                title="Copy order number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-zinc-400 block font-mono">ESTIMATED COURIER DISPATCH:</span>
            <span className="text-xs font-bold text-emerald-400">
              Within 24 Hours ({order.courierName})
            </span>
          </div>
        </div>

        {/* Tracking Details */}
        <div className="bg-[#15161b] border border-[#23252e] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#21232c] pb-2">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <Truck className="w-4 h-4 text-[#ff5500]" />
              <span>Courier Delivery to:</span>
            </div>
            <span className="text-zinc-400 font-mono text-[11px]">
              {order.customer.city}, {order.customer.province} ({order.customer.postalCode})
            </span>
          </div>

          <div className="text-xs text-zinc-300 space-y-1">
            <p><strong>Recipient:</strong> {order.customer.fullName} ({order.customer.phone})</p>
            <p><strong>Address:</strong> {order.customer.addressLine1}</p>
            {order.trackingNumber && (
              <p className="text-[#ff5500] font-mono font-semibold pt-1">
                Waybill Tracking: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Items in this parcel ({order.items.length}):
          </span>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs bg-[#17181f] p-2.5 rounded-lg border border-[#252732]"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-9 h-9 rounded object-cover"
                  />
                  <div>
                    <strong className="text-white block font-display">{item.product.title}</strong>
                    <span className="text-zinc-400 text-[11px]">
                      Size: {item.selectedSize} • Qty: {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-white font-bold">
                  R{(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onContinueShopping}
              className="flex-1 py-3 px-6 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/20 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Exploring 018 Drops</span>
            </button>

            <a
              href={`https://wa.me/27640629602?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-5 bg-[#181920] hover:bg-[#22242c] border border-[#292b36] text-zinc-200 hover:text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Dispatch Alert</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
