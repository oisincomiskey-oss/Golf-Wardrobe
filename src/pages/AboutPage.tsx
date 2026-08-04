import React from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, ShieldCheck, Award, HeartHandshake, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      
      {/* Hero Header */}
      <section className="bg-[#1A1A1A] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A24D]/20 text-[#C9A24D] text-xs font-semibold uppercase tracking-widest border border-[#C9A24D]/40">
            <Crown className="w-4 h-4" /> Heritage & Craftsmanship
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
            Redefining Luxury in the Golf Bag
          </h1>
          <p className="text-base sm:text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            Founded in 2021, The Golf Wardrobe was born out of a desire to replace mass-produced vinyl covers with heirloom-quality leather, British embroidery, and playful personality.
          </p>
        </div>
      </section>

      {/* Main Story Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A24D]">
              Our Philosophy
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Where Florentine Leather Meets Links Heritage
            </h2>
            <p>
              We believe a golfer's bag should reflect their individual style and appreciation for fine craftsmanship. Every Golf Wardrobe headcover begins with full-grain leather hand-selected from heritage tanneries in Florence, Italy.
            </p>
            <p>
              Whether it’s the timeless elegance of our classic saddle brown driver covers, the playful nod of our shamrock clover designs, or the lighthearted humor of our golf banter embroideries, every piece is built to endure hundreds of rounds.
            </p>
          </div>
          <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-[#E5DEC9]">
            <img
              src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1000"
              alt="Leather Stitching Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#E5DEC9]">
          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F1E8] text-[#C9A24D] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Weather Defying</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Treated with hydrophobic wax seals to ensure rainwater beads off effortlessly on morning rounds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F1E8] text-[#C9A24D] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">12-Step Stitching</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Reinforced heavy-gauge thread seams prevent fraying and withstand years of bag insertion and removal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F1E8] text-[#C9A24D] flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Lifetime Guarantee</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We stand behind every headcover. Should any magnetic enclosure or seam break, we replace it free of charge.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-[#1A1A1A] text-white p-10 rounded-3xl border border-[#C9A24D]/40 space-y-4 shadow-xl">
          <h2 className="font-serif text-3xl font-bold">Explore Our Collections</h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Find the perfect headcover for your driver, fairway wood, hybrid, or putter today.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2"
          >
            Shop The Wardrobe <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
