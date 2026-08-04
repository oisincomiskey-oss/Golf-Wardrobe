import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Info, AlertCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationToast: React.FC = () => {
  const { toasts } = useStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold transition-all ${
              toast.type === 'success'
                ? 'bg-[#0D382C] text-white border-[#C9A24D] shadow-[#0D382C]/30'
                : toast.type === 'error'
                ? 'bg-red-900 text-white border-red-700 shadow-red-950/40'
                : 'bg-[#FAF8F5] text-[#1A1A1A] border-[#E5DEC9] shadow-black/10'
            }`}
          >
            {toast.type === 'success' && (
              <div className="w-8 h-8 rounded-full bg-[#C9A24D] text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-md">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#C9A24D] shrink-0" />}
            
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#C9A24D]">
                <Sparkles className="w-3 h-3" /> <span>Golf Wardrobe</span>
              </div>
              <p className="text-white font-serif text-sm leading-snug">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

