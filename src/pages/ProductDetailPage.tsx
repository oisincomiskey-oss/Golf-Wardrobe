import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ClubFit } from '../types';
import { 
  Star, Heart, ShoppingBag, ShieldCheck, Share2, Check, X, 
  Truck, ArrowRight, RefreshCw, ZoomIn, MessageSquare 
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetailPage: React.FC = () => {
  const { selectedProductId, products, addToCart, toggleWishlist, isInWishlist, navigateTo, updateProduct, triggerToast, storeSettings } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedClubFit, setSelectedClubFit] = useState<ClubFit>(product.clubFit);
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description');

  // Review Form State
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Update active image if selected product changes
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedClubFit(product.clubFit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProductId, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigateTo('shop')} className="mt-4 bg-[#C9A24D] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">
          Back to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.clubFit === product.clubFit))
    .slice(0, 4);

  const galleryImages = Array.from(new Set([product.image, ...(product.gallery || [])]));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Product link copied to clipboard!', 'info');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewComment) {
      triggerToast('Please complete your name and review comment.', 'error');
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewComment,
      verified: true
    };

    const updatedReviews = [newRev, ...product.reviews];
    const newRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));

    updateProduct(product.id, {
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: newRating
    });

    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewComment('');
    triggerToast('Thank you! Your review has been published.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <span onClick={() => navigateTo('home')} className="hover:text-[#C9A24D] cursor-pointer">Home</span>
        <span>/</span>
        <span onClick={() => navigateTo('shop')} className="hover:text-[#C9A24D] cursor-pointer">Shop</span>
        <span>/</span>
        <span onClick={() => navigateTo('shop', { category: product.category })} className="hover:text-[#C9A24D] cursor-pointer">{product.category}</span>
        <span>/</span>
        <span className="text-[#1A1A1A] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Gallery Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-[#FAF8F5] rounded-3xl overflow-hidden border border-[#E5DEC9] shadow-md group flex items-center justify-center p-3 sm:p-5">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain object-center cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
              onClick={() => setIsZoomOpen(true)}
            />

            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-3 rounded-2xl bg-white/90 text-gray-800 hover:text-[#C9A24D] backdrop-blur-md shadow-lg transition-transform transform group-hover:scale-110"
              title="Click to Zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {product.isGenuineLeather && (
              <span className="absolute top-4 left-4 bg-[#1A1A1A]/90 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-[#C9A24D]" /> Genuine Leather
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all bg-[#FAF8F5] flex items-center justify-center p-1.5 ${
                  activeImage === img ? 'border-[#C9A24D] ring-4 ring-[#C9A24D]/20' : 'border-[#E5DEC9] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 bg-white p-8 rounded-3xl border border-[#E5DEC9] shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="uppercase tracking-widest text-[#C9A24D] font-bold">
                {product.category} Collection • {product.clubFit} Fit
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-gray-900">{product.rating}</span>
                <span className="text-gray-400">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-serif text-3xl font-bold text-[#1A1A1A]">
                {storeSettings.currencySymbol}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  {storeSettings.currencySymbol}{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                Tax Included
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-2.5 px-3.5 mb-4 text-xs font-semibold flex items-center justify-between">
              <span>🎉 5% Off Each Headcover Added</span>
              <span className="font-bold text-emerald-800">
                Pay {storeSettings.currencySymbol}{(product.price * 0.95).toFixed(2)} in Cart
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>
          </div>

          {/* Club Fit Selection */}
          <div className="space-y-2 pt-4 border-t border-[#F5F1E8]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Select Club Fit Option:
            </label>
            <div className="flex flex-wrap gap-2">
              {(product.allowedClubFits && product.allowedClubFits.length > 0 
                ? product.allowedClubFits 
                : ['Driver', '3 Wood', '5 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter']
              ).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setSelectedClubFit(fit as ClubFit)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedClubFit === fit
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold shadow-xs'
                      : 'bg-[#FAF8F5] text-gray-700 border-[#E5DEC9] hover:border-[#C9A24D]'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-[#F5F1E8]">
            <div className="flex gap-3">
              <div className="flex items-center border border-[#E5DEC9] rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-[#F5F1E8] text-gray-700 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-[#1A1A1A]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-[#F5F1E8] text-gray-700 font-bold"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => addToCart(product, quantity, selectedClubFit)}
                className="flex-1 bg-[#0D382C] hover:bg-[#1A1A1A] text-white py-3.5 px-6 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#C9A24D]" /> Add to Cart
              </motion.button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                  inWishlist
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'border-[#E5DEC9] text-gray-700 hover:bg-[#FAF8F5]'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'In Your Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-2xl border border-[#E5DEC9] text-gray-700 hover:bg-[#FAF8F5] transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5F1E8] text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A24D]" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#C9A24D]" />
              <span>30-Day Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section (Description, Specs, Reviews) */}
      <div className="bg-white rounded-3xl border border-[#E5DEC9] p-6 lg:p-10 shadow-xs">
        <div className="flex border-b border-[#E5DEC9] gap-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'description' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Product Story & Craft
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'specifications' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'reviews' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Client Reviews ({product.reviewsCount})
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>{product.description}</p>
              <p>
                Engineered to seamlessly fit all modern 460cc drivers, fairway woods, hybrids, and blade/mallet putters. Every headcover undergoes 12 individual hand-stitching steps to ensure zero seam breakdown on rainy rounds.
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="font-semibold text-gray-500">Material Composition</span>
                <span className="text-gray-900 font-medium">{product.material}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="font-semibold text-gray-500">Club Fit Compatibility</span>
                <span className="text-gray-900 font-medium">{product.clubFit}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="font-semibold text-gray-500">Waterproofing</span>
                <span className="text-emerald-700 font-medium">{product.isWaterproof ? 'Yes - Water Defying Finish' : 'Water Resistant'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F5F1E8]">
                <span className="font-semibold text-gray-500">Interior Lining</span>
                <span className="text-gray-900 font-medium">Ultra-Soft Anti-Scratch Micro-Fleece</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9]">
                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#1A1A1A]">{product.rating} out of 5</h4>
                  <p className="text-xs text-gray-500">Based on {product.reviewsCount} verified golfer reviews</p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-[#1A1A1A] hover:bg-[#C9A24D] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4">Be the first to review this headcover!</p>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-[#F5F1E8] bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#1A1A1A]">{rev.author}</span>
                          {rev.verified && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-[#E5DEC9]">
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Complete Your Bag
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Full-Screen Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E5DEC9] shadow-2xl relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-1">Write a Review</h3>
            <p className="text-xs text-gray-500 mb-6">Sharing your feedback for {product.name}</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arthur Vance"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-current' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your honest opinion about the craftsmanship, fit, and magnetic lock..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3.5 focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
