import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory } from '../types';
import { soundManager } from '../utils/sound';
import { Sparkles, ArrowRight, Truck, ShieldCheck, RefreshCw, Lock, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HomePage: React.FC = () => {
  const { navigateTo, products, homepageConfig } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');

  const filteredProducts = products.filter((p) => {
    if (p.hidden) return false;
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleCategorySelect = (cat: ProductCategory | 'All') => {
    soundManager.playClick();
    setSelectedCategory(cat);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-[#333333] relative">
      
      {/* 1. HERO BANNER - ELEGANT & POLISHED */}
      <section className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center justify-start overflow-hidden bg-[#0A221B] text-white px-6 sm:px-12 lg:px-20 py-16">
        
        {/* Background Golf Fairway Image with Dark Green Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={homepageConfig.heroImageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1600"}
            alt="Golf Course Sunset Fairway"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Gradient tint: dark green shadow on left fading right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07241C]/95 via-[#0A2C23]/85 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07241C] via-transparent to-black/20" />
        </div>

        {/* Hero Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-2xl space-y-6 pt-4"
        >
          {/* Eyebrow: ── THE GOLF WARDROBE */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[#C9A24D]">
            <div className="w-8 h-[2px] bg-[#C9A24D]" />
            <span>THE GOLF WARDROBE</span>
          </div>

          {/* Title: Find the Perfect Headcover for Your Game. */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight">
            Find the Perfect<br />
            Headcover<br />
            for Your <span className="text-[#C9A24D] font-serif italic">Game.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-gray-200 max-w-lg leading-relaxed font-normal">
            Premium golf headcovers with hundreds of unique handcrafted designs at affordable prices.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {/* Primary Gold Pill: Shop Now → */}
            <button
              onClick={() => navigateTo('shop')}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-[#1A1A1A] font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-xl transition-all transform hover:scale-102 flex items-center gap-2 cursor-pointer"
            >
              Shop Now <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Secondary Outline Pill: ✨ Find My Headcover */}
            <button
              onClick={() => navigateTo('ai-finder')}
              className="border border-white/40 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-full backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C9A24D]" />
              <span>Find My Headcover</span>
            </button>
          </div>

        </motion.div>
      </section>

      {/* 2. PRODUCTS GRID - DIRECTLY BELOW HERO WITH FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4 overflow-x-auto gap-2">
          <div className="flex items-center gap-2 text-xs">
            {['All', 'Leather', 'Funny', 'Irish', 'Animal'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat as any)}
                className={`px-4 py-2.5 rounded-full font-bold whitespace-nowrap transition-all text-xs ${
                  selectedCategory === cat
                    ? 'bg-[#1A1A1A] text-white shadow-sm ring-1 ring-[#1A1A1A]'
                    : 'bg-white text-gray-700 border border-[#E5DEC9] hover:border-[#C9A24D] hover:text-[#1A1A1A]'
                }`}
              >
                {cat === 'All' ? '🌟 All Headcovers' : `${cat}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-[#C9A24D] hover:underline whitespace-nowrap hidden sm:inline-block"
          >
            View Full Shop &rarr;
          </button>
        </div>

        {/* Product Cards Grid: 2 columns on mobile, 4 on desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E5DEC9] p-8 space-y-3">
            <p className="font-serif text-lg font-bold text-[#1A1A1A]">No headcovers found in this category.</p>
            <button
              onClick={() => handleCategorySelect('All')}
              className="text-xs font-bold text-[#C9A24D] underline"
            >
              Reset Category Filter
            </button>
          </div>
        )}
      </section>

      {/* 3. TRUST FEATURES BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#0D382C] text-white rounded-3xl p-8 border border-[#C9A24D]/30 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm">Free Global Shipping</h4>
              <p className="text-[11px] text-gray-300">On all orders over €75</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm">Handcrafted Leather</h4>
              <p className="text-[11px] text-gray-300">Waterproof plush lining</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm">30-Day Returns</h4>
              <p className="text-[11px] text-gray-300">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm">PayPal & Card</h4>
              <p className="text-[11px] text-gray-300">Secure checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING AI ASSISTANT BUTTON */}
      <button
        onClick={() => navigateTo('ai-finder')}
        className="fixed bottom-6 right-6 z-50 bg-[#C9A24D] hover:bg-[#b38e3c] text-[#1A1A1A] font-extrabold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 border border-[#1A1A1A]/10 cursor-pointer"
        title="AI Headcover Assistant"
      >
        <Sparkles className="w-4 h-4 text-[#1A1A1A] fill-[#1A1A1A]" />
        <span className="text-xs uppercase tracking-wider font-extrabold">AI</span>
      </button>

    </div>
  );
};

