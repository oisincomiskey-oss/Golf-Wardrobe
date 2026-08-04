import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Mail, ShieldCheck, Clock, ArrowRight, CheckCircle2, Award, Palette, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const CustomHeadcoversPage: React.FC = () => {
  const { setCurrentView, triggerToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      triggerToast('Please enter a valid email address', 'error');
      return;
    }
    setSubscribed(true);
    triggerToast('You are on the VIP early access list!', 'success');
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[85vh] py-12 lg:py-20 text-[#1A1A1A] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#E5DEC9] shadow-xl p-8 sm:p-14 text-center relative overflow-hidden space-y-8"
        >
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C9A24D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0D382C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-[#F5F1E8] border border-[#C9A24D]/40 text-[#1A1A1A] text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#C9A24D]" />
            <span>Custom Headcovers Studio • Coming Soon</span>
          </div>

          {/* MAIN HEADINGS */}
          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight">
              Bespoke Headcovers <br />
              <span className="text-[#C9A24D] italic">Launching Soon</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We are currently crafting our interactive online custom studio. Soon you will be able to design premium leather headcovers with custom uploaded graphics, logos, and personalized embroidery.
            </p>
          </div>

          {/* VIP EARLY ACCESS FORM */}
          <div className="max-w-md mx-auto pt-2">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Get VIP Early Access & Pre-Launch Invites
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>Join Waitlist</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A24D]" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0D382C] text-white p-4 rounded-2xl border border-[#C9A24D]/30 flex items-center justify-center gap-3 text-xs font-bold"
              >
                <CheckCircle2 className="w-5 h-5 text-[#C9A24D]" />
                <span>You're on the list! We'll notify you as soon as the Studio opens.</span>
              </motion.div>
            )}
          </div>

          {/* FEATURE PREVIEW HIGHLIGHTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F5F1E8]">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9] text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#E5DEC9] text-[#1A1A1A] mb-2">
                <Palette className="w-4 h-4 text-[#C9A24D]" />
              </div>
              <h4 className="font-bold text-xs text-[#1A1A1A]">Custom Artwork & Text</h4>
              <p className="text-[11px] text-gray-500 leading-snug">Upload crests, logos or initials embroidered directly onto leather.</p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9] text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#E5DEC9] text-[#1A1A1A] mb-2">
                <Award className="w-4 h-4 text-[#C9A24D]" />
              </div>
              <h4 className="font-bold text-xs text-[#1A1A1A]">Tour-Grade Leather</h4>
              <p className="text-[11px] text-gray-500 leading-snug">Handcrafted with waterproof full-grain leather & soft plush lining.</p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9] text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#E5DEC9] text-[#1A1A1A] mb-2">
                <Clock className="w-4 h-4 text-[#C9A24D]" />
              </div>
              <h4 className="font-bold text-xs text-[#1A1A1A]">Digital Proof Included</h4>
              <p className="text-[11px] text-gray-500 leading-snug">Every order receives an interactive digital proof prior to stitching.</p>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('shop')}
              className="inline-flex items-center gap-2 bg-[#FAF8F5] hover:bg-[#F5F1E8] text-[#1A1A1A] border border-[#E5DEC9] px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#C9A24D]" />
              <span>Explore In-Stock Collection</span>
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
