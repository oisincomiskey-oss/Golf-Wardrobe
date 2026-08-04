import React, { useState } from 'react';
import { CustomHeadcoverType, CustomMaterial } from '../types';
import { Sparkles, RotateCw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import plainWhiteHeadcover from '../assets/images/plain_white_headcover_1785776905682.jpg';

interface CustomHeadcoverPreviewProps {
  headcoverType: CustomHeadcoverType;
  material: CustomMaterial;
  mainColor: string;
  secondaryColor: string;
  stitchColor: string;
  customText: string;
  font: string;
  embroideryColor: string;
  logoUrl?: string;
  imageUrl?: string;
  interactive?: boolean;
}

export const CustomHeadcoverPreview: React.FC<CustomHeadcoverPreviewProps> = ({
  headcoverType,
  material,
  mainColor,
  secondaryColor,
  stitchColor,
  customText,
  font,
  embroideryColor,
  logoUrl,
  imageUrl,
  interactive = true,
}) => {
  const [viewAngle, setViewAngle] = useState<'front' | 'both' | 'back'>('both');

  // Map font names to CSS font families
  const getFontFamily = (selectedFont: string) => {
    switch (selectedFont) {
      case 'Script Elegant':
        return 'Playfair Display, Georgia, serif';
      case 'Athletic Bold':
        return 'Impact, Arial Black, sans-serif';
      case 'Modern Minimal':
        return 'Plus Jakarta Sans, sans-serif';
      case 'Gothic Blackletter':
        return 'Georgia, serif';
      case 'Serif Classic':
      default:
        return 'Cinzel, Playfair Display, serif';
    }
  };

  const currentGraphic = logoUrl || imageUrl;
  const isWhiteMain = mainColor.toUpperCase() === '#FFFFFF' || mainColor.toUpperCase() === '#FAF8F5' || mainColor === 'white';

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-b from-[#FAF8F5] via-[#F3EFE6] to-[#EAE4D5] rounded-3xl border border-[#E5DEC9] shadow-xl p-5 flex flex-col items-center justify-between overflow-hidden group">
      
      {/* Background Watermark & Brand Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A24D_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-10 text-[10px] uppercase font-bold tracking-widest">
        <div className="flex items-center gap-1.5 bg-[#0D382C] text-[#C9A24D] px-3 py-1 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>Bespoke Studio Live Render</span>
        </div>

        {interactive && (
          <div className="flex bg-white/80 backdrop-blur-xs p-1 rounded-full border border-[#E5DEC9] shadow-xs gap-1">
            <button
              type="button"
              onClick={() => setViewAngle('both')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                viewAngle === 'both' ? 'bg-[#0D382C] text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Pair View
            </button>
            <button
              type="button"
              onClick={() => setViewAngle('front')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                viewAngle === 'front' ? 'bg-[#0D382C] text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setViewAngle('back')}
              className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                viewAngle === 'back' ? 'bg-[#0D382C] text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              Back
            </button>
          </div>
        )}
      </div>

      {/* Photorealistic Canvas Render Container */}
      <div className="relative w-full h-full flex items-center justify-center my-2 p-2 overflow-hidden">
        <motion.div
          key={`${headcoverType}-${viewAngle}-${mainColor}`}
          initial={{ opacity: 0.85, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Base Photorealistic Headcover Image (Black or White) */}
          <div className="relative w-full h-full max-h-[280px] flex items-center justify-center rounded-2xl overflow-hidden">
            <img
              src={plainWhiteHeadcover}
              alt="Leather Golf Headcover"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-contain filter drop-shadow-xl transition-all duration-300 ${
                !isWhiteMain ? 'brightness-[0.25] contrast-[1.25]' : ''
              }`}
            />

            {/* Accent Piping / Secondary Color Subtle Border Tint */}
            <div
              className="absolute inset-x-8 bottom-4 h-1.5 rounded-full opacity-80 pointer-events-none shadow-xs"
              style={{ backgroundColor: secondaryColor }}
            />

            {/* EMBROIDERED ARTWORK + TEXT BLOCK (Text directly UNDER image) */}
            <div
              className={`absolute z-20 pointer-events-none flex flex-col items-center justify-center transition-all ${
                viewAngle === 'back' ? 'left-[58%] top-[20%]' : 'left-[16%] sm:left-[18%] top-[20%]'
              } w-[130px] sm:w-[150px]`}
            >
              {/* Uploaded Graphic Image */}
              {currentGraphic && (
                <img
                  src={currentGraphic}
                  alt="Custom Embroidery Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg filter contrast-105 mb-1.5"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Embroidered Custom Text (Displayed directly under image) */}
              {customText && (
                <span
                  style={{
                    color: embroideryColor,
                    fontFamily: getFontFamily(font),
                    textShadow:
                      mainColor === '#1A1A1A'
                        ? '0px 1px 3px rgba(0,0,0,0.9), 0px 0px 1px #000'
                        : '0px 1px 2px rgba(0,0,0,0.5)',
                  }}
                  className="font-bold text-sm sm:text-base tracking-wider uppercase block text-center leading-tight max-w-[130px] break-words"
                >
                  {customText}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="w-full bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#E5DEC9] shadow-sm flex items-center justify-between z-10 text-xs">
        <div className="space-y-0.5">
          <div className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
            <span>{headcoverType}</span>
            <span className="text-[10px] font-sans bg-[#F5F1E8] text-[#0D382C] px-2 py-0.5 rounded font-extrabold uppercase">
              {material}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-gray-500 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs" style={{ backgroundColor: mainColor }} />
              Main
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-2xs" style={{ backgroundColor: secondaryColor }} />
              Piping
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 opacity-90 border-b-2" style={{ borderColor: stitchColor }} />
              Stitch
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Embroidery Proof</span>
          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5" /> Hand-Inspected
          </span>
        </div>
      </div>
    </div>
  );
};
