import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { calculateShippingFee } from '../utils/shipping';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cart,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    couponDiscountPercent,
    applyCoupon,
    removeCoupon,
    storeSettings,
    navigateTo
  } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const headcoverDiscountAmount = cart.reduce((sum, item) => sum + (item.product.price * 0.05) * item.quantity, 0);
  const headcoversSubtotal = subtotal - headcoverDiscountAmount;
  const couponDiscountAmount = (headcoversSubtotal * couponDiscountPercent) / 100;
  const discountedSubtotal = headcoversSubtotal - couponDiscountAmount;
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);
  const freeShippingProgress = Math.min(100, (discountedSubtotal / freeShippingThreshold) * 100);
  const shippingFee = (storeSettings.shippingSettings?.freeShippingEnabled !== false && discountedSubtotal >= freeShippingThreshold) || cart.length === 0
    ? 0 
    : calculateShippingFee(cart, 'Ireland', discountedSubtotal, storeSettings.shippingSettings);
  const grandTotal = discountedSubtotal + shippingFee;

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeCart}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-[#FAF8F5] border-b border-[#E5DEC9] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0D382C] text-[#C9A24D] rounded-2xl shadow-sm">
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">Your Golf Wardrobe</h2>
                    <p className="text-xs text-gray-500 font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) in bag</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#1A1A1A] text-white p-3.5 px-6 text-xs">
            {amountForFreeShipping > 0 ? (
              <p className="mb-1.5 flex justify-between font-medium">
                <span>Add <strong className="text-[#C9A24D]">{storeSettings.currencySymbol}{amountForFreeShipping.toFixed(2)}</strong> for Free Ireland Delivery</span>
                <span>{Math.round(freeShippingProgress)}%</span>
              </p>
            ) : (
              <p className="flex items-center gap-1.5 font-semibold text-[#C9A24D]">
                <Truck className="w-4 h-4" /> You unlocked Complimentary Ireland Delivery!
              </p>
            )}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#C9A24D] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#F5F1E8]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center text-[#C9A24D] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-1">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">Explore our luxury headcovers crafted with premium leather and personality.</p>
                <button
                  onClick={() => {
                    closeCart();
                    navigateTo('shop');
                  }}
                  className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemOriginalTotal = item.product.price * item.quantity;
                const itemHeadcoverDiscount = (item.product.price * 0.05) * item.quantity;
                const itemDiscountedTotal = itemOriginalTotal - itemHeadcoverDiscount;

                return (
                  <div key={item.product.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-[#F5F1E8] shrink-0 border border-[#E5DEC9]"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4
                            onClick={() => {
                              closeCart();
                              navigateTo('product', { productId: item.product.id });
                            }}
                            className="font-serif text-sm font-semibold text-[#1A1A1A] hover:text-[#C9A24D] cursor-pointer line-clamp-1"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#C9A24D] font-medium">
                            Fit: {item.selectedClubFit || item.product.clubFit}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            5% Headcover Discount
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-[#E5DEC9] rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#F5F1E8] text-gray-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-[#1A1A1A]">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#F5F1E8] text-gray-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="font-serif text-sm font-bold text-[#1A1A1A] block">
                            {storeSettings.currencySymbol}{itemDiscountedTotal.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through block">
                            {storeSettings.currencySymbol}{itemOriginalTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#FAF8F5] border-t border-[#E5DEC9] space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 px-3 flex items-center justify-between text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" /> Coupon "{appliedCoupon}" ({couponDiscountPercent}% OFF)
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. GOLF10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] text-white hover:bg-[#C9A24D] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-[#E5DEC9]/50">
                <div className="flex justify-between">
                  <span>Headcovers List Total</span>
                  <span className="font-semibold text-gray-900">{storeSettings.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>5% Off Every Headcover</span>
                  <span>-{storeSettings.currencySymbol}{headcoverDiscountAmount.toFixed(2)}</span>
                </div>

                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount ({couponDiscountPercent}%)</span>
                    <span className="font-semibold">-{storeSettings.currencySymbol}{couponDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Ireland Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shippingFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `${storeSettings.currencySymbol}${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-serif font-bold text-[#1A1A1A] pt-2 border-t border-[#E5DEC9]">
                  <span>Total</span>
                  <span className="text-lg text-[#C9A24D]">{storeSettings.currencySymbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  navigateTo('checkout');
                }}
                className="w-full bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24D]" /> 256-Bit SSL Encrypted Checkout
              </p>
            </div>
          )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
