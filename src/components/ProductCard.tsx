import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist, storeSettings } = useStore();
  const inWishlist = isInWishlist(product.id);

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group">
        <div className="relative w-full sm:w-64 h-64 bg-[#E0D2C0] shrink-0 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.originalPrice && (
              <span className="bg-[#C9A24D] text-[#1A1A1A] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                SALE
              </span>
            )}
            {product.featured && (
              <span className="bg-[#1A1A1A] text-[#C9A24D] text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">
                BEST SELLER
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm ${
              inWishlist ? 'bg-red-50 text-red-600' : 'bg-white text-gray-800 hover:text-red-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
          </motion.button>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5924F] font-bold block mb-1">
              {product.category} · {product.clubFit}
            </span>

            <h3
              onClick={() => navigateTo('product', { productId: product.id })}
              className="font-serif text-xl font-bold text-[#1A1A1A] hover:text-[#C9A24D] transition-colors cursor-pointer mb-2"
            >
              {product.name}
            </h3>

            <p className="text-xs text-gray-500 line-clamp-2 mb-4">
              {product.description}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-[#C9A24D] font-bold mb-4">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-gray-900 font-bold">{product.rating || 4.9}</span>
              <span className="text-gray-400 font-normal">({product.reviewsCount || 58})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F5F1E8]">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                {storeSettings.currencySymbol}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {storeSettings.currencySymbol}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product)}
              className="bg-[#0D382C] hover:bg-[#1A1A1A] text-white p-3 rounded-full shadow-md transition-all flex items-center justify-center cursor-pointer"
              title="Add to Cart"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] rounded-3xl overflow-hidden flex flex-col group relative">
      {/* Product Image Container matching Image 2 */}
      <div
        className="relative aspect-4/5 w-full bg-[#E0D2C0] rounded-3xl overflow-hidden cursor-pointer shadow-xs border border-[#E5DEC9]/60"
        onClick={() => navigateTo('product', { productId: product.id })}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top-Left Stacked Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 z-10">
          {product.originalPrice && (
            <span className="bg-[#C9A24D] text-[#1A1A1A] text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              SALE
            </span>
          )}
          {(product.featured || product.reviewsCount > 20) && (
            <span className="bg-[#1A1A1A] text-[#C9A24D] text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all z-10 ${
            inWishlist
              ? 'bg-red-50 text-red-500'
              : 'bg-white/95 text-gray-800 hover:text-red-500'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
        </motion.button>

        {/* Bottom-Right Add to Cart Plus Button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="absolute bottom-3 right-3 bg-[#0D382C] hover:bg-[#1A1A1A] text-white p-2.5 rounded-full shadow-xl z-10 cursor-pointer"
          title="Add to Cart"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </div>

      {/* Details Section */}
      <div className="pt-3 pb-2 px-1 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Eyebrow */}
          <span className="uppercase tracking-[0.2em] text-[#B5924F] font-bold text-[10px] block">
            {product.category} · {product.clubFit}
          </span>

          {/* Product Title */}
          <h3
            onClick={() => navigateTo('product', { productId: product.id })}
            className="font-serif text-sm sm:text-base font-bold text-[#1A1A1A] hover:text-[#C9A24D] transition-colors cursor-pointer line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs pt-0.5">
            <Star className="w-3.5 h-3.5 fill-[#C9A24D] text-[#C9A24D]" />
            <span className="font-bold text-[#1A1A1A] text-xs">{product.rating || 4.9}</span>
            <span className="text-gray-400 text-[11px]">({product.reviewsCount || 58})</span>
          </div>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-bold text-[#1A1A1A]">
              {storeSettings.currencySymbol}{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {storeSettings.currencySymbol}{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            5% Off 2nd+ Item
          </span>
        </div>
      </div>
    </div>
  );
};
