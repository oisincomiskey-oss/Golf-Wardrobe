import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory, ClubFit } from '../types';
import { 
  Filter, Grid, List, SlidersHorizontal, Search, RotateCcw, 
  ChevronDown, ShieldCheck, Sparkles 
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { products, selectedCategory, navigateTo, storeSettings } = useStore();

  // Filter States
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>(selectedCategory || 'All');
  const [activeClubFit, setActiveClubFit] = useState<ClubFit | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [genuineLeatherOnly, setGenuineLeatherOnly] = useState(false);
  const [waterproofOnly, setWaterproofOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestselling'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Sync state if category passed via store navigation
  React.useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const categoriesList: (ProductCategory | 'All')[] = ['All', 'Leather', 'Funny', 'Irish', 'Animal'];
  const clubFitsList: (ClubFit | 'All')[] = ['All', 'Driver', '3 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter'];

  // Filtered & Sorted Products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.hidden) return false;
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (activeClubFit !== 'All' && p.clubFit !== activeClubFit) return false;
      if (p.price > maxPrice) return false;
      if (genuineLeatherOnly && !p.isGenuineLeather) return false;
      if (waterproofOnly && !p.isWaterproof) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesMat = p.material.toLowerCase().includes(q);
        const matchesTag = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesMat && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'bestselling') return b.reviewsCount - a.reviewsCount;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      // default: featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeCategory, activeClubFit, searchQuery, maxPrice, genuineLeatherOnly, waterproofOnly, sortBy]);

  const resetFilters = () => {
    setActiveCategory('All');
    setActiveClubFit('All');
    setSearchQuery('');
    setMaxPrice(100);
    setGenuineLeatherOnly(false);
    setWaterproofOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    activeClubFit !== 'All' ||
    searchQuery !== '' ||
    maxPrice < 100 ||
    genuineLeatherOnly ||
    waterproofOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-[#C9A24D]/30 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C9A24D]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#C9A24D]">
            The Golf Wardrobe Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            {activeCategory === 'All' ? 'All Luxury Headcovers' : `${activeCategory} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
            Explore handcrafted golf headcovers combining Italian leather, British embroidery, and distinct personality.
          </p>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-[#E5DEC9] shadow-xs sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-[#F5F1E8]">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C9A24D]" /> Filter Collection
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#C9A24D] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search headcovers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:border-[#C9A24D]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Category
            </label>
            <div className="space-y-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    activeCategory === cat
                      ? 'bg-[#1A1A1A] text-white font-bold'
                      : 'text-gray-700 hover:bg-[#F5F1E8]'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Headcovers' : `${cat} Collection`}</span>
                  <span className="text-[10px] opacity-70">
                    ({cat === 'All' ? products.length : products.filter((p) => p.category === cat).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Club Fit Filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Club Fit
            </label>
            <div className="space-y-1">
              {clubFitsList.map((fit) => (
                <button
                  key={fit}
                  onClick={() => setActiveClubFit(fit)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    activeClubFit === fit
                      ? 'bg-[#C9A24D] text-white font-bold'
                      : 'text-gray-600 hover:bg-[#F5F1E8]'
                  }`}
                >
                  {fit === 'All' ? 'All Club Types' : fit}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              <span>Max Price</span>
              <span className="text-[#C9A24D] font-bold">{storeSettings.currencySymbol}{maxPrice}</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C9A24D] cursor-pointer"
            />
          </div>

          {/* Material & Feature Toggles */}
          <div className="space-y-3.5 pt-2 border-t border-[#F5F1E8]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800">
              <input
                type="checkbox"
                checked={genuineLeatherOnly}
                onChange={(e) => setGenuineLeatherOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#C9A24D] accent-[#C9A24D]"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#C9A24D]" /> Genuine Leather Only
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800">
              <input
                type="checkbox"
                checked={waterproofOnly}
                onChange={(e) => setWaterproofOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#C9A24D] accent-[#C9A24D]"
              />
              <span>Waterproof Guaranteed</span>
            </label>
          </div>

          {/* AI Banner Box */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] text-xs space-y-2">
            <p className="font-serif font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C9A24D]" /> Still Unsure?
            </p>
            <p className="text-gray-500">Let Gemini AI ask you 5 questions and find your exact bag match.</p>
            <button
              onClick={() => navigateTo('ai-finder')}
              className="w-full bg-[#1A1A1A] hover:bg-[#C9A24D] text-white py-2 rounded-xl font-semibold text-[11px] uppercase tracking-wider transition-colors"
            >
              Use AI Headcover Finder
            </button>
          </div>
        </aside>

        {/* MAIN PRODUCT AREA */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DEC9] shadow-xs flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
                className="lg:hidden p-2.5 bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl text-xs font-semibold text-[#1A1A1A] flex items-center gap-2"
              >
                <Filter className="w-4 h-4 text-[#C9A24D]" /> Filters
              </button>

              <p className="text-xs text-gray-600 font-medium">
                Showing <strong className="text-[#1A1A1A] font-bold">{filteredProducts.length}</strong> headcovers
              </p>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#E5DEC9] text-[#1A1A1A] rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-[#C9A24D]"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-[#E5DEC9] rounded-xl overflow-hidden bg-[#FAF8F5]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
              {activeCategory !== 'All' && (
                <span className="bg-[#1A1A1A] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  Category: {activeCategory}
                  <button onClick={() => setActiveCategory('All')} className="hover:text-[#C9A24D]">×</button>
                </span>
              )}
              {activeClubFit !== 'All' && (
                <span className="bg-[#C9A24D] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  Fit: {activeClubFit}
                  <button onClick={() => setActiveClubFit('All')} className="hover:text-black">×</button>
                </span>
              )}
              {genuineLeatherOnly && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  Genuine Leather
                  <button onClick={() => setGenuineLeatherOnly(false)}>×</button>
                </span>
              )}
              {waterproofOnly && (
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  Waterproof
                  <button onClick={() => setWaterproofOnly(false)}>×</button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-[#C9A24D] hover:underline font-bold ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid / List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5DEC9] space-y-4">
              <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center text-[#C9A24D] mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">No Headcovers Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                No products match your active filter criteria. Try expanding your price slider or clearing your keyword search.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} layout={viewMode} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
