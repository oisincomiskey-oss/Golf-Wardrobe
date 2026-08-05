import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { calculateShippingFee, calculateHeadcoverDiscount } from '../utils/shipping';
import { CustomerDetails, Order } from '../types';
import { 
  ShieldCheck, Lock, CreditCard, Truck, Check, ArrowRight, 
  ShoppingBag, CheckCircle2, ChevronRight, Download, Package 
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon, couponDiscountPercent, storeSettings, placeOrder, navigateTo } = useStore();

  const [step, setStep] = useState<'details' | 'shipping' | 'payment' | 'confirmation'>('details');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Form State
  const [customerForm, setCustomerForm] = useState<CustomerDetails>({
    email: 'charles.s@example.com',
    firstName: 'Charles',
    lastName: 'Sterling',
    address: '14 Grafton Street',
    apartment: 'Flat 2B',
    city: 'Dublin',
    postcode: 'D02 X285',
    country: 'Ireland',
    phone: '+353 87 123 4567'
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'paypal'>('card');

  // Card details mock
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const headcoverDiscountAmount = calculateHeadcoverDiscount(cart);
  const headcoversSubtotal = subtotal - headcoverDiscountAmount;
  const couponDiscountAmount = (headcoversSubtotal * couponDiscountPercent) / 100;
  const discountedSubtotal = headcoversSubtotal - couponDiscountAmount;

  // Dynamic matrix calculation based on headcovers count & destination country
  const baseStandardFee = calculateShippingFee(
    cart,
    customerForm.country,
    discountedSubtotal,
    storeSettings.shippingSettings
  );

  const isFreeShipping = (storeSettings.shippingSettings?.freeShippingEnabled !== false) && (discountedSubtotal >= storeSettings.freeShippingThreshold);

  const standardFee = isFreeShipping ? 0 : baseStandardFee;
  const expressSurcharge = Math.max(3.00, storeSettings.expressShippingRate - storeSettings.standardShippingRate);
  const expressFee = isFreeShipping ? 3.00 : baseStandardFee + expressSurcharge;

  const shippingFee = shippingMethod === 'express' ? expressFee : standardFee;

  const grandTotal = discountedSubtotal + shippingFee;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('shipping');
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pMethod = paymentMethod === 'card' ? 'Credit Card (•••• 4242)' : paymentMethod === 'applepay' ? 'Apple Pay' : 'PayPal';
    const orderObj = placeOrder(customerForm, pMethod, shippingFee);
    setCompletedOrder(orderObj);
    setStep('confirmation');
  };

  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center text-[#C9A24D] mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Your Bag is Empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Return to Store
        </button>
      </div>
    );
  }

  // ORDER CONFIRMATION VIEW
  if (step === 'confirmation' && completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5DEC9] shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#C9A24D]">
              Thank You For Your Order
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Order #{completedOrder.orderNumber} Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your order has been confirmed! You can track your order status and live delivery progress anytime directly on the website under your <strong className="text-[#1A1A1A]">Account Order History</strong>.
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E5DEC9] text-xs text-left max-w-xl mx-auto space-y-4">
            <div className="flex justify-between pb-3 border-b border-[#E5DEC9]">
              <span className="font-semibold text-gray-500">Order Date</span>
              <span className="font-bold text-[#1A1A1A]">{completedOrder.date}</span>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-gray-500 block">Items Ordered:</span>
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-lg border border-[#E5DEC9]" />
                    <div>
                      <p className="font-serif font-semibold text-[#1A1A1A]">{it.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {it.quantity} • Fit: {it.clubFit}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#1A1A1A]">{storeSettings.currencySymbol}{(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5DEC9] space-y-1.5">
              <div className="flex justify-between">
                <span>Shipping Address</span>
                <span className="font-medium text-right text-gray-900">
                  {completedOrder.customer.address}, {completedOrder.customer.city}, {completedOrder.customer.postcode}
                </span>
              </div>
              <div className="flex justify-between font-serif text-base font-bold text-[#1A1A1A] pt-2 border-t border-[#E5DEC9]">
                <span>Total Amount Paid</span>
                <span className="text-[#C9A24D]">{storeSettings.currencySymbol}{completedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigateTo('shop')}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigateTo('account')}
              className="bg-[#1A1A1A] hover:bg-[#C9A24D] text-white font-semibold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md"
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
      
      {/* Checkout Steps Progress */}
      <div className="flex items-center justify-center gap-3 text-xs uppercase font-bold tracking-wider text-gray-400">
        <span className={step === 'details' ? 'text-[#C9A24D] font-extrabold' : step === 'shipping' || step === 'payment' ? 'text-gray-900' : ''}>
          1. Details
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className={step === 'shipping' ? 'text-[#C9A24D] font-extrabold' : step === 'payment' ? 'text-gray-900' : ''}>
          2. Shipping
        </span>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className={step === 'payment' ? 'text-[#C9A24D] font-extrabold' : ''}>
          3. Payment
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Checkout Forms (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6">
          
          {/* STEP 1: CUSTOMER DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] pb-2 border-b border-[#F5F1E8]">
                1. Customer & Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.firstName}
                    onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.lastName}
                    onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="House number and street name"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Town / City</label>
                    <input
                      type="text"
                      required
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Postcode</label>
                    <input
                      type="text"
                      required
                      value={customerForm.postcode}
                      onChange={(e) => setCustomerForm({ ...customerForm, postcode: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Country</label>
                    <select
                      value={customerForm.country}
                      onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-medium text-gray-700 focus:outline-none focus:border-[#C9A24D]"
                    >
                      <option value="Ireland">Ireland 🇮🇪</option>
                      <option value="United Kingdom">United Kingdom 🇬🇧</option>
                      <option value="United States">United States 🇺🇸</option>
                      <option value="Germany">Germany 🇩🇪</option>
                      <option value="France">France 🇫🇷</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#C9A24D] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Continue to Shipping Method <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5F1E8] pb-2">
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  2. Select Shipping Option
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-[#C9A24D] hover:underline font-semibold"
                >
                  Edit Address
                </button>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] text-xs space-y-1">
                <p className="font-semibold text-[#1A1A1A]">Deliver To:</p>
                <p className="text-gray-600">
                  {customerForm.firstName} {customerForm.lastName} • {customerForm.address}, {customerForm.city}, {customerForm.postcode}, {customerForm.country}
                </p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    shippingMethod === 'standard' ? 'bg-white border-[#C9A24D] shadow-sm' : 'bg-[#FAF8F5] border-[#E5DEC9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#C9A24D]" />
                    <div>
                      <p className="font-serif font-bold text-sm text-[#1A1A1A]">
                        {customerForm.country} Standard Delivery ({cart.reduce((s, i) => s + i.quantity, 0)} Headcover{cart.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''})
                      </p>
                      <p className="text-xs text-gray-500">Tracked Courier Service to {customerForm.country}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    {standardFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `${storeSettings.currencySymbol}${standardFee.toFixed(2)}`}
                  </span>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    shippingMethod === 'express' ? 'bg-white border-[#C9A24D] shadow-sm' : 'bg-[#FAF8F5] border-[#E5DEC9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#C9A24D]" />
                    <div>
                      <p className="font-serif font-bold text-sm text-[#1A1A1A]">
                        {customerForm.country} Priority Express Shipping
                      </p>
                      <p className="text-xs text-gray-500">Guaranteed Priority Express Courier with SMS tracking</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    {storeSettings.currencySymbol}{expressFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-6 py-3.5 rounded-2xl border border-[#E5DEC9] text-xs font-semibold uppercase text-gray-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#C9A24D] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5F1E8] pb-2">
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  3. Payment Method
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs text-[#C9A24D] hover:underline font-semibold"
                >
                  Edit Shipping
                </button>
              </div>

              {/* Payment Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'card' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#FAF8F5] text-gray-700 border-[#E5DEC9]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#C9A24D]" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'applepay' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#FAF8F5] text-gray-700 border-[#E5DEC9]'
                  }`}
                >
                  <span className="font-serif text-sm font-black"> Pay</span>
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'paypal' ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#FAF8F5] text-gray-700 border-[#E5DEC9]'
                  }`}
                >
                  <span className="italic text-blue-400 font-bold">PayPal</span>
                  <span>Express Checkout</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal Form Container */}
              {paymentMethod === 'paypal' && (
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-amber-50/50 rounded-2xl border border-blue-200 space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold italic flex items-center justify-center text-sm shadow-xs shrink-0">
                      P
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">PayPal Express Checkout</p>
                      <p className="text-[11px] text-gray-600">Pay securely with your PayPal account or Pay in 3 installments</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 text-[11px] text-gray-600 space-y-1">
                    <p className="font-semibold text-blue-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-blue-600" /> Merchant Account: {storeSettings.paypalEmail || 'payments@thegolfwardrobe.com'}
                    </p>
                    <p className="text-[10px] text-gray-500">Includes PayPal Buyer Protection & instant digital order confirmation</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Place Order • {storeSettings.currencySymbol}{grandTotal.toFixed(2)}
              </button>

              <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24D]" /> 256-Bit Encrypted Payment Lock
              </p>
            </form>
          )}

        </div>

        {/* Right Order Summary Sidebar (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6 sticky top-28">
          <h3 className="font-serif text-xl font-bold text-[#1A1A1A] pb-3 border-b border-[#F5F1E8]">
            Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </h3>

          <div className="divide-y divide-[#F5F1E8] max-h-60 overflow-y-auto">
            {cart.map((item) => {
              const itemOriginalTotal = item.product.price * item.quantity;

              return (
                <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-xl bg-[#F5F1E8] border border-[#E5DEC9]" />
                    <div>
                      <p className="font-serif font-semibold text-[#1A1A1A] line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity} • {item.selectedClubFit || item.product.clubFit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-[#1A1A1A] block">
                      {storeSettings.currencySymbol}{itemOriginalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-[#E5DEC9] text-gray-600">
            <div className="flex justify-between">
              <span>Headcovers Subtotal</span>
              <span className="font-semibold text-gray-900">{storeSettings.currencySymbol}{subtotal.toFixed(2)}</span>
            </div>

            {headcoverDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Multi-Buy Discount (5% Off 2nd+ Item)</span>
                <span>-{storeSettings.currencySymbol}{headcoverDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {couponDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Promotional Discount ({couponDiscountPercent}%)</span>
                <span className="font-semibold">-{storeSettings.currencySymbol}{couponDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-gray-900">
                {shippingFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `${storeSettings.currencySymbol}${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between font-serif text-xl font-bold text-[#1A1A1A] pt-3 border-t border-[#E5DEC9]">
              <span>Total Due</span>
              <span className="text-[#C9A24D]">{storeSettings.currencySymbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
