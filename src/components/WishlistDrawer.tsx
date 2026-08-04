import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { isWishlistOpen, closeWishlist, wishlist, products, toggleWishlist, addToCart, navigateTo, storeSettings } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={closeWishlist} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-[#FAF8F5] border-b border-[#E5DEC9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">Saved Headcovers</h2>
                <p className="text-xs text-gray-500">{wishlistProducts.length} items in your wishlist</p>
              </div>
            </div>
            <button
              onClick={closeWishlist}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#F5F1E8]">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center text-red-400 mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">Click the heart icon on any headcover to save it to your personal wardrobe.</p>
                <button
                  onClick={() => {
                    closeWishlist();
                    navigateTo('shop');
                  }}
                  className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div key={product.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-[#F5F1E8] shrink-0 border border-[#E5DEC9]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          onClick={() => {
                            closeWishlist();
                            navigateTo('product', { productId: product.id });
                          }}
                          className="font-serif text-sm font-semibold text-[#1A1A1A] hover:text-[#C9A24D] cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h4>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {product.category} • {product.clubFit}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="font-serif text-sm font-bold text-[#1A1A1A]">
                        {storeSettings.currencySymbol}{product.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          addToCart(product);
                          toggleWishlist(product.id);
                        }}
                        className="bg-[#1A1A1A] hover:bg-[#C9A24D] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3 h-3" /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
