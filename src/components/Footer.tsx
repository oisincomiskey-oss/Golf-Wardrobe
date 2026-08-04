import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { isStudioEnvironment, isAdminUnlocked } from '../utils/envHelper';
import { Crown, Mail, ArrowRight, ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, triggerToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      triggerToast('Thank you for subscribing to The Wardrobe Club! Check your inbox for your 10% welcome code.', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12">
      {/* Upper Value Props Banner */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#C9A24D] mb-2" />
            <h4 className="font-serif text-sm font-semibold text-white">Full-Grain Leather</h4>
            <p className="text-[11px] text-gray-400 mt-1">Authentic Italian & Saddle leather</p>
          </div>
          <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col items-center">
            <Truck className="w-6 h-6 text-[#C9A24D] mb-2" />
            <h4 className="font-serif text-sm font-semibold text-white">Complimentary Delivery</h4>
            <p className="text-[11px] text-gray-400 mt-1">Free Ireland shipping on orders over €75</p>
          </div>
          <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col items-center">
            <Lock className="w-6 h-6 text-[#C9A24D] mb-2" />
            <h4 className="font-serif text-sm font-semibold text-white">Magnetic Enclosures</h4>
            <p className="text-[11px] text-gray-400 mt-1">High-strength secure club lock</p>
          </div>
          <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col items-center">
            <RefreshCw className="w-6 h-6 text-[#C9A24D] mb-2" />
            <h4 className="font-serif text-sm font-semibold text-white">30-Day Easy Returns</h4>
            <p className="text-[11px] text-gray-400 mt-1">Hassle-free guarantee on all items</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                THE GOLF WARDROBE
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Crafting luxury golf headcovers combining Italian saddle leather, heritage British embroidery, and distinctive personality for golfers worldwide.
            </p>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C9A24D] flex items-center justify-center text-[10px] font-bold text-white transition-colors">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C9A24D] flex items-center justify-center text-[10px] font-bold text-white transition-colors">
                FB
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C9A24D] flex items-center justify-center text-[10px] font-bold text-white transition-colors">
                TK
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[10px] uppercase font-bold text-[#C9A24D] tracking-[0.2em] mb-4">
              Headcovers
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => navigateTo('shop', { category: 'Leather' })} className="hover:text-white transition-colors">
                  Leather Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', { category: 'Funny' })} className="hover:text-white transition-colors">
                  Funny Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', { category: 'Irish' })} className="hover:text-white transition-colors">
                  Irish Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop', { category: 'Animal' })} className="hover:text-white transition-colors">
                  Animal Collection
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ai-finder')} className="text-[#C9A24D] font-semibold hover:underline">
                  AI Headcover Concierge &rarr;
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('custom')} className="text-[#C9A24D] font-bold hover:underline">
                  Bespoke Custom Studio &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase font-bold text-[#C9A24D] tracking-[0.2em] mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition-colors">
                  About Our Craftsmanship
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('account')} className="hover:text-white transition-colors">
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors">
                  Shipping & Returns
                </button>
              </li>
              {(isStudioEnvironment() || isAdminUnlocked()) && (
                <li>
                  <button onClick={() => navigateTo('admin')} className="hover:text-white transition-colors flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24D]" /> Admin Portal
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-[10px] uppercase font-bold text-[#C9A24D] tracking-[0.2em] mb-4">
              The Wardrobe Club
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for limited-run alerts & 10% off your initial order.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-[#C9A24D]"
              />
              <button
                type="submit"
                className="w-full bg-[#C9A24D] hover:bg-[#B69145] text-white py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                Join Club <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright & privacy */}
        <div className="pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} The Golf Wardrobe Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigateTo('contact')}>Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigateTo('contact')}>Terms of Service</span>
            <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigateTo('contact')}>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
