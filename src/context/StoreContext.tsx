import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Product, ProductCategory, ClubFit, CategoryInfo, CartItem, Order, 
  CustomerUser, HomepageConfig, AISettingsConfig, StoreSettings, OrderStatus, CustomerDetails, SalePromoConfig, CustomHeadcoverConfig, CustomStudioSettings, ShippingLabelData 
} from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  INITIAL_CATEGORIES, INITIAL_HOMEPAGE_CONFIG, INITIAL_AI_SETTINGS, 
  INITIAL_STORE_SETTINGS, INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_SALE_PROMO_CONFIG, INITIAL_CUSTOM_ORDERS, INITIAL_CUSTOM_STUDIO_SETTINGS 
} from '../data/initialData';
import { soundManager } from '../utils/sound';
import { idbGet, idbSet } from '../utils/idbStorage';
import { calculateShippingFee, calculateHeadcoverDiscount, createShippingLabelData, generateTrackingNumber } from '../utils/shipping';
import { 
  fetchProductsFromSupabase, 
  saveProductToSupabase, 
  deleteProductFromSupabase, 
  batchSaveProductsToSupabase, 
  isSupabaseConfigured 
} from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation & Views
  currentView: string; // 'home' | 'shop' | 'product' | 'ai-finder' | 'about' | 'contact' | 'checkout' | 'account' | 'admin'
  selectedCategory: ProductCategory | 'All';
  selectedProductId: string | null;
  adminTab: string;
  navigateTo: (view: string, params?: { category?: ProductCategory | 'All'; productId?: string; adminTab?: string }) => void;

  // Data
  products: Product[];
  categories: CategoryInfo[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  customOrders: CustomHeadcoverConfig[];
  customers: CustomerUser[];
  homepageConfig: HomepageConfig;
  salePromoConfig: SalePromoConfig;
  aiSettings: AISettingsConfig;
  storeSettings: StoreSettings;
  customStudioSettings: CustomStudioSettings;

  // Cart & Coupon
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  addToCart: (product: Product, quantity?: number, clubFit?: ClubFit) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // UI Modals / Drawers
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;

  // Admin Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>, showToast?: boolean) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: CategoryInfo[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  generateOrderLabel: (orderId: string, carrier?: 'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx', weightKg?: number) => ShippingLabelData;
  deleteOrder: (orderId: string) => void;
  updateCustomOrderStatus: (customId: string, status: CustomHeadcoverConfig['status']) => void;
  deleteCustomOrder: (customId: string) => void;
  placeOrder: (customer: CustomerDetails, paymentMethod: string, shippingFeeOverride?: number) => Order;
  updateHomepageConfig: (updates: Partial<HomepageConfig>) => void;
  updateSalePromoConfig: (updates: Partial<SalePromoConfig>) => void;
  updateAISettings: (updates: Partial<AISettingsConfig>) => void;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;
  updateCustomStudioSettings: (updates: Partial<CustomStudioSettings>) => void;

  // Auth
  user: { id: string; name: string; email: string; isAdmin: boolean } | null;
  login: (email: string, password?: string, isAdmin?: boolean) => boolean;
  logout: () => void;

  // Toast
  toasts: Toast[];
  triggerToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isRehydrated = useRef<boolean>(false);

  // Persistence Helpers
  const broadcastChange = (key: string, value: any) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('golf_wardrobe_sync');
        bc.postMessage({ type: 'STORE_UPDATE', key, value });
        bc.close();
      }
    } catch (e) {
      // Ignore broadcast channel errors
    }
  };

  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`golf_wardrobe_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const setStored = (key: string, value: any) => {
    try {
      localStorage.setItem(`golf_wardrobe_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage (quota may be exceeded), relying on IndexedDB persistence.`, e);
    }
    idbSet(key, value);
    broadcastChange(key, value);

    // Sync store updates to Supabase
    if (key === 'products' && Array.isArray(value)) {
      batchSaveProductsToSupabase(value).catch((err) => console.warn('Failed to batch save products to Supabase:', err));
    }

    // Sync store updates to backend server API so all new visitors see updated products, prices, and customizations
    const syncKeys = ['products', 'categories', 'storeSettings', 'customStudioSettings', 'homepage', 'salePromoConfig', 'aiSettings'];
    if (syncKeys.includes(key)) {
      const apiKey = key === 'homepage' ? 'homepageConfig' : key;
      fetch('/api/store-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [apiKey]: value })
      }).catch((err) => console.warn('Failed to sync store data to server:', err));
    }
  };

  // View States
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Core Data States
  const [products, setProducts] = useState<Product[]>(() => getStored('products', INITIAL_PRODUCTS));
  const [categories, setCategories] = useState<CategoryInfo[]>(() => getStored('categories', INITIAL_CATEGORIES));
  const [cart, setCart] = useState<CartItem[]>(() => getStored('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => getStored('wishlist', ['prod-1', 'prod-3']));
  const [orders, setOrders] = useState<Order[]>(() => getStored('orders', INITIAL_ORDERS));
  const [customOrders, setCustomOrders] = useState<CustomHeadcoverConfig[]>(() => getStored('customOrders', INITIAL_CUSTOM_ORDERS));
  const [customers, setCustomers] = useState<CustomerUser[]>(() => getStored('customers', INITIAL_CUSTOMERS));
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => getStored('homepage', INITIAL_HOMEPAGE_CONFIG));
  const [salePromoConfig, setSalePromoConfig] = useState<SalePromoConfig>(() => getStored('salePromoConfig', INITIAL_SALE_PROMO_CONFIG));
  const [aiSettings, setAiSettings] = useState<AISettingsConfig>(() => getStored('aiSettings', INITIAL_AI_SETTINGS));
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getStored('storeSettings', INITIAL_STORE_SETTINGS));
  const [customStudioSettings, setCustomStudioSettings] = useState<CustomStudioSettings>(() => getStored('customStudioSettings', INITIAL_CUSTOM_STUDIO_SETTINGS));

  // Asynchronous rehydration from Backend API, Static Files (/store_data.json, /products.json), IndexedDB, and LocalStorage
  useEffect(() => {
    let isMounted = true;
    async function loadIndexedDB() {
      try {
        let serverData: any = null;
        
        // 1. Try Backend API first
        try {
          const apiRes = await fetch('/api/store-data');
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson?.storeData) {
              serverData = apiJson.storeData;
            }
          }
        } catch (e) {}

        // 2. If Backend API is unavailable (e.g. on Hostinger static hosting), fallback to static JSON files
        if (!serverData) {
          try {
            const staticDataRes = await fetch('/store_data.json');
            if (staticDataRes.ok) {
              serverData = await staticDataRes.json();
            }
          } catch (e) {}
        }

        // 0. Fetch products directly from Supabase if configured
        let supabaseProducts: Product[] | null = null;
        if (isSupabaseConfigured()) {
          supabaseProducts = await fetchProductsFromSupabase();
          // Auto-seed default products to Supabase if table is currently empty
          if (supabaseProducts !== null && supabaseProducts.length === 0) {
            const seedList = (serverData?.products && Array.isArray(serverData.products) && serverData.products.length > 0)
              ? serverData.products
              : INITIAL_PRODUCTS;
            await batchSaveProductsToSupabase(seedList);
            supabaseProducts = await fetchProductsFromSupabase() || seedList;
          }
        }

        let staticProducts: Product[] | null = null;
        if (!supabaseProducts && (!serverData?.products || !Array.isArray(serverData.products) || serverData.products.length === 0)) {
          try {
            const staticProdRes = await fetch('/products.json');
            if (staticProdRes.ok) {
              const prodJson = await staticProdRes.json();
              if (Array.isArray(prodJson) && prodJson.length > 0) {
                staticProducts = prodJson;
              }
            }
          } catch (e) {}
        }

        // Products: Supabase takes highest priority, then Server API / Static files, then IndexedDB
        const loadedProducts: Product[] | null = (supabaseProducts && Array.isArray(supabaseProducts))
          ? supabaseProducts
          : (serverData?.products && Array.isArray(serverData.products) && serverData.products.length > 0)
          ? serverData.products
          : (staticProducts && staticProducts.length > 0)
          ? staticProducts
          : await idbGet<Product[]>('products');

        if (loadedProducts && Array.isArray(loadedProducts) && loadedProducts.length > 0 && isMounted) {
          setProducts(loadedProducts);
          try {
            localStorage.setItem('golf_wardrobe_products', JSON.stringify(loadedProducts));
          } catch (e) {}
          idbSet('products', loadedProducts);
        }

        // Categories
        const loadedCategories = (serverData?.categories && Array.isArray(serverData.categories) && serverData.categories.length > 0)
          ? serverData.categories
          : await idbGet<CategoryInfo[]>('categories');
        if (loadedCategories && Array.isArray(loadedCategories) && loadedCategories.length > 0 && isMounted) {
          setCategories(loadedCategories);
          try {
            localStorage.setItem('golf_wardrobe_categories', JSON.stringify(loadedCategories));
          } catch (e) {}
          idbSet('categories', loadedCategories);
        }

        // Store Settings
        const loadedStoreSettings = serverData?.storeSettings || await idbGet<StoreSettings>('storeSettings');
        if (loadedStoreSettings && isMounted) {
          setStoreSettings(loadedStoreSettings);
          try {
            localStorage.setItem('golf_wardrobe_storeSettings', JSON.stringify(loadedStoreSettings));
          } catch (e) {}
          idbSet('storeSettings', loadedStoreSettings);
        }

        // Custom Studio Settings
        const loadedCustomStudioSettings = serverData?.customStudioSettings || await idbGet<CustomStudioSettings>('customStudioSettings');
        if (loadedCustomStudioSettings && isMounted) {
          setCustomStudioSettings(loadedCustomStudioSettings);
          try {
            localStorage.setItem('golf_wardrobe_customStudioSettings', JSON.stringify(loadedCustomStudioSettings));
          } catch (e) {}
          idbSet('customStudioSettings', loadedCustomStudioSettings);
        }

        // Homepage Config
        const loadedHomepageConfig = serverData?.homepageConfig || await idbGet<HomepageConfig>('homepage');
        if (loadedHomepageConfig && isMounted) {
          setHomepageConfig(loadedHomepageConfig);
          try {
            localStorage.setItem('golf_wardrobe_homepage', JSON.stringify(loadedHomepageConfig));
          } catch (e) {}
          idbSet('homepage', loadedHomepageConfig);
        }

        // Sale Promo Config
        const loadedSalePromoConfig = serverData?.salePromoConfig || await idbGet<SalePromoConfig>('salePromoConfig');
        if (loadedSalePromoConfig && isMounted) {
          setSalePromoConfig(loadedSalePromoConfig);
          try {
            localStorage.setItem('golf_wardrobe_salePromoConfig', JSON.stringify(loadedSalePromoConfig));
          } catch (e) {}
          idbSet('salePromoConfig', loadedSalePromoConfig);
        }

        // AI Settings
        const loadedAiSettings = serverData?.aiSettings || await idbGet<AISettingsConfig>('aiSettings');
        if (loadedAiSettings && isMounted) {
          setAiSettings(loadedAiSettings);
          try {
            localStorage.setItem('golf_wardrobe_aiSettings', JSON.stringify(loadedAiSettings));
          } catch (e) {}
          idbSet('aiSettings', loadedAiSettings);
        }

        // Personal session data from IndexedDB
        const savedOrders = await idbGet<Order[]>('orders');
        if (savedOrders && Array.isArray(savedOrders) && isMounted) {
          setOrders(savedOrders);
        }
        const savedCustomOrders = await idbGet<CustomHeadcoverConfig[]>('customOrders');
        if (savedCustomOrders && Array.isArray(savedCustomOrders) && isMounted) {
          setCustomOrders(savedCustomOrders);
        }
        const savedCustomers = await idbGet<CustomerUser[]>('customers');
        if (savedCustomers && Array.isArray(savedCustomers) && isMounted) {
          setCustomers(savedCustomers);
        }
      } catch (err) {
        console.error("Mount rehydration error:", err);
      } finally {
        if (isMounted) {
          isRehydrated.current = true;
        }
      }
    }
    loadIndexedDB();
    return () => { isMounted = false; };
  }, []);

  // Listen for real-time cross-tab updates (BroadcastChannel & localStorage events)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('golf_wardrobe_sync');
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'STORE_UPDATE') {
            const { key, value } = event.data;
            if (key === 'products' && Array.isArray(value)) setProducts(value);
            if (key === 'categories' && Array.isArray(value)) setCategories(value);
            if (key === 'orders' && Array.isArray(value)) setOrders(value);
            if (key === 'customOrders' && Array.isArray(value)) setCustomOrders(value);
            if (key === 'homepage' && value) setHomepageConfig(value);
            if (key === 'salePromoConfig' && value) setSalePromoConfig(value);
            if (key === 'storeSettings' && value) setStoreSettings(value);
            if (key === 'customStudioSettings' && value) setCustomStudioSettings(value);
          }
        };
      }
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        const val = JSON.parse(e.newValue);
        if (e.key === 'golf_wardrobe_products' && Array.isArray(val)) setProducts(val);
        if (e.key === 'golf_wardrobe_categories' && Array.isArray(val)) setCategories(val);
        if (e.key === 'golf_wardrobe_orders' && Array.isArray(val)) setOrders(val);
        if (e.key === 'golf_wardrobe_homepage') setHomepageConfig(val);
        if (e.key === 'golf_wardrobe_storeSettings') setStoreSettings(val);
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);

  // UI Drawer & Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<{ id: string; name: string; email: string; isAdmin: boolean } | null>(() => getStored('user', null));

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to localStorage & IndexedDB ONLY after initial rehydration completes
  useEffect(() => { if (isRehydrated.current) setStored('products', products); }, [products]);
  useEffect(() => { if (isRehydrated.current) setStored('categories', categories); }, [categories]);
  useEffect(() => { if (isRehydrated.current) setStored('cart', cart); }, [cart]);
  useEffect(() => { if (isRehydrated.current) setStored('wishlist', wishlist); }, [wishlist]);
  useEffect(() => { if (isRehydrated.current) setStored('orders', orders); }, [orders]);
  useEffect(() => { if (isRehydrated.current) setStored('customOrders', customOrders); }, [customOrders]);
  useEffect(() => { if (isRehydrated.current) setStored('customers', customers); }, [customers]);
  useEffect(() => { if (isRehydrated.current) setStored('homepage', homepageConfig); }, [homepageConfig]);
  useEffect(() => { if (isRehydrated.current) setStored('salePromoConfig', salePromoConfig); }, [salePromoConfig]);
  useEffect(() => { if (isRehydrated.current) setStored('aiSettings', aiSettings); }, [aiSettings]);
  useEffect(() => { if (isRehydrated.current) setStored('storeSettings', storeSettings); }, [storeSettings]);
  useEffect(() => { if (isRehydrated.current) setStored('customStudioSettings', customStudioSettings); }, [customStudioSettings]);
  useEffect(() => { if (isRehydrated.current) setStored('user', user); }, [user]);


  // Toast Function
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Navigation Handler
  const navigateTo = (view: string, params?: { category?: ProductCategory | 'All'; productId?: string; adminTab?: string }) => {
    soundManager.playClick();
    setCurrentView(view);
    if (params?.category !== undefined) {
      setSelectedCategory(params.category);
    }
    if (params?.productId !== undefined) {
      setSelectedProductId(params.productId);
    }
    if (params?.adminTab !== undefined) {
      setAdminTab(params.adminTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const addToCart = (product: Product, quantity = 1, clubFit?: ClubFit) => {
    soundManager.playCartAdd();
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedClubFit: clubFit || product.clubFit }];
    });
    triggerToast(`✨ Added "${product.name}" to your cart!`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    soundManager.playClick();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    triggerToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    soundManager.playClick();
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    soundManager.playClick();
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
  };

  const applyCoupon = (code: string): boolean => {
    soundManager.playClick();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'GOLF10' || cleanCode === 'WELCOME10') {
      setAppliedCoupon(cleanCode);
      setCouponDiscountPercent(10);
      triggerToast('10% Discount Applied!', 'success');
      return true;
    }
    if (cleanCode === 'LUXURY20' || cleanCode === 'GOLF20') {
      setAppliedCoupon(cleanCode);
      setCouponDiscountPercent(20);
      triggerToast('20% Luxury Discount Applied!', 'success');
      return true;
    }
    triggerToast('Invalid promotional coupon code', 'error');
    return false;
  };

  const removeCoupon = () => {
    soundManager.playClick();
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    triggerToast('Coupon code removed', 'info');
  };

  // Wishlist Functions
  const toggleWishlist = (productId: string) => {
    soundManager.playWishlist();
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        triggerToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast('Saved to Wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Modals & Drawers
  const openCart = () => {
    soundManager.playClick();
    setIsCartOpen(true);
  };
  const closeCart = () => {
    soundManager.playClick();
    setIsCartOpen(false);
  };
  const openWishlist = () => {
    soundManager.playClick();
    setIsWishlistOpen(true);
  };
  const closeWishlist = () => {
    soundManager.playClick();
    setIsWishlistOpen(false);
  };
  const openSearch = () => {
    soundManager.playClick();
    setIsSearchOpen(true);
  };
  const closeSearch = () => {
    soundManager.playClick();
    setIsSearchOpen(false);
  };

  const openQuickView = (productId: string) => {
    soundManager.playClick();
    setQuickViewProductId(productId);
    setIsQuickViewOpen(true);
  };
  const closeQuickView = () => {
    soundManager.playClick();
    setIsQuickViewOpen(false);
    setQuickViewProductId(null);
  };

  // Admin Product Actions
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      rating: 5.0,
      reviewsCount: 0,
      reviews: []
    };
    saveProductToSupabase(newProduct).then((res) => {
      if (res && res.success) {
        triggerToast(`Saved "${newProduct.name}" to Supabase database!`, 'success');
      } else if (res && !res.success) {
        console.warn('Supabase add product error:', res.error);
        triggerToast(`Supabase Sync Warning: ${res.error || 'Failed to save to database'}`, 'error');
      }
    });
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      setStored('products', next);
      return next;
    });
    triggerToast(`Product "${newProduct.name}" created`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>, showToast = true) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const updatedProduct = next.find((p) => p.id === id);
      if (updatedProduct) {
        saveProductToSupabase(updatedProduct).then((res) => {
          if (res && res.success) {
            console.log('Product update written to Supabase:', id);
          } else if (res && !res.success) {
            console.warn('Supabase update product error:', res.error);
            triggerToast(`Supabase Update Warning: ${res.error || 'Failed to update DB'}`, 'error');
          }
        });
      }
      setStored('products', next);
      return next;
    });
    if (showToast) {
      triggerToast('Product details updated', 'success');
    }
  };

  const deleteProduct = (id: string) => {
    deleteProductFromSupabase(id).then((success) => {
      if (!success) {
        console.warn('Failed to delete product from Supabase:', id);
      }
    });
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setStored('products', next);
      return next;
    });
    triggerToast('Product deleted', 'info');
  };

  // Category Actions
  const addCategory = (catData: Omit<CategoryInfo, 'id'>) => {
    const newCat: CategoryInfo = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories((prev) => {
      const next = [...prev, newCat];
      setStored('categories', next);
      return next;
    });
    triggerToast(`Category "${newCat.name}" added`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<CategoryInfo>) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setStored('categories', next);
      return next;
    });
    triggerToast('Category updated', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setStored('categories', next);
      return next;
    });
    triggerToast('Category removed', 'info');
  };

  const reorderCategories = (newOrder: CategoryInfo[]) => {
    setCategories(newOrder);
    setStored('categories', newOrder);
    triggerToast('Category order updated', 'success');
  };

  // Orders Actions
  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) => {
    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const updates: Partial<Order> = { status };
          if (trackingNumber) updates.trackingNumber = trackingNumber;
          if (carrier) updates.carrier = carrier;
          if (status === 'Shipped' && !ord.shippedAt) updates.shippedAt = new Date().toISOString();
          if (status === 'Delivered' && !ord.deliveredAt) updates.deliveredAt = new Date().toISOString();
          return { ...ord, ...updates };
        }
        return ord;
      });
      setStored('orders', next);
      return next;
    });
    triggerToast(`Order status set to ${status}`, 'success');
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const next = prev.map((ord) => (ord.id === orderId || ord.orderNumber === orderId ? { ...ord, ...updates } : ord));
      setStored('orders', next);
      return next;
    });
    triggerToast('Order details saved', 'success');
  };

  const generateOrderLabel = (
    orderId: string,
    carrier: 'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx' = 'An Post',
    weightKg?: number
  ): ShippingLabelData => {
    const targetOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!targetOrder) throw new Error('Order not found');

    const labelData = createShippingLabelData(targetOrder, carrier, weightKg);
    
    // Update order with label, tracking number, carrier and set status to 'Packed' if 'Pending'
    let updatedOrders: Order[] = [];
    setOrders((prev) => {
      updatedOrders = prev.map((ord) => {
        if (ord.id === targetOrder.id) {
          return {
            ...ord,
            trackingNumber: labelData.trackingNumber,
            carrier: labelData.carrier,
            shippingLabel: labelData,
            status: ord.status === 'Pending' ? 'Packed' : ord.status
          };
        }
        return ord;
      });
      setStored('orders', updatedOrders);
      return updatedOrders;
    });

    triggerToast(`Created ${carrier} Shipping Label with tracking ${labelData.trackingNumber}`, 'success');
    return labelData;
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((ord) => ord.id !== orderId);
      setStored('orders', next);
      return next;
    });
    triggerToast(`Order deleted permanently`, 'info');
  };

  const updateCustomOrderStatus = (customId: string, status: CustomHeadcoverConfig['status']) => {
    setCustomOrders((prev) => {
      const next = prev.map((c) => (c.id === customId ? { ...c, status } : c));
      setStored('customOrders', next);
      return next;
    });
    triggerToast(`Custom order #${customId} status set to ${status}`, 'success');
  };

  const deleteCustomOrder = (customId: string) => {
    setCustomOrders((prev) => {
      const next = prev.filter((c) => c.id !== customId);
      setStored('customOrders', next);
      return next;
    });
    triggerToast(`Custom headcover order deleted permanently`, 'info');
  };

  const placeOrder = (customerDetails: CustomerDetails, paymentMethod: string, shippingFeeOverride?: number): Order => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const headcoverDiscount = calculateHeadcoverDiscount(cart);
    const headcoversSubtotal = subtotal - headcoverDiscount;
    const couponDiscountAmount = (headcoversSubtotal * couponDiscountPercent) / 100;
    const discountedSubtotal = headcoversSubtotal - couponDiscountAmount;
    const totalDiscount = headcoverDiscount + couponDiscountAmount;
    
    // Use dynamic shipping fee calculation based on headcovers matrix & country, or override if provided at checkout
    const shippingFee = shippingFeeOverride !== undefined
      ? shippingFeeOverride
      : calculateShippingFee(
          cart,
          customerDetails.country,
          discountedSubtotal,
          storeSettings.shippingSettings
        );
    const total = discountedSubtotal + shippingFee;

    const orderNum = `GW-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      customer: customerDetails,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        clubFit: item.selectedClubFit || item.product.clubFit,
        customConfig: item.customConfig
      })),
      subtotal,
      discount: totalDiscount,
      couponCode: appliedCoupon || undefined,
      shippingFee,
      total,
      status: 'Pending',
      paymentStatus: 'Paid',
      carrier: 'An Post',
      paymentMethod
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update or add customer record
    setCustomers((prev) => {
      const existing = prev.find((c) => c.email.toLowerCase() === customerDetails.email.toLowerCase());
      if (existing) {
        return prev.map((c) =>
          c.email.toLowerCase() === customerDetails.email.toLowerCase()
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + total,
                savedAddresses: [customerDetails, ...c.savedAddresses.filter((a) => a.address !== customerDetails.address)]
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: `cust-${Date.now()}`,
            email: customerDetails.email,
            name: `${customerDetails.firstName} ${customerDetails.lastName}`,
            joinedDate: new Date().toISOString().split('T')[0],
            totalOrders: 1,
            totalSpent: total,
            savedAddresses: [customerDetails]
          }
        ];
      }
    });

    clearCart();
    triggerToast(`Order #${orderNum} successfully placed!`, 'success');
    return newOrder;
  };

  // Config Actions
  const updateHomepageConfig = (updates: Partial<HomepageConfig>) => {
    setHomepageConfig((prev) => {
      const next = { ...prev, ...updates };
      setStored('homepage', next);
      return next;
    });
    triggerToast('Homepage configuration updated', 'success');
  };

  const updateSalePromoConfig = (updates: Partial<SalePromoConfig>) => {
    setSalePromoConfig((prev) => {
      const next = { ...prev, ...updates };
      setStored('salePromoConfig', next);
      return next;
    });
    triggerToast('Sale & Promotional banner updated', 'success');
  };

  const updateAISettings = (updates: Partial<AISettingsConfig>) => {
    setAiSettings((prev) => {
      const next = { ...prev, ...updates };
      setStored('aiSettings', next);
      return next;
    });
    triggerToast('AI Assistant settings updated', 'success');
  };

  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.standardShippingRate !== undefined && next.shippingSettings) {
        const rate = updates.standardShippingRate;
        next.shippingSettings = {
          ...next.shippingSettings,
          flatRate: rate,
          matrix: {
            ...next.shippingSettings.matrix,
            ireland: [rate, rate, rate, rate]
          }
        };
      }
      setStored('storeSettings', next);
      return next;
    });
    triggerToast('Store settings updated', 'success');
  };

  const updateCustomStudioSettings = (updates: Partial<CustomStudioSettings>) => {
    setCustomStudioSettings((prev) => {
      const next = { ...prev, ...updates };
      setStored('customStudioSettings', next);
      return next;
    });
    triggerToast('Custom studio settings updated', 'success');
  };

  // Auth Functions
  const login = (email: string, password = '', isAdmin = false): boolean => {
    if (isAdmin || email.toLowerCase().includes('admin')) {
      setUser({ id: 'admin-1', name: 'Executive Admin', email: 'admin@golfwardrobe.com', isAdmin: true });
      triggerToast('Logged in as Executive Admin', 'success');
      return true;
    } else {
      setUser({ id: `user-${Date.now()}`, name: email.split('@')[0], email, isAdmin: false });
      triggerToast(`Welcome back, ${email.split('@')[0]}`, 'success');
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    triggerToast('Logged out of session', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        selectedCategory,
        selectedProductId,
        adminTab,
        navigateTo,
        products,
        categories,
        cart,
        wishlist,
        orders,
        customOrders,
        customers,
        homepageConfig,
        salePromoConfig,
        aiSettings,
        storeSettings,
        customStudioSettings,
        appliedCoupon,
        couponDiscountPercent,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        isWishlistOpen,
        isSearchOpen,
        isQuickViewOpen,
        quickViewProductId,
        openCart,
        closeCart,
        openWishlist,
        closeWishlist,
        openSearch,
        closeSearch,
        openQuickView,
        closeQuickView,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        updateOrderStatus,
        updateOrderDetails,
        generateOrderLabel,
        deleteOrder,
        updateCustomOrderStatus,
        deleteCustomOrder,
        placeOrder,
        updateHomepageConfig,
        updateSalePromoConfig,
        updateAISettings,
        updateStoreSettings,
        updateCustomStudioSettings,
        user,
        login,
        logout,
        toasts,
        triggerToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
