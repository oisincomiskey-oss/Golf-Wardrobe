import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, products, navigateTo, storeSettings } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim() === ''
    ? []
    : products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.clubFit.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      });

  const popularSearches = ['Leather Driver', 'Shamrock', 'Funny Putter', 'Gopher', 'Waterproof', 'Driver Cover'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeSearch} />

      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16 sm:pt-24">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5DEC9] overflow-hidden transition-all transform">
          {/* Input Header */}
          <div className="p-4 sm:p-6 bg-[#FAF8F5] border-b border-[#E5DEC9] flex items-center gap-3">
            <Search className="w-5 h-5 text-[#C9A24D]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search headcovers by name, material, style, or club fit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-base sm:text-lg bg-transparent border-none focus:outline-none text-[#1A1A1A] placeholder-gray-400 font-serif"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={closeSearch}
              className="p-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-[#E5DEC9]/50 transition-colors ml-2"
            >
              ESC
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24D] mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="bg-[#F5F1E8] hover:bg-[#C9A24D] hover:text-white text-[#1A1A1A] text-xs px-3.5 py-2 rounded-xl transition-colors font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5DEC9] flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-[#C9A24D] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">Instant AI Headcover Finder Available</p>
                    <p className="text-xs text-gray-500">Unsure what fits your bag? Let our AI Concierge guide you step-by-step.</p>
                  </div>
                  <button
                    onClick={() => {
                      closeSearch();
                      navigateTo('ai-finder');
                    }}
                    className="ml-auto bg-[#1A1A1A] hover:bg-[#C9A24D] text-white text-xs px-3 py-2 rounded-lg font-medium shrink-0 transition-colors"
                  >
                    Try AI Finder
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-serif text-lg text-gray-700 mb-1">No headcovers found for "{query}"</p>
                <p className="text-xs text-gray-500">Try searching for keywords like "Leather", "Irish", "Gopher" or "Driver".</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A24D]">
                    {filteredProducts.length} Product Match(es)
                  </span>
                  <button
                    onClick={() => {
                      closeSearch();
                      navigateTo('shop');
                    }}
                    className="text-xs text-[#1A1A1A] hover:text-[#C9A24D] font-medium flex items-center gap-1"
                  >
                    View All Products <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        closeSearch();
                        navigateTo('product', { productId: product.id });
                      }}
                      className="p-3 rounded-xl border border-[#F5F1E8] hover:border-[#C9A24D] hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center gap-4 group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-[#F5F1E8] border border-[#E5DEC9]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#C9A24D] tracking-wider">
                          {product.category} • {product.clubFit}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C9A24D] transition-colors truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">{product.material}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif text-base font-bold text-[#1A1A1A]">
                          {storeSettings.currencySymbol}{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
