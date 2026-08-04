import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Pause, Play, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { ProductCategory } from '../types';

export const SaleBannerSlideshow: React.FC = () => {
  const { salePromoConfig, navigateTo } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = salePromoConfig?.slides || [];

  useEffect(() => {
    if (!salePromoConfig?.enabled || !isPlaying || slides.length <= 1) return;

    const intervalMs = (salePromoConfig.autoPlayIntervalSeconds || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length, salePromoConfig?.autoPlayIntervalSeconds, salePromoConfig?.enabled]);

  if (!salePromoConfig?.enabled || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSlideClick = () => {
    if (currentSlide.linkCategory) {
      navigateTo('shop', { category: currentSlide.linkCategory as ProductCategory });
    } else {
      navigateTo('shop');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div 
        className="relative bg-[#1A1A1A] rounded-3xl overflow-hidden border border-[#C9A24D]/40 shadow-2xl cursor-pointer group transition-all duration-500"
        onClick={handleSlideClick}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Slide Background Image with Overlay */}
        <div className="relative h-[260px] sm:h-[320px] md:h-[380px] w-full overflow-hidden">
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center transition-transform duration-1000 transform group-hover:scale-105 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          
          {/* Top Floating Badge */}
          <div className="absolute top-6 left-6 sm:left-10 flex items-center gap-3">
            {currentSlide.badgeText && (
              <span className="bg-[#C9A24D] text-white font-bold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {currentSlide.badgeText}
              </span>
            )}
            {currentSlide.discountText && (
              <span className="bg-red-600 text-white font-black text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {currentSlide.discountText}
              </span>
            )}
          </div>

          {/* Slide Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl text-white space-y-3 sm:space-y-4">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed">
              {currentSlide.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlideClick();
                }}
                className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-6 sm:px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 group-hover:translate-x-1"
              >
                {currentSlide.buttonText || 'Shop Sale Now'} <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-block">
                Auto-cycling offer • Click to explore
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-colors border border-white/10"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-xs transition-colors border border-white/10"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom Bar Controls & Dots */}
          <div className="absolute bottom-4 left-6 sm:left-12 right-6 sm:right-12 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-8 bg-[#C9A24D]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="text-white/60 hover:text-white p-1.5 rounded-lg bg-black/30 backdrop-blur-xs text-[10px] flex items-center gap-1 uppercase tracking-wider font-bold"
              title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#C9A24D]" />}
              <span className="hidden sm:inline">{isPlaying ? 'Autoplay On' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
