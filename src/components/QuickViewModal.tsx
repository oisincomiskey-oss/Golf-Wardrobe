import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Star, Heart, ShoppingBag, ShieldCheck, Check, ArrowRight } from 'lucide-react';

import { ClubFit } from '../types';

export const QuickViewModal: React.FC = () => {
  const { isQuickViewOpen, closeQuickView, quickViewProductId, products, addToCart, toggleWishlist, isInWishlist, navigateTo, storeSettings } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedClubFit, setSelectedClubFit] = useState<ClubFit>('Driver');

  if (!isQuickViewOpen || !quickViewProductId) return null;

  const product = products.find((p) => p.id === quickViewProductId);
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const activeImage = selectedImage || product.image;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeQuickView} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden transition-all my-8">
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 text-gray-400 hover:text-gray-700 hover:bg-white transition-all shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="p-6 bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#E5DEC9] flex flex-col justify-between">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E5DEC9] mb-4 relative flex items-center justify-center p-3">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain object-center"
                />
                {product.isGenuineLeather && (
                  <span className="absolute top-3 left-3 bg-[#1A1A1A]/90 text-white text-[10px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#C9A24D]" /> Genuine Leather
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[product.image, ...(product.gallery || [])].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-[#FAF8F5] flex items-center justify-center p-1 ${
                      activeImage === img ? 'border-[#C9A24D] ring-2 ring-[#C9A24D]/20' : 'border-[#E5DEC9] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Column */}
            <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="uppercase tracking-widest text-[#C9A24D] font-bold">
                    {product.category} • {product.clubFit}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-gray-900">{product.rating}</span>
                    <span className="text-gray-400">({product.reviewsCount})</span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                    {storeSettings.currencySymbol}{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {storeSettings.currencySymbol}{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mb-4 line-clamp-3">
                  {product.description}
                </p>

                <div className="space-y-2 text-xs mb-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DEC9]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-semibold">Club Fit Option:</span>
                    <select
                      value={selectedClubFit}
                      onChange={(e: any) => setSelectedClubFit(e.target.value as ClubFit)}
                      className="bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                    >
                      {(product.allowedClubFits && product.allowedClubFits.length > 0 
                        ? product.allowedClubFits 
                        : ['Driver', '3 Wood', '5 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter']
                      ).map((fit) => (
                        <option key={fit} value={fit}>{fit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Material:</span>
                    <span className="font-medium text-gray-900">{product.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Waterproof:</span>
                    <span className="font-medium text-emerald-700">{product.isWaterproof ? 'Yes - Weather Defying' : 'Water-resistant finish'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stock Status:</span>
                    <span className="font-medium text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {/* Quantity & Actions */}
                <div className="flex gap-3 mb-4">
                  <div className="flex items-center border border-[#E5DEC9] rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 hover:bg-[#F5F1E8] text-gray-600"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 hover:bg-[#F5F1E8] text-gray-600"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, quantity, selectedClubFit);
                      closeQuickView();
                    }}
                    className="flex-1 bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      inWishlist ? 'bg-red-50 text-red-500 border-red-200' : 'border-[#E5DEC9] text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    closeQuickView();
                    navigateTo('product', { productId: product.id });
                  }}
                  className="w-full text-center text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:text-[#C9A24D] transition-colors flex items-center justify-center gap-1 py-1"
                >
                  View Full Product Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
