import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { isStudioEnvironment, isAdminUnlocked } from '../utils/envHelper';
import { 
  Search, Heart, ShoppingBag, User, Sparkles, ChevronDown, 
  Menu, X, Crown, ShieldAlert, Wand2
} from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    cart,
    wishlist,
    openCart,
    openWishlist,
    openSearch,
    homepageConfig,
    user
  } = useStore();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const categoriesList: { name: ProductCategory; label: string; desc: string }[] = [
    { name: 'Leather', label: 'Leather Headcovers', desc: '100% Florentine & Napa Saddle Leather' },
    { name: 'Funny', label: 'Funny Headcovers', desc: 'Witty embroideries & humor banter' },
    { name: 'Irish', label: 'Irish Headcovers', desc: 'Clovers, Celtic knots & Harris Tweed' },
    { name: 'Animal', label: 'Animal Headcovers', desc: 'Gophers, Stags & Golden Eagles' }
  ];

  const handleCategoryClick = (catName: ProductCategory) => {
    setIsCategoryMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigateTo('shop', { category: catName });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#F5F1E8]">
      {/* Top Announcement Bar */}
      <div className="bg-[#0D382C] text-white text-[10px] sm:text-xs py-2 px-6 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-2">
        <span className="text-base">🎉</span>
        <span>Get 5% Off Every Headcover Added to Cart • Free Ireland Delivery Over €75</span>
      </div>

      {/* Main Header Container */}
      <div className="bg-[#FAF8F5] border-b border-[#E5DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-900 hover:text-[#C9A24D] focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo Brand */}
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-3 h-3 rounded-full bg-[#C9A24D] shrink-0" />
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] group-hover:text-[#C9A24D] transition-colors">
                The Golf Wardrobe
              </span>
            </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-black">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-[#C9A24D] transition-colors pb-1 relative ${
                currentView === 'home' ? 'text-black border-b-2 border-black font-bold' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigateTo('shop', { category: 'All' })}
              className={`hover:text-[#C9A24D] transition-colors pb-1 relative ${
                currentView === 'shop' ? 'text-black border-b-2 border-black font-bold' : ''
              }`}
            >
              Shop
            </button>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryMenuOpen(true)}
              onMouseLeave={() => setIsCategoryMenuOpen(false)}
            >
              <button
                onClick={() => navigateTo('shop')}
                className="hover:text-[#C9A24D] transition-colors pb-1 flex items-center gap-1"
              >
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-[#F5F1E8] rounded-2xl shadow-xl py-3 px-2 mt-1 z-50">
                  {categoriesList.map((cat) => (
                    <div
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="p-3 rounded-xl hover:bg-[#F5F1E8] cursor-pointer transition-colors group"
                    >
                      <p className="font-serif text-sm italic font-semibold text-black group-hover:text-[#C9A24D]">
                        {cat.label}
                      </p>
                      <p className="text-[11px] text-gray-500 normal-case tracking-normal">
                        {cat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Headcover Finder link with gold sparkle badge */}
            <button
              onClick={() => navigateTo('ai-finder')}
              className={`hover:text-[#C9A24D] transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'ai-finder' ? 'text-black border-b-2 border-black font-bold' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24D]" />
              <span>AI Finder</span>
              <span className="bg-[#C9A24D] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                NEW
              </span>
            </button>

            {/* Bespoke Custom Headcovers link */}
            <button
              onClick={() => navigateTo('custom')}
              className={`hover:text-[#3B1C59] transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'custom' ? 'text-[#3B1C59] border-b-2 border-[#3B1C59] font-bold' : ''
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-[#3B1C59]" />
              <span>Custom Headcovers</span>
              <span className="bg-[#3B1C59] text-[#C9A24D] text-[9px] px-2 py-0.5 rounded-full font-extrabold">
                BESPOKE
              </span>
            </button>

            <button
              onClick={() => navigateTo('about')}
              className={`hover:text-[#C9A24D] transition-colors pb-1 ${
                currentView === 'about' ? 'text-black border-b-2 border-black font-bold' : ''
              }`}
            >
              About
            </button>

            {/* Show Admin button strictly when in AI Studio or if Admin is unlocked */}
            {(isStudioEnvironment() || isAdminUnlocked()) && (
              <button
                onClick={() => navigateTo('admin')}
                className={`hover:text-[#C9A24D] transition-colors pb-1 flex items-center gap-1 ${
                  currentView === 'admin' ? 'text-black border-b-2 border-black font-bold' : 'text-gray-400'
                }`}
                title="Admin Portal (Studio Only)"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#C9A24D]" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={openSearch}
              className="p-2 text-black hover:text-[#C9A24D] transition-colors rounded-full hover:bg-[#F5F1E8]"
              title="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={openWishlist}
              className="p-2 text-black hover:text-red-500 transition-colors rounded-full hover:bg-[#F5F1E8] relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={openCart}
              className="p-2 text-black hover:text-[#C9A24D] transition-colors rounded-full hover:bg-[#F5F1E8] relative cursor-pointer"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1.4, 1], opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute top-1 right-1 bg-[#C9A24D] text-[#1A1A1A] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            <button
              onClick={() => navigateTo(user?.isAdmin ? 'admin' : 'account')}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F1E8] text-[10px] font-bold text-black hover:bg-[#C9A24D] hover:text-white transition-all"
            >
              {user ? user.name.substring(0, 2).toUpperCase() : 'JD'}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#F5F1E8] px-6 pt-4 pb-6 space-y-3 shadow-lg">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('home');
            }}
            className="w-full text-left py-2 font-serif text-base italic font-semibold text-black border-b border-[#F5F1E8]"
          >
            Home
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('shop');
            }}
            className="w-full text-left py-2 font-serif text-base italic font-semibold text-black border-b border-[#F5F1E8]"
          >
            Shop All Headcovers
          </button>

          <div className="py-2 border-b border-[#F5F1E8]">
            <p className="text-[10px] uppercase font-bold text-[#C9A24D] tracking-widest mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="text-left text-xs text-gray-700 hover:text-[#C9A24D] py-1 font-serif italic"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('ai-finder');
            }}
            className="w-full text-left py-2.5 px-4 bg-[#F5F1E8] rounded-full font-serif text-sm italic font-semibold text-black flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C9A24D]" />
            <span>AI Headcover Finder</span>
            <span className="ml-auto bg-[#C9A24D] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              AI
            </span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('custom');
            }}
            className="w-full text-left py-2.5 px-4 bg-[#3B1C59] text-white rounded-full font-serif text-sm italic font-semibold flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4 text-[#C9A24D]" />
            <span>Bespoke Custom Headcovers</span>
            <span className="ml-auto bg-[#C9A24D] text-[#1A1A1A] text-[9px] px-2 py-0.5 rounded-full font-extrabold">
              STUDIO
            </span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('about');
            }}
            className="w-full text-left py-2 text-xs text-gray-700 border-b border-[#F5F1E8]"
          >
            About Craftsmanship
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigateTo('account');
            }}
            className="w-full text-left py-2 text-xs text-gray-700 border-b border-[#F5F1E8]"
          >
            My Account & Orders
          </button>

          {(isStudioEnvironment() || isAdminUnlocked()) && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('admin');
              }}
              className="w-full text-left py-2 text-xs text-[#C9A24D] font-semibold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" /> Admin Portal (Studio Only)
            </button>
          )}
        </div>
      )}
    </header>
  );
};
