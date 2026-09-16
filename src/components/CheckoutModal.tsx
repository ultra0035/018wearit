import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
  Loader2,
  Phone,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { CartItem, DeliveryMethod, Order, OrderCustomer, SOUTH_AFRICA_PROVINCES } from '../types';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discount,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('courier_guy');
  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: 'Kagiso Moloi',
    email: 'kagiso.moloi@gmail.com',
    phone: '082 555 1234',
    addressLine1: '14 Flamwood Drive',
    addressLine2: '',
    city: 'Klerksdorp',
    province: 'North West',
    postalCode: '2571',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'capitec_pay' | 'instant_eft' | 'card'>('payfast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery calculations
  const discountAmount = discount > 0 ? (subtotal * discount) / 100 : 0;
  const shippingFee =
    deliveryMethod === 'studio_pickup'
      ? 0
      : deliveryMethod === 'paxi'
      ? 60
      : subtotal >= 999
      ? 0
      : 95;

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleInputChange = (field: keyof OrderCustomer, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceedPayment = async (mode: 'simulate' | 'payfast_live') => {
    if (!customer.fullName || !customer.email || !customer.phone || !customer.addressLine1) {
      setError('Please fill in all required delivery information.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          subtotal,
          shippingFee,
          discount: discountAmount,
          total,
          deliveryMethod,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Could not create order');
      }

      const order: Order = data.order;

      if (mode === 'payfast_live') {
        // Fetch PayFast signed payload from server
        const pfRes = await fetch('/api/payfast/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order })
        });
        const pfData = await pfRes.json();

        if (pfData.success && pfData.payload) {
          // Construct and submit real PayFast HTML form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = pfData.gatewayUrl;

          Object.keys(pfData.payload).forEach((key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = pfData.payload[key];
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }
      }

      // If simulated or fallback preview:
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff5500', '#ffffff', '#f59e0b', '#10b981']
      });

      onOrderSuccess(order);
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#121317] border border-[#262833] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-left flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#21232c] flex items-center justify-between bg-[#15161b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff5500] text-black font-black flex items-center justify-center text-sm">
              018
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white uppercase font-display">
                Secure Checkout • PayFast SA
              </h3>
              <p className="text-[11px] text-zinc-400">
                Official 018 Bokone Bophirima Order Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: South African Delivery Method */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#ff5500]" />
              <span>1. Choose Delivery Option (South Africa)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* The Courier Guy */}
              <div
                onClick={() => setDeliveryMethod('courier_guy')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'courier_guy'
                    ? 'border-[#ff5500] bg-[#ff5500]/10 text-white'
                    : 'border-[#262833] bg-[#16171d] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>The Courier Guy</span>
                  <span className="font-mono text-[#ff5500]">
                    {subtotal >= 999 ? 'FREE' : 'R95'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Door-to-door express (2-4 business days nationwide)
                </p>
              </div>

              {/* PAXI PEP Stores */}
              <div
                onClick={() => setDeliveryMethod('paxi')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'paxi'
                    ? 'border-[#ff5500] bg-[#ff5500]/10 text-white'
                    : 'border-[#262833] bg-[#16171d] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>PAXI PEP Store</span>
                  <span className="font-mono text-white">R60</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Collect from your nearest PEP Store counter
                </p>
              </div>

              {/* Studio Pickup */}
              <div
                onClick={() => setDeliveryMethod('studio_pickup')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === 'studio_pickup'
                    ? 'border-[#ff5500] bg-[#ff5500]/10 text-white'
                    : 'border-[#262833] bg-[#16171d] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>Klerksdorp Studio</span>
                  <span className="font-mono text-emerald-400">FREE</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Wilkoppies, Klerksdorp (Same day collection)
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Customer Contact & Delivery Info */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff5500]" />
              <span>2. Delivery & Contact Details</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Kagiso Moloi"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Cell Number (For Courier SMS) *</label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. 082 555 1234"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Email Address (For Order Receipt) *</label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. kagiso@gmail.com"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Province *</label>
                <select
                  value={customer.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                >
                  {SOUTH_AFRICA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-zinc-400 block mb-1">Street Address or PEP Store Name *</label>
                <input
                  type="text"
                  required
                  value={customer.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  placeholder="Street address, complex / building, suburb"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  value={customer.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Klerksdorp / Johannesburg"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={customer.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="e.g. 2571"
                  className="w-full bg-[#181920] border border-[#272935] text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: PayFast South African Payment Gateway */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#ff5500]" />
              <span>3. PayFast South Africa Payment Rails</span>
            </label>

            <div className="bg-[#16171d] border border-[#272935] rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-white">Supported Payment Methods:</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  PAYFAST SECURED (256-BIT ENCRYPTION)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-zinc-300">
                <div className="p-2.5 bg-[#1f2028] rounded-lg border border-[#2d2f3c]">
                  <strong className="block text-white">Instant EFT</strong>
                  <span className="text-[10px] text-zinc-400">Capitec, FNB, Absa, SB</span>
                </div>
                <div className="p-2.5 bg-[#1f2028] rounded-lg border border-[#2d2f3c]">
                  <strong className="block text-white">Capitec Pay</strong>
                  <span className="text-[10px] text-zinc-400">One-click app approval</span>
                </div>
                <div className="p-2.5 bg-[#1f2028] rounded-lg border border-[#2d2f3c]">
                  <strong className="block text-white">Debit / Credit</strong>
                  <span className="text-[10px] text-zinc-400">Visa & Mastercard</span>
                </div>
                <div className="p-2.5 bg-[#1f2028] rounded-lg border border-[#2d2f3c]">
                  <strong className="block text-white">Scan to Pay</strong>
                  <span className="text-[10px] text-zinc-400">SnapScan & Zapper</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Total & Actions */}
        <div className="p-4 sm:p-5 bg-[#15161b] border-t border-[#21232c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs text-zinc-400 block">Total Payable (ZAR):</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#ff5500] font-mono">
                R{total.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">({items.length} items + courier)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Instant Test Simulation Button for frictionless preview testing */}
            <button
              id="simulate-checkout-btn"
              type="button"
              disabled={loading}
              onClick={() => handleProceedPayment('simulate')}
              className="flex-1 sm:flex-initial py-3 px-5 bg-[#ff5500] hover:bg-[#e04a00] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ff5500]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Order (Instant Test)</span>
                </>
              )}
            </button>

            {/* Real PayFast Gateway Gateway Trigger */}
            <button
              id="live-payfast-btn"
              type="button"
              disabled={loading}
              onClick={() => handleProceedPayment('payfast_live')}
              className="py-3 px-4 bg-[#1f2028] hover:bg-[#282a35] border border-[#2d2f3c] text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Redirect to PayFast Gateway"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#ff5500]" />
              <span className="hidden md:inline">Live PayFast Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
