import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ClubFit, SaleSlide, CustomHeadcoverType, Order, OrderStatus, ShippingSettings } from '../types';
import { INITIAL_CUSTOM_STUDIO_SETTINGS } from '../data/initialData';
import { ImagePickerModal } from '../components/ImagePickerModal';
import { ShippingLabelModal } from '../components/ShippingLabelModal';
import { PackingSlipModal } from '../components/PackingSlipModal';
import { ShippingNotificationModal } from '../components/ShippingNotificationModal';
import { exportOrdersToCSV, DEFAULT_SHIPPING_SETTINGS } from '../utils/shipping';
import { compressImageFile, compressDataUrl } from '../utils/imageCompressor';
import { isStudioEnvironment, isAdminUnlocked, unlockAdminWithPin, exportStoreDataBackup } from '../utils/envHelper';
import { 
  ShieldAlert, Package, ShoppingBag, Plus, Edit, Trash2, 
  Eye, EyeOff, Save, Check, RefreshCw, BarChart3, Settings, Crown, Lock,
  Tag, Sparkles, CreditCard, DollarSign, Layers, CheckCircle2, Image as ImageIcon, Wand2, FileText, Download, AlertCircle, Camera,
  Palette, Type as FontIcon, Truck, Printer, Mail, Globe, Search, FileSpreadsheet, Filter, Clock, MapPin, User, ExternalLink, ShieldCheck
} from 'lucide-react';
import { CustomHeadcoverPreview } from '../components/CustomHeadcoverPreview';

interface VisualGalleryManagerProps {
  title?: string;
  images: string[];
  onAddFromCameraRoll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPhotoPicker: () => void;
  onRemoveImage: (index: number) => void;
}

const VisualGalleryManager: React.FC<VisualGalleryManagerProps> = ({
  title = "Multiple Gallery Pictures",
  images,
  onAddFromCameraRoll,
  onOpenPhotoPicker,
  onRemoveImage
}) => {
  return (
    <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="block font-semibold text-gray-800 text-xs">{title} ({images.length})</span>
          <span className="text-[10px] text-gray-500">Real picture previews shown to customers. Click trash icon to delete any picture.</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="bg-[#3B1C59] hover:bg-[#2A1341] text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs transition-colors">
            <Camera className="w-3 h-3 text-[#C9A24D]" /> Camera Roll
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAddFromCameraRoll}
            />
          </label>
          <button
            type="button"
            onClick={onOpenPhotoPicker}
            className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
          >
            <ImageIcon className="w-3 h-3" /> Photo Library
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="p-5 text-center border-2 border-dashed border-[#E5DEC9] rounded-xl bg-white text-gray-400 text-xs space-y-1">
          <ImageIcon className="w-6 h-6 mx-auto opacity-40 text-[#3B1C59]" />
          <p className="font-semibold text-gray-600">No extra gallery photos added</p>
          <p className="text-[10px]">Click above to add photos from your camera roll or photo library</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {images.map((imgUrl, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E5DEC9] bg-black/5 shadow-xs">
              <img
                src={imgUrl}
                alt={`Gallery photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                title="Delete this picture"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminPage: React.FC = () => {
  const {
    products,
    orders,
    customOrders,
    homepageConfig,
    salePromoConfig,
    storeSettings,
    customStudioSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    deleteOrder,
    updateCustomOrderStatus,
    deleteCustomOrder,
    refreshOrdersFromSupabase,
    updateHomepageConfig,
    updateSalePromoConfig,
    updateStoreSettings,
    updateCustomStudioSettings,
    triggerToast
  } = useStore();

  const isStudio = isStudioEnvironment();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isAdminUnlocked());
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockAdminWithPin(inputPin)) {
      setIsUnlocked(true);
      setPinError(false);
      triggerToast('Admin Portal Unlocked', 'success');
    } else {
      setPinError(true);
      triggerToast('Incorrect Master PIN. Default is 4242', 'error');
    }
  };

  const handleDirectFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        triggerToast('Please select a valid image file', 'error');
        return;
      }
      try {
        const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
        callback(compressedDataUrl);
        triggerToast('Photo loaded & optimized!', 'success');
      } catch (err) {
        triggerToast('Failed to process uploaded image', 'error');
      }
    }
  };

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'custom' | 'customStudio' | 'shippingRates' | 'sales' | 'homepage' | 'paypal'>('orders');

  useEffect(() => {
    if (activeTab === 'orders' && isUnlocked) {
      refreshOrdersFromSupabase();
    }
  }, [activeTab, isUnlocked]);

  // Shipping & Orders Management Modal States
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);
  const [selectedOrderForNotify, setSelectedOrderForNotify] = useState<Order | null>(null);

  // Search & Filter for Orders
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');

  // Shipping Rates Settings Form Local State
  const [shippingConfig, setShippingConfig] = useState<ShippingSettings>(
    storeSettings.shippingSettings || DEFAULT_SHIPPING_SETTINGS
  );

  // Custom Studio Admin Form Local State
  const [csTitle, setCsTitle] = useState(customStudioSettings?.studioTitle || 'Custom Headcover Design Studio');
  const [csSubheading, setCsSubheading] = useState(customStudioSettings?.studioSubheading || 'Craft your personalized, tour-grade leather golf headcovers.');
  const [csPrices, setCsPrices] = useState(customStudioSettings?.typePrices || INITIAL_CUSTOM_STUDIO_SETTINGS.typePrices);
  const [csColors, setCsColors] = useState(customStudioSettings?.availableColors || INITIAL_CUSTOM_STUDIO_SETTINGS.availableColors);
  const [csFonts, setCsFonts] = useState(customStudioSettings?.availableFonts || INITIAL_CUSTOM_STUDIO_SETTINGS.availableFonts);
  
  // States for adding new color & font
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2563EB');
  const [newFontName, setNewFontName] = useState('');

  // Admin Live Preview Tester State
  const [testHeadcoverType, setTestHeadcoverType] = useState<CustomHeadcoverType>('Driver Headcover');
  const [testMainColor, setTestMainColor] = useState('#FFFFFF');
  const [testText, setTestText] = useState('GW 1');
  const [testFont, setTestFont] = useState('Serif Classic');

  // Order Deletion Confirmation State
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; numberOrName: string; type: 'live' | 'custom' } | null>(null);

  // New Product Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('Leather');
  const [newProdClubFit, setNewProdClubFit] = useState<ClubFit>('Driver');
  const [newProdAllowedFits, setNewProdAllowedFits] = useState<ClubFit[]>(['Driver', '3 Wood', '5 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter']);
  const [newProdPrice, setNewProdPrice] = useState(54.99);
  const [newProdOrigPrice, setNewProdOrigPrice] = useState<number | undefined>(undefined);
  const [newProdMaterial, setNewProdMaterial] = useState('Full-Grain Italian Saddle Leather');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800');
  const [newProdGalleryImages, setNewProdGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800'
  ]);
  const [newProdDesc, setNewProdDesc] = useState('Handcrafted luxury golf headcover built for links rounds.');
  const [newProdLeather, setNewProdLeather] = useState(true);
  const [newProdWaterproof, setNewProdWaterproof] = useState(true);

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>([]);

  // Homepage Config Form state
  const [hpAnnounce, setHpAnnounce] = useState(homepageConfig.announcementText);
  const [hpTitle, setHpTitle] = useState(homepageConfig.heroTitle);
  const [hpSubheading, setHpSubheading] = useState(homepageConfig.heroSubheading);
  const [hpHeroImg, setHpHeroImg] = useState(homepageConfig.heroImageUrl);

  // Sale Slides Modal state
  const [isAddSlideModalOpen, setIsAddSlideModalOpen] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImg, setNewSlideImg] = useState('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200');
  const [newSlideBadge, setNewSlideBadge] = useState('LIMITED SALE');
  const [newSlideDiscount, setNewSlideDiscount] = useState('25% OFF');
  const [newSlideCategory, setNewSlideCategory] = useState<ProductCategory>('Leather');

  // PayPal Form state
  const [paypalEmail, setPaypalEmail] = useState(storeSettings.paypalEmail || 'payments@thegolfwardrobe.com');
  const [paypalClientId, setPaypalClientId] = useState(storeSettings.paypalClientId || '');
  const [paypalEnabled, setPaypalEnabled] = useState(storeSettings.paypalEnabled ?? true);

  // Bulk Sale Applier state
  const [bulkCategory, setBulkCategory] = useState<ProductCategory | 'All'>('All');
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState(15);

  // Image Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    'newMain' | 'newGallery' | 'editMain' | 'editGallery' | 'newSlide' | 'heroBg' | null
  >(null);
  const [pickerCurrentImage, setPickerCurrentImage] = useState('');

  const ALL_CLUB_FITS: ClubFit[] = ['Driver', '3 Wood', '5 Wood', 'Hybrid', 'Blade Putter', 'Mallet Putter'];

  const openPhotoPicker = (
    target: 'newMain' | 'newGallery' | 'editMain' | 'editGallery' | 'newSlide' | 'heroBg',
    currentVal: string
  ) => {
    setPickerTarget(target);
    setPickerCurrentImage(currentVal);
    setIsPickerOpen(true);
  };

  const handleSelectPickedImage = (selectedUrl: string) => {
    if (pickerTarget === 'newMain') {
      setNewProdImage(selectedUrl);
    } else if (pickerTarget === 'newGallery') {
      setNewProdGalleryImages((prev) => [...prev, selectedUrl]);
    } else if (pickerTarget === 'editMain' && editingProduct) {
      setEditingProduct({ ...editingProduct, image: selectedUrl });
    } else if (pickerTarget === 'editGallery') {
      setEditGalleryImages((prev) => [...prev, selectedUrl]);
    } else if (pickerTarget === 'newSlide') {
      setNewSlideImg(selectedUrl);
    } else if (pickerTarget === 'heroBg') {
      setHpHeroImg(selectedUrl);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const compressedImage = await compressDataUrl(newProdImage);
    const compressedGallery = await Promise.all(
      newProdGalleryImages.map((img) => compressDataUrl(img))
    );

    const created = addProduct({
      name: newProdName,
      category: newProdCategory,
      clubFit: newProdClubFit,
      allowedClubFits: newProdAllowedFits.length > 0 ? newProdAllowedFits : ALL_CLUB_FITS,
      price: Number(newProdPrice),
      originalPrice: newProdOrigPrice ? Number(newProdOrigPrice) : undefined,
      material: newProdMaterial,
      image: compressedImage,
      gallery: compressedGallery.length > 0 ? compressedGallery : [compressedImage],
      description: newProdDesc,
      featured: true,
      rating: 5.0,
      reviewsCount: 1,
      isGenuineLeather: newProdLeather,
      isWaterproof: newProdWaterproof,
      stock: 25,
      tags: [newProdCategory, newProdClubFit, 'New Release'],
      reviews: []
    });

    setIsAddModalOpen(false);
    triggerToast(`Created new product: "${created.name}" - Saved permanently & published live!`, 'success');
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
    setEditGalleryImages(p.gallery && p.gallery.length > 0 ? [...p.gallery] : [p.image]);
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;

    const compressedImage = await compressDataUrl(editingProduct.image);
    const compressedGallery = await Promise.all(
      editGalleryImages.map((img) => compressDataUrl(img))
    );

    updateProduct(editingProduct.id, {
      ...editingProduct,
      image: compressedImage,
      gallery: compressedGallery.length > 0 ? compressedGallery : [compressedImage]
    });

    setEditingProduct(null);
    triggerToast(`Saved all changes for "${editingProduct.name}" - Updated live for all visitors!`, 'success');
  };

  const handleSaveHomepageConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageConfig({
      announcementText: hpAnnounce,
      heroTitle: hpTitle,
      heroSubheading: hpSubheading,
      heroImageUrl: hpHeroImg
    });
    triggerToast('Homepage hero content updated live!', 'success');
  };

  const handleSavePaypalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      paypalEmail,
      paypalClientId,
      paypalEnabled
    });
    triggerToast('PayPal & Payment Gateway credentials updated!', 'success');
  };

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle) return;

    const newSlide: SaleSlide = {
      id: `slide-${Date.now()}`,
      title: newSlideTitle,
      subtitle: newSlideSubtitle,
      imageUrl: newSlideImg,
      badgeText: newSlideBadge,
      discountText: newSlideDiscount,
      linkCategory: newSlideCategory,
      buttonText: `Shop ${newSlideCategory} Sale`
    };

    updateSalePromoConfig({
      slides: [...(salePromoConfig?.slides || []), newSlide]
    });

    setIsAddSlideModalOpen(false);
    setNewSlideTitle('');
    setNewSlideSubtitle('');
    triggerToast('New promotional sale banner added!', 'success');
  };

  const handleDeleteSlide = (slideId: string) => {
    const updated = (salePromoConfig?.slides || []).filter((s) => s.id !== slideId);
    updateSalePromoConfig({ slides: updated });
    triggerToast('Promotional slide removed.', 'info');
  };

  const handleApplyBulkDiscount = () => {
    let count = 0;
    products.forEach((p) => {
      if (bulkCategory === 'All' || p.category === bulkCategory) {
        const orig = p.originalPrice || p.price;
        const discounted = Number((orig * (1 - bulkDiscountPercent / 100)).toFixed(2));
        updateProduct(p.id, {
          originalPrice: orig,
          price: discounted
        });
        count++;
      }
    });
    triggerToast(`Applied ${bulkDiscountPercent}% sale discount to ${count} products!`, 'success');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E5DEC9] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#0D382C] text-[#C9A24D] rounded-full flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Admin Access Restricted</h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Enter your Master Admin PIN to view store inventory, orders, shipping rates, and PayPal configuration.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                placeholder="Enter PIN (Default: 4242)"
                value={inputPin}
                onChange={(e) => {
                  setInputPin(e.target.value);
                  setPinError(false);
                }}
                className={`w-full text-center tracking-[0.4em] font-mono text-base py-3 rounded-2xl border ${
                  pinError ? 'border-red-500 bg-red-50 text-red-900' : 'border-[#E5DEC9] bg-[#FAF8F5]'
                } focus:outline-none focus:border-[#C9A24D]`}
              />
              {pinError && <p className="text-[11px] text-red-600 font-bold mt-1.5">Incorrect PIN code. Default is 4242</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Unlock Admin Portal
            </button>
          </form>

          <p className="text-[10px] text-gray-400 italic">
            Note: On Vercel deployments, the Admin button is automatically hidden from public visitors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
      
      {/* Studio Environment Exclusive Notification Banner */}
      {isStudio && (
        <div className="bg-[#0D382C] text-white px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm border border-[#C9A24D]/30">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-[#C9A24D]">AI Studio Developer Mode:</span>
            <span className="text-gray-200">Admin tab is strictly visible to you in Studio. On Vercel & hosted deployments, the Admin button is automatically hidden from public customers.</span>
          </div>
          <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg font-mono shrink-0">
            Vercel Ready
          </span>
        </div>
      )}

      {/* Photo Library Picker Modal */}
      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectImage={handleSelectPickedImage}
        currentImage={pickerCurrentImage}
        title="Select Photo from Library"
      />

      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 sm:p-10 border border-[#C9A24D]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A24D] text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">Admin Portal</h1>
              <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                LIVE STORE SYSTEM
              </span>
            </div>
            <p className="text-xs text-gray-400">Manage headcover inventory, photo library pictures, sale promotions, and PayPal payment details.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Headcover
        </button>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</p>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">{storeSettings.currencySymbol}{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Orders</p>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">{orders.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Inventory</p>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">{products.length} Products</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E5DEC9] shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">PayPal Gateway</p>
          <p className="font-serif text-base font-bold text-[#C9A24D] mt-1 truncate">{storeSettings.paypalEmail}</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-[#E5DEC9] gap-4 sm:gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'products' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'orders' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" /> Live Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('shippingRates')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'shippingRates' ? 'text-emerald-700 border-b-2 border-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-600" /> Shipping Rates & Rules
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'custom' ? 'text-[#3B1C59] border-b-2 border-[#3B1C59] font-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wand2 className="w-4 h-4 text-[#3B1C59]" /> Custom Orders ({customOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('customStudio')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'customStudio' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D] font-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4 text-[#C9A24D]" /> Custom Studio Config
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'sales' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4" /> Sales & Promotions ({salePromoConfig?.slides?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('paypal')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'paypal' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" /> PayPal Settings
        </button>
        <button
          onClick={() => setActiveTab('homepage')}
          className={`pb-3 flex items-center gap-2 transition-colors relative shrink-0 ${
            activeTab === 'homepage' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Homepage
        </button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs space-y-4">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#E5DEC9] flex justify-between items-center text-xs">
            <span className="font-serif font-bold text-gray-800">Inventory Catalog</span>
            <span className="text-gray-500">Click <Edit className="w-3.5 h-3.5 inline mx-1 text-[#C9A24D]" /> to customize picture, category, description, price, and photo library choices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#FAF8F5] border-b border-[#E5DEC9] font-serif uppercase tracking-wider text-gray-500 text-[11px]">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Main Fit</th>
                  <th className="p-4">Club Options</th>
                  <th className="p-4">Price / Sale</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E8]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9] shrink-0" />
                      <div className="flex-1 min-w-[200px] space-y-1">
                        <div className="relative group flex items-center gap-1.5">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updateProduct(p.id, { name: e.target.value }, false)}
                            className="font-serif font-bold text-[#1A1A1A] text-sm bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E5DEC9] focus:border-[#C9A24D] rounded-lg px-2 py-1 transition-all w-full focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/20"
                            title="Click to rename this product"
                          />
                          <Edit className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C9A24D] shrink-0 pointer-events-none transition-colors" />
                        </div>
                        <p className="text-[10px] text-gray-400 pl-2">{(p.gallery || []).length} gallery images • Direct edit title</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">{p.category}</td>
                    <td className="p-4 text-gray-600">{p.clubFit}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(p.allowedClubFits && p.allowedClubFits.length > 0 ? p.allowedClubFits : ALL_CLUB_FITS).map((fit) => (
                          <span key={fit} className="bg-[#F5F1E8] text-[9px] font-bold text-gray-700 px-1.5 py-0.5 rounded">
                            {fit}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-serif font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-1 group relative">
                        <span className="text-[#8C827A] text-xs font-normal">{storeSettings.currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={p.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateProduct(p.id, { price: isNaN(val) ? 0 : val }, false);
                          }}
                          className="w-24 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-[#E5DEC9] focus:border-[#C9A24D] rounded-lg px-2 py-1 text-sm font-serif font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C9A24D]/20 transition-all"
                          title="Click to edit price directly"
                        />
                        <Edit className="w-3 h-3 text-gray-300 group-hover:text-[#C9A24D] shrink-0 pointer-events-none transition-colors" />
                      </div>
                      {p.originalPrice && (
                        <span className="block text-[10px] text-red-500 line-through mt-0.5 pl-3">
                          {storeSettings.currencySymbol}{p.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={p.stock}
                        onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) }, false)}
                        className="w-16 bg-[#FAF8F5] border border-[#E5DEC9] rounded-lg px-2 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => updateProduct(p.id, { hidden: !p.hidden })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          p.hidden ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {p.hidden ? 'Hidden' : 'Visible'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-2 text-gray-600 hover:text-[#C9A24D] rounded-lg hover:bg-[#FAF8F5]"
                          title="Edit Product & Photos"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete ${p.name}?`)) {
                              await deleteProduct(p.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIVE ORDERS & SHIPPING MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Top Control Bar: Search, Status Filters, Export CSV */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C9A24D]" /> Order & Dispatch Management
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Every paid order automatically appears here. Generate shipping labels, print packing slips, and dispatch notifications.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await refreshOrdersFromSupabase();
                    triggerToast('Live orders refreshed from Supabase', 'info');
                  }}
                  className="bg-[#1A1A1A] hover:bg-[#C9A24D] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#C9A24D]" /> Sync Orders
                </button>
                <button
                  type="button"
                  onClick={() => exportOrdersToCSV(orders)}
                  className="bg-[#0D382C] hover:bg-[#1A1A1A] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#C9A24D]" /> Export CSV
                </button>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#F5F1E8]">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, order #, city, country..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              <div className="sm:col-span-7 flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
                {(['All', 'Pending', 'Packed', 'Shipped', 'Delivered'] as const).map((st) => {
                  const count = st === 'All' ? orders.length : orders.filter(o => o.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#1A1A1A] text-[#C9A24D] shadow-xs'
                          : 'bg-[#FAF8F5] text-gray-600 hover:bg-gray-200 border border-[#E5DEC9]'
                      }`}
                    >
                      {st} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          {(() => {
            const filteredOrders = orders.filter((o) => {
              const matchesFilter = orderStatusFilter === 'All' || o.status === orderStatusFilter;
              const term = orderSearchTerm.trim().toLowerCase();
              if (!term) return matchesFilter;

              const customerName = `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase();
              const matchSearch =
                o.orderNumber.toLowerCase().includes(term) ||
                o.customer.email.toLowerCase().includes(term) ||
                customerName.includes(term) ||
                o.customer.city.toLowerCase().includes(term) ||
                o.customer.country.toLowerCase().includes(term) ||
                (o.trackingNumber && o.trackingNumber.toLowerCase().includes(term));

              return matchesFilter && matchSearch;
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 border border-[#E5DEC9] text-center text-gray-500 space-y-3">
                  <Package className="w-10 h-10 text-[#C9A24D] mx-auto opacity-40" />
                  <p className="font-serif font-bold text-lg text-[#1A1A1A]">No Matching Orders Found</p>
                  <p className="text-xs">Try adjusting your status filter or search query.</p>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {filteredOrders.map((ord) => {
                  const totalQty = ord.items.reduce((s, i) => s + i.quantity, 0);
                  const isNonEU = ord.customer.country.toLowerCase() !== 'ireland' && !ord.customer.country.toLowerCase().includes('ireland');

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl border-2 border-[#E5DEC9] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-6"
                    >
                      {/* ORDER TOP HEADER BAR */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F5F1E8]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-xl text-[#1A1A1A]">{ord.orderNumber}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-300">
                              {ord.paymentStatus || 'Paid'}
                            </span>
                            {isNonEU && (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-amber-600" /> Customs Info
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Placed on {ord.date} • {totalQty} Headcover{totalQty !== 1 ? 's' : ''} • Payment: {ord.paymentMethod}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Paid</span>
                            <span className="font-serif text-xl font-bold text-[#1A1A1A]">€{ord.total.toFixed(2)}</span>
                          </div>

                          {/* Order Status Selector */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-500 block">Order Status</span>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-bold border focus:outline-none ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : ord.status === 'Packed'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : ord.status === 'Shipped'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}
                            >
                              <option value="Pending">⏳ Pending Dispatch</option>
                              <option value="Packed">📦 Packed & Labeled</option>
                              <option value="Shipped">🚚 Shipped</option>
                              <option value="Delivered">✅ Delivered</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setOrderToDelete({ id: ord.id, numberOrName: ord.orderNumber, type: 'live' })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Order Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* MAIN ORDER CONTENT GRID (3 COLUMNS) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* COL 1: Customer Details & Shipping Address (4 COLS) */}
                        <div className="lg:col-span-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3 text-xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] uppercase tracking-wider pb-2 border-b border-[#E5DEC9]">
                            <User className="w-4 h-4 text-[#C9A24D]" /> Customer & Shipping Info
                          </div>

                          <div className="space-y-1.5">
                            <div className="font-bold text-sm text-gray-900">
                              {ord.customer.firstName} {ord.customer.lastName}
                            </div>
                            <div className="text-gray-600">{ord.customer.email}</div>
                            {ord.customer.phone && <div className="text-gray-600 font-mono">TEL: {ord.customer.phone}</div>}
                            
                            <div className="pt-2 border-t border-[#E5DEC9]/60 font-semibold text-gray-800 leading-relaxed">
                              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Shipping Address:</span>
                              {ord.customer.address}
                              {ord.customer.apartment && <><br />{ord.customer.apartment}</>}
                              <br />
                              {ord.customer.city}, {ord.customer.postcode}
                              <br />
                              <strong className="text-black uppercase">{ord.customer.country}</strong>
                            </div>
                          </div>
                        </div>

                        {/* COL 2: Ordered Items Summary (5 COLS) */}
                        <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3 text-xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] uppercase tracking-wider pb-2 border-b border-[#E5DEC9]">
                            <ShoppingBag className="w-4 h-4 text-[#C9A24D]" /> Products Ordered ({totalQty})
                          </div>

                          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5DEC9]/80">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-gray-900 truncate">{item.name}</div>
                                  <div className="text-[11px] text-gray-500">
                                    Fit: {item.clubFit || 'Standard'} • Qty: <strong className="text-black">{item.quantity}</strong>
                                  </div>
                                </div>
                                <div className="font-serif font-bold text-gray-900 text-right">
                                  €{(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* COL 3: Shipping Carrier & Tracking Summary (3 COLS) */}
                        <div className="lg:col-span-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3 text-xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A] uppercase tracking-wider pb-2 border-b border-[#E5DEC9]">
                            <Truck className="w-4 h-4 text-[#C9A24D]" /> Parcel & Carrier
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Carrier</span>
                              <span className="font-bold text-sm text-gray-900">{ord.carrier || 'An Post Express'}</span>
                            </div>

                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Tracking Number</span>
                              {ord.trackingNumber ? (
                                <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300 block text-center">
                                  {ord.trackingNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Not yet assigned</span>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Shipping Fee Charged</span>
                              <span className="font-bold text-gray-800">
                                {ord.shippingFee === 0 ? 'FREE Shipping' : `€${ord.shippingFee.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* ORDER BOTTOM ACTION BAR */}
                      <div className="pt-4 border-t border-[#F5F1E8] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Includes automated parcel weight calculation & CN22 customs form generation</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForSlip(ord)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-300"
                          >
                            <Printer className="w-3.5 h-3.5 text-gray-600" /> Packing Slip
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForLabel(ord)}
                            className="bg-[#3B1C59] hover:bg-[#2E1065] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#C9A24D]" /> Create Shipping Label
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForNotify(ord)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-200" /> Mark Shipped & Notify
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      )}

      {/* SHIPPING RATES MANAGEMENT TAB */}
      {activeTab === 'shippingRates' && (
        <div className="space-y-8">
          
          <div className="bg-gradient-to-r from-[#0D382C] via-[#1A1A1A] to-[#0D382C] text-white p-6 sm:p-8 rounded-3xl border border-[#C9A24D]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#C9A24D] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Automated Shipping Engine
                </span>
                <span className="text-xs text-gray-300">• Multi-Headcover Matrix Pricing</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Shipping Rates & Zones Matrix</h2>
              <p className="text-xs text-gray-300 max-w-2xl">
                Configure shipping charges based on total headcovers count (1 to 4+) and destination zones (Ireland 🇮🇪, United Kingdom 🇬🇧, European Union 🇪🇺, United States 🇺🇸).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateStoreSettings({ shippingSettings: shippingConfig });
                triggerToast('Shipping Rates Matrix Saved & Active!', 'success');
              }}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Shipping Rates
            </button>
          </div>

          {/* SHIPPING RATES MATRIX TABLE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-700" /> Headcover Shipping Rates Matrix
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set prices for orders with 1, 2, 3, or 4+ headcovers across destination countries.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold bg-[#FAF8F5] p-2 rounded-xl border border-[#E5DEC9]">
                <span className="text-gray-600">Rate Mode:</span>
                <select
                  value={shippingConfig.rateType}
                  onChange={(e) => setShippingConfig({ ...shippingConfig, rateType: e.target.value as any })}
                  className="bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900"
                >
                  <option value="headcover_matrix">Dynamic Headcover Count Matrix</option>
                  <option value="flat">Standard Flat Rate Shipping</option>
                  <option value="weight_based">Weight-based Shipping Rate</option>
                </select>
              </div>
            </div>

            {/* MATRIX GRID */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-[#FAF8F5] border-b-2 border-[#E5DEC9] uppercase text-[11px] font-serif font-bold text-gray-600">
                  <tr>
                    <th className="p-3.5">Headcovers Count</th>
                    <th className="p-3.5">Ireland 🇮🇪 (€)</th>
                    <th className="p-3.5">United Kingdom 🇬🇧 (€)</th>
                    <th className="p-3.5">European Union 🇪🇺 (€)</th>
                    <th className="p-3.5">United States / World 🇺🇸 (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {[
                    { countLabel: '1 Headcover', index: 0 },
                    { countLabel: '2 Headcovers', index: 1 },
                    { countLabel: '3 Headcovers', index: 2 },
                    { countLabel: '4+ Headcovers', index: 3 },
                  ].map((row) => (
                    <tr key={row.index} className="hover:bg-[#FAF8F5]">
                      <td className="p-3.5 font-bold font-serif text-sm text-[#1A1A1A]">{row.countLabel}</td>
                      
                      {/* Ireland */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={shippingConfig.matrix.ireland[row.index]}
                            onChange={(e) => {
                              const updated = [...shippingConfig.matrix.ireland] as [number, number, number, number];
                              updated[row.index] = parseFloat(e.target.value) || 0;
                              setShippingConfig({
                                ...shippingConfig,
                                matrix: { ...shippingConfig.matrix, ireland: updated }
                              });
                            }}
                            className="w-24 bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </td>

                      {/* UK */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={shippingConfig.matrix.uk[row.index]}
                            onChange={(e) => {
                              const updated = [...shippingConfig.matrix.uk] as [number, number, number, number];
                              updated[row.index] = parseFloat(e.target.value) || 0;
                              setShippingConfig({
                                ...shippingConfig,
                                matrix: { ...shippingConfig.matrix, uk: updated }
                              });
                            }}
                            className="w-24 bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </td>

                      {/* EU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={shippingConfig.matrix.eu[row.index]}
                            onChange={(e) => {
                              const updated = [...shippingConfig.matrix.eu] as [number, number, number, number];
                              updated[row.index] = parseFloat(e.target.value) || 0;
                              setShippingConfig({
                                ...shippingConfig,
                                matrix: { ...shippingConfig.matrix, eu: updated }
                              });
                            }}
                            className="w-24 bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </td>

                      {/* US */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-400">€</span>
                          <input
                            type="number"
                            step="0.01"
                            value={shippingConfig.matrix.us[row.index]}
                            onChange={(e) => {
                              const updated = [...shippingConfig.matrix.us] as [number, number, number, number];
                              updated[row.index] = parseFloat(e.target.value) || 0;
                              setShippingConfig({
                                ...shippingConfig,
                                matrix: { ...shippingConfig.matrix, us: updated }
                              });
                            }}
                            className="w-24 bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                          />
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FREE SHIPPING THRESHOLD CONFIG */}
            <div className="pt-6 border-t border-[#F5F1E8] grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-serif font-bold text-gray-900 text-sm">Free Shipping Threshold</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shippingConfig.freeShippingEnabled}
                      onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>
                <p className="text-gray-500 text-[11px]">Orders exceeding this subtotal receive complimentary free standard shipping automatically.</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-gray-500">€</span>
                  <input
                    type="number"
                    step="5"
                    value={shippingConfig.freeShippingThreshold}
                    onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3">
                <label className="font-serif font-bold text-gray-900 text-sm block">Carrier Integrations & Shipping Providers</label>
                <p className="text-gray-500 text-[11px]">Primary integration is configured for An Post Ireland. Ready to connect DPD, DHL Express, UPS, and FedEx for global dispatch.</p>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold">
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-300">🇮🇪 An Post (Active)</span>
                  <span className="bg-red-50 text-red-800 px-2.5 py-1 rounded-md border border-red-200">🇪🇺 DPD Courier</span>
                  <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200">🌐 DHL Express</span>
                  <span className="bg-amber-950/10 text-amber-950 px-2.5 py-1 rounded-md border border-amber-900/20">🇺🇸 UPS Express</span>
                  <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-md border border-purple-200">🌐 FedEx Int.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
      {activeTab === 'custom' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-[#3B1C59]" /> Bespoke Custom Headcovers Dashboard
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Review submitted custom designs, inspect uploaded logos and embroidery AI evaluations, update proof status, and approve for stitching.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold shrink-0">
              <span className="bg-[#3B1C59]/10 text-[#3B1C59] px-3 py-1.5 rounded-xl border border-[#3B1C59]/20">
                Total Submissions: {customOrders.length}
              </span>
              <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200">
                Proof Pending: {customOrders.filter(c => c.status === 'Proof Pending').length}
              </span>
            </div>
          </div>

          {/* CUSTOM ORDERS LIST */}
          {customOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E5DEC9] text-center text-gray-500 space-y-3">
              <Wand2 className="w-10 h-10 text-[#3B1C59] mx-auto opacity-40" />
              <p className="font-serif font-bold text-lg text-[#1A1A1A]">No Custom Headcover Orders Yet</p>
              <p className="text-xs max-w-md mx-auto">When customers create custom headcovers on the Bespoke Studio page, their designs and artwork will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {customOrders.map((custom) => (
                <div 
                  key={custom.id} 
                  className="bg-white rounded-3xl border-2 border-[#E5DEC9] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow space-y-6"
                >
                  {/* Card Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F5F1E8]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-lg text-[#1A1A1A]">Order #{custom.id}</span>
                        <span className="bg-[#0D382C] text-[#C9A24D] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                          {custom.headcoverType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(custom.createdAt).toLocaleDateString()} • Est: {custom.estimatedDays}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Design Value</span>
                        <span className="font-serif text-lg font-bold text-[#3B1C59]">{storeSettings.currencySymbol}{custom.price.toFixed(2)}</span>
                      </div>

                      {/* Status Dropdown Selector */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Proof Status</span>
                        <select
                          value={custom.status}
                          onChange={(e) => updateCustomOrderStatus(custom.id, e.target.value as any)}
                          className="bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#3B1C59]"
                        >
                          <option value="Proof Pending">⏳ Proof Pending</option>
                          <option value="Proof Sent">📩 Proof Sent to Customer</option>
                          <option value="Proof Approved">✅ Proof Approved</option>
                          <option value="In Production">🪡 In Production (Stitching)</option>
                          <option value="Shipped">📦 Shipped</option>
                        </select>
                      </div>

                      {/* Delete Custom Order Button */}
                      <button
                        type="button"
                        onClick={() => setOrderToDelete({ id: custom.id, numberOrName: `#${custom.id}`, type: 'custom' })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Custom Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Main Body: 3 Columns (Preview, Specifications, Artwork/Notes) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* COL 1: Live Interactive SVG Render (4 COLS) */}
                    <div className="lg:col-span-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9]">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2 text-center">
                        Digital Render Preview
                      </span>
                      <CustomHeadcoverPreview
                        headcoverType={custom.headcoverType}
                        material={custom.material}
                        mainColor={custom.mainColor}
                        secondaryColor={custom.secondaryColor}
                        stitchColor={custom.stitchColor}
                        customText={custom.customText}
                        font={custom.font}
                        embroideryColor={custom.embroideryColor}
                        logoUrl={custom.logoUrl}
                        imageUrl={custom.imageUrl}
                        interactive={false}
                      />
                    </div>

                    {/* COL 2: Design Specifications (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] text-xs">
                      <h4 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#3B1C59]" /> Customization Details
                      </h4>

                      <div className="space-y-2.5 divide-y divide-[#E5DEC9]/60">
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Material:</span>
                          <span className="font-bold text-gray-900">{custom.material}</span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Main Leather Colour:</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: custom.mainColor }} />
                            <span>{custom.mainColor}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Secondary Accent Panel:</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: custom.secondaryColor }} />
                            <span>{custom.secondaryColor}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Stitch Colour:</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: custom.stitchColor }} />
                            <span>{custom.stitchColor}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Custom Monogram:</span>
                          <span className="font-serif font-bold text-[#3B1C59] text-sm">
                            "{custom.customText || 'None'}"
                          </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Font Style:</span>
                          <span className="font-bold text-gray-900">{custom.font}</span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-gray-500 font-semibold">Embroidery Thread:</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: custom.embroideryColor }} />
                            <span>{custom.embroideryColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COL 3: Uploaded Logo & AI Design Inspector Summary (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4">
                      {/* Uploaded Artwork Panel */}
                      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] space-y-3 text-xs">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Uploaded Artwork / Logo</span>
                        {custom.logoUrl || custom.imageUrl ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={custom.logoUrl || custom.imageUrl}
                              alt="Uploaded logo"
                              className="w-16 h-16 object-contain bg-white p-2 rounded-xl border border-[#E5DEC9] shadow-xs"
                            />
                            <div className="space-y-1">
                              <span className="font-bold text-gray-900 block truncate max-w-[150px]">
                                {custom.logoFileName || 'Customer Graphic File'}
                              </span>
                              <a
                                href={custom.logoUrl || custom.imageUrl}
                                download="custom-logo-artwork"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3B1C59] hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" /> Download High Res
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">No custom logo file uploaded (Text monogram only)</p>
                        )}
                      </div>

                      {/* Designer Notes */}
                      {custom.designerNotes && (
                        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-900 block">Designer Notes from Customer</span>
                          <p className="text-amber-950 italic">"{custom.designerNotes}"</p>
                        </div>
                      )}

                      {/* AI Review Summary */}
                      {custom.aiReview && (
                        <div className="bg-white p-4 rounded-2xl border border-[#3B1C59]/30 text-xs space-y-2 shadow-xs">
                          <div className="flex items-center justify-between pb-1 border-b border-[#F5F1E8]">
                            <span className="font-serif font-bold text-[#3B1C59] flex items-center gap-1">
                              <Wand2 className="w-3.5 h-3.5 text-[#C9A24D]" /> AI Inspection Summary
                            </span>
                            <span className="font-bold text-emerald-700">{custom.aiReview.overallScore}/100</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-tight">{custom.aiReview.aiSummary}</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-[#F5F1E8] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Includes complimentary 3D proof & quality guarantee</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          updateCustomOrderStatus(custom.id, 'Proof Sent');
                          triggerToast(`Digital proof generated and sent for #${custom.id}`, 'success');
                        }}
                        className="bg-[#3B1C59] hover:bg-[#2E1065] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
                      >
                        📩 Send Digital Proof
                      </button>

                      <button
                        onClick={() => {
                          updateCustomOrderStatus(custom.id, 'In Production');
                          triggerToast(`Order #${custom.id} approved and moved to stitching production!`, 'success');
                        }}
                        className="bg-[#0D382C] hover:bg-[#1A1A1A] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
                      >
                        🪡 Approve for Stitching
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete custom order #${custom.id}?`)) {
                            deleteCustomOrder(custom.id);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Delete Custom Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM STUDIO CONFIGURATION TAB */}
      {activeTab === 'customStudio' && (
        <div className="space-y-8">
          
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#1A1A1A] via-[#2A1E38] to-[#1A1A1A] text-white p-6 sm:p-8 rounded-3xl border border-[#C9A24D]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#C9A24D] text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Admin Studio Control
                </span>
                <span className="text-xs text-gray-300">• Custom Headcover Studio Configuration</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Custom Headcover Studio Settings</h2>
              <p className="text-xs text-gray-300 max-w-2xl">
                Change everything about custom headcovers: prices, colors, fonts, default studio text, and test live on the plain white preview!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                updateCustomStudioSettings({
                  studioTitle: csTitle,
                  studioSubheading: csSubheading,
                  typePrices: csPrices,
                  availableColors: csColors,
                  availableFonts: csFonts,
                });
                triggerToast('Custom Studio Settings Saved & Published!', 'success');
              }}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Live Studio Settings
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONFIGURATION PANELS (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STUDIO HEADINGS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2 pb-2 border-b border-[#F5F1E8]">
                  <FileText className="w-5 h-5 text-[#C9A24D]" /> Studio Titles & Headers
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Studio Main Title</label>
                  <input
                    type="text"
                    value={csTitle}
                    onChange={(e) => setCsTitle(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 text-xs font-serif font-bold text-gray-900 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Studio Subheading Description</label>
                  <textarea
                    rows={2}
                    value={csSubheading}
                    onChange={(e) => setCsSubheading(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
              </div>

              {/* MODEL BASE PRICES */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2 pb-2 border-b border-[#F5F1E8]">
                  <DollarSign className="w-5 h-5 text-[#C9A24D]" /> Headcover Base Model Pricing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {(Object.keys(csPrices) as CustomHeadcoverType[]).map((type) => (
                    <div key={type} className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5DEC9] space-y-1">
                      <label className="block font-serif font-bold text-gray-900 truncate">{type}</label>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">{storeSettings.currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={csPrices[type]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCsPrices((prev) => ({ ...prev, [type]: val }));
                          }}
                          className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-1.5 font-bold text-gray-900 focus:outline-none focus:border-[#C9A24D]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLOR PALETTE EDITOR */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F5F1E8]">
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#C9A24D]" /> Custom Color Palette ({csColors.length} Colors)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Basic & Custom Leather Colors</span>
                </div>

                {/* Color List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {csColors.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5DEC9]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-2xs" style={{ backgroundColor: c.hex }} />
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate text-[11px]">{c.name}</span>
                          <span className="font-mono text-[9px] text-gray-400 block uppercase">{c.hex}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = csColors.filter((_, i) => i !== idx);
                          setCsColors(updated);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Color"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Color Row */}
                <div className="pt-3 border-t border-[#F5F1E8] flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Pure White, Emerald Green)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A24D]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-10 h-9 rounded-xl border border-[#E5DEC9] cursor-pointer bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newColorName.trim()) {
                          triggerToast('Please enter a color name', 'error');
                          return;
                        }
                        setCsColors([...csColors, { name: newColorName.trim(), hex: newColorHex }]);
                        setNewColorName('');
                        triggerToast(`Added ${newColorName} to color palette!`, 'success');
                      }}
                      className="bg-[#0D382C] hover:bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-[#C9A24D]" /> Add Color
                    </button>
                  </div>
                </div>
              </div>

              {/* FONT OPTIONS EDITOR */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F5F1E8]">
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <FontIcon className="w-5 h-5 text-[#C9A24D]" /> Available Embroidery Fonts ({csFonts.length})
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {csFonts.map((fontName, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DEC9]">
                      <span className="font-bold text-gray-900 truncate">{fontName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = csFonts.filter((_, i) => i !== idx);
                          setCsFonts(updated);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove Font"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Font Row */}
                <div className="pt-3 border-t border-[#F5F1E8] flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Font Name (e.g. Modern Minimal, Gothic Calligraphy)"
                    value={newFontName}
                    onChange={(e) => setNewFontName(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A24D]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFontName.trim()) {
                        triggerToast('Please enter a font name', 'error');
                        return;
                      }
                      setCsFonts([...csFonts, newFontName.trim()]);
                      setNewFontName('');
                      triggerToast(`Added font "${newFontName}"`, 'success');
                    }}
                    className="bg-[#0D382C] hover:bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#C9A24D]" /> Add Font
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT LIVE PREVIEW TESTER (5 COLS) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6 sticky top-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3B1C59] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A24D]" />
                  <span>Admin Live Preview Tester</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">Plain White Base Live Render</h3>
                <p className="text-xs text-gray-500 mt-1">Test how colors, fonts, and monograms render on the plain white test headcover in real time.</p>
              </div>

              {/* Headcover Live Preview */}
              <div className="w-full">
                <CustomHeadcoverPreview
                  headcoverType={testHeadcoverType}
                  material="Genuine Leather"
                  mainColor={testMainColor}
                  secondaryColor="#3B1C59"
                  stitchColor="#C9A24D"
                  customText={testText}
                  font={testFont}
                  embroideryColor="#C9A24D"
                  interactive={true}
                />
              </div>

              {/* Test Controls */}
              <div className="space-y-4 pt-4 border-t border-[#F5F1E8] text-xs">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Select Headcover Model</label>
                  <select
                    value={testHeadcoverType}
                    onChange={(e) => setTestHeadcoverType(e.target.value as CustomHeadcoverType)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-2.5 font-bold focus:outline-none"
                  >
                    <option value="Driver Headcover">Driver Headcover</option>
                    <option value="Fairway Wood Headcover">Fairway Wood Headcover</option>
                    <option value="Hybrid Headcover">Hybrid Headcover</option>
                    <option value="Blade Putter Cover">Blade Putter Cover</option>
                    <option value="Mallet Putter Cover">Mallet Putter Cover</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Test Color Overlay</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    <button
                      type="button"
                      onClick={() => setTestMainColor('#FFFFFF')}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center ${
                        testMainColor === '#FFFFFF' ? 'border-[#3B1C59] bg-[#3B1C59]/10' : 'border-[#E5DEC9]'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white border border-black/20 shadow-2xs mb-1" />
                      Plain White
                    </button>
                    {csColors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setTestMainColor(c.hex)}
                        className={`p-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center ${
                          testMainColor === c.hex ? 'border-[#3B1C59] bg-[#3B1C59]/10' : 'border-[#E5DEC9]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-black/20 shadow-2xs mb-1" style={{ backgroundColor: c.hex }} />
                        <span className="truncate max-w-[50px]">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Test Custom Text</label>
                    <input
                      type="text"
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Test Font</label>
                    <select
                      value={testFont}
                      onChange={(e) => setTestFont(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-2 font-bold"
                    >
                      {csFonts.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateCustomStudioSettings({
                      studioTitle: csTitle,
                      studioSubheading: csSubheading,
                      typePrices: csPrices,
                      availableColors: csColors,
                      availableFonts: csFonts,
                    });
                    triggerToast('Studio configuration saved & updated live across store!', 'success');
                  }}
                  className="w-full bg-[#3B1C59] hover:bg-[#2E1065] text-white py-3 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#C9A24D]" /> Save All Studio Configuration
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SALES & PROMOTIONS TAB */}
      {activeTab === 'sales' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C9A24D]" /> Promotional Sale Banner Slideshow
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Configure auto-cycling promotional picture slides displayed on the homepage and shop header.
              </p>
            </div>

            <button
              onClick={() => setIsAddSlideModalOpen(true)}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Promotional Slide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(salePromoConfig?.slides || []).map((slide) => (
              <div key={slide.id} className="bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs space-y-3 relative group">
                <div className="relative aspect-16/9 w-full bg-[#1A1A1A] overflow-hidden">
                  <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover opacity-80" />
                  <span className="absolute top-3 left-3 bg-[#C9A24D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {slide.badgeText || 'SALE'}
                  </span>
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {slide.discountText || 'PROMO'}
                  </span>
                </div>

                <div className="p-5 space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-base">{slide.title}</h4>
                  <p className="text-gray-500 line-clamp-2">{slide.subtitle}</p>

                  <div className="pt-3 border-t border-[#F5F1E8] flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#C9A24D]">
                      Category: {slide.linkCategory || 'All'}
                    </span>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYPAL SETTINGS TAB */}
      {activeTab === 'paypal' && (
        <form onSubmit={handleSavePaypalSettings} className="bg-white p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6 max-w-2xl text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F1E8]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg italic">
              P
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                PayPal & Direct Card Gateway Configuration
              </h3>
              <p className="text-gray-500">
                Customer payments will be routed directly to your PayPal merchant account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] cursor-pointer">
              <input
                type="checkbox"
                checked={paypalEnabled}
                onChange={(e) => setPaypalEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#C9A24D] accent-[#C9A24D]"
              />
              <div>
                <span className="font-bold text-gray-900 block">Enable PayPal & Card Checkout Gateway</span>
                <span className="text-gray-500 text-[11px]">Customers can complete orders using PayPal or debit/credit cards</span>
              </div>
            </label>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Your PayPal Merchant Email</label>
              <input
                type="email"
                required
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="e.g. user-paypal@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#C9A24D]"
              />
              <p className="text-[11px] text-gray-400 mt-1">All sales funds will be deposited to this PayPal account.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">PayPal Client ID / App Credentials (Optional)</label>
              <input
                type="text"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                placeholder="e.g. A21AAFIx... or live client id"
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus:outline-none focus:border-[#C9A24D]"
              />
            </div>

            {/* Vercel & Production Readiness Callout */}
            <div className="p-5 bg-[#0D382C] text-white rounded-2xl border border-[#C9A24D]/40 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#C9A24D]" />
                <h4 className="font-bold text-sm">Vercel & Production Hosting Readiness</h4>
              </div>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                Your PayPal settings, product inventory ({products.length} items), custom studio pricing, and shipping rules are saved and fully compatible with Vercel hosting.
              </p>
              <button
                type="button"
                onClick={() => {
                  exportStoreDataBackup({ products, orders, homepageConfig, salePromoConfig, storeSettings, customStudioSettings });
                  triggerToast('Downloaded Vercel store backup JSON!', 'success');
                }}
                className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-4 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Complete Vercel Data Backup (.json)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save PayPal Gateway Settings
          </button>
        </form>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F5F1E8] text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#1A1A1A]">Order #{o.orderNumber}</span>
                    <span className="text-gray-400">• {o.date}</span>
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    Customer: {o.customer.firstName} {o.customer.lastName} ({o.customer.email})
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Payment Method: {o.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Status</span>
                    <select
                      value={o.status}
                      onChange={(e: any) => updateOrderStatus(o.id, e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-1 font-bold text-xs focus:outline-none"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <span className="font-serif text-xl font-bold text-[#C9A24D]">
                    {storeSettings.currencySymbol}{o.total.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOrderToDelete({ id: o.id, numberOrName: `#${o.orderNumber}`, type: 'live' })}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9]">
                    <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-xl border border-[#E5DEC9]" />
                    <div>
                      <p className="font-serif font-bold text-[#1A1A1A] line-clamp-1">{it.name}</p>
                      <p className="text-gray-500">Qty: {it.quantity} • Option: {it.clubFit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOMEPAGE CUSTOMIZATION TAB */}
      {activeTab === 'homepage' && (
        <form onSubmit={handleSaveHomepageConfig} className="bg-white p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6 max-w-2xl text-xs">
          <h3 className="font-serif text-xl font-bold text-[#1A1A1A] pb-2 border-b border-[#F5F1E8]">
            Customize Hero Banner & Announcement Text
          </h3>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Top Announcement Bar Text</label>
            <input
              type="text"
              value={hpAnnounce}
              onChange={(e) => setHpAnnounce(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Hero Section Headline Title</label>
            <input
              type="text"
              value={hpTitle}
              onChange={(e) => setHpTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-serif text-base focus:outline-none focus:border-[#C9A24D]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Hero Subheading</label>
            <textarea
              rows={3}
              value={hpSubheading}
              onChange={(e) => setHpSubheading(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3.5 focus:outline-none focus:border-[#C9A24D]"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="block font-semibold text-gray-700">Hero Background Image</label>
              <div className="flex items-center gap-2">
                <label className="bg-[#3B1C59] hover:bg-[#2A1341] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs">
                  <Camera className="w-3 h-3 text-[#C9A24D]" /> Camera Roll
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleDirectFileUpload(e, setHpHeroImg)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => openPhotoPicker('heroBg', hpHeroImg)}
                  className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                >
                  <ImageIcon className="w-3 h-3" /> Photo Library
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hpHeroImg && (
                <img
                  src={hpHeroImg}
                  alt="Hero Preview"
                  className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9] shrink-0"
                />
              )}
              <input
                type="text"
                value={hpHeroImg}
                onChange={(e) => setHpHeroImg(e.target.value)}
                placeholder="Image URL or uploaded data..."
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono text-[11px] focus:outline-none focus:border-[#C9A24D]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Live Changes
          </button>
        </form>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E5DEC9] shadow-2xl relative my-8">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-4">Add New Golf Headcover</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Florentine Saddle Driver Cover"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e: any) => setNewProdCategory(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2.5 font-medium"
                  >
                    <option value="Leather">Leather</option>
                    <option value="Funny">Funny</option>
                    <option value="Irish">Irish</option>
                    <option value="Animal">Animal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Main Club Fit</label>
                  <select
                    value={newProdClubFit}
                    onChange={(e: any) => setNewProdClubFit(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2.5 font-medium"
                  >
                    <option value="Driver">Driver</option>
                    <option value="3 Wood">3 Wood</option>
                    <option value="5 Wood">5 Wood</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Blade Putter">Blade Putter</option>
                    <option value="Mallet Putter">Mallet Putter</option>
                  </select>
                </div>
              </div>

              {/* Club Options Checkboxes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Allowed Club Options (Customers can choose from these):
                </label>
                <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DEC9]">
                  {ALL_CLUB_FITS.map((fit) => (
                    <label key={fit} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={newProdAllowedFits.includes(fit)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProdAllowedFits([...newProdAllowedFits, fit]);
                          } else {
                            setNewProdAllowedFits(newProdAllowedFits.filter((f) => f !== fit));
                          }
                        }}
                        className="rounded text-[#C9A24D] accent-[#C9A24D]"
                      />
                      <span>{fit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Original Price ({storeSettings.currencySymbol}) [Optional for Sale]</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 69.99"
                    value={newProdOrigPrice || ''}
                    onChange={(e) => setNewProdOrigPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label className="block font-semibold text-gray-700">Primary Picture</label>
                  <div className="flex items-center gap-2">
                    <label className="bg-[#3B1C59] hover:bg-[#2A1341] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs">
                      <Camera className="w-3 h-3 text-[#C9A24D]" /> Camera Roll
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDirectFileUpload(e, setNewProdImage)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => openPhotoPicker('newMain', newProdImage)}
                      className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                    >
                      <ImageIcon className="w-3 h-3" /> Photo Library
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {newProdImage && (
                    <img
                      src={newProdImage}
                      alt="New Product Main Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9] shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="Image URL or uploaded data..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              <VisualGalleryManager
                title="Multiple Gallery Pictures"
                images={newProdGalleryImages}
                onAddFromCameraRoll={(e) =>
                  handleDirectFileUpload(e, (dataUrl) =>
                    setNewProdGalleryImages((prev) => [...prev, dataUrl])
                  )
                }
                onOpenPhotoPicker={() => openPhotoPicker('newGallery', '')}
                onRemoveImage={(idx) =>
                  setNewProdGalleryImages((prev) => prev.filter((_, i) => i !== idx))
                }
              />

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3.5"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-[#E5DEC9] font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E5DEC9] shadow-2xl relative space-y-4 text-xs my-8">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Edit Product Details: {editingProduct.name}</h3>

            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E5DEC9] space-y-1">
              <label className="block font-serif font-bold text-[#1A1A1A] text-xs flex items-center justify-between">
                <span>Product Title / Name</span>
                <span className="text-[10px] text-[#C9A24D] font-mono uppercase tracking-wider">Updates live on all store pages</span>
              </label>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-serif font-bold text-[#1A1A1A] text-sm focus:outline-none focus:border-[#C9A24D] focus:ring-2 focus:ring-[#C9A24D]/20 shadow-xs"
                placeholder="Enter product title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e: any) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2.5 font-medium"
                >
                  <option value="Leather">Leather</option>
                  <option value="Funny">Funny</option>
                  <option value="Irish">Irish</option>
                  <option value="Animal">Animal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Main Club Fit</label>
                <select
                  value={editingProduct.clubFit}
                  onChange={(e: any) => setEditingProduct({ ...editingProduct, clubFit: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2.5 font-medium"
                >
                  <option value="Driver">Driver</option>
                  <option value="3 Wood">3 Wood</option>
                  <option value="5 Wood">5 Wood</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Blade Putter">Blade Putter</option>
                  <option value="Mallet Putter">Mallet Putter</option>
                </select>
              </div>
            </div>

            {/* Edit Club Options Checkboxes */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">
                Allowed Club Options (Customers can select on product page):
              </label>
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DEC9]">
                {ALL_CLUB_FITS.map((fit) => {
                  const currentAllowed = editingProduct.allowedClubFits || ALL_CLUB_FITS;
                  const isChecked = currentAllowed.includes(fit);
                  return (
                    <label key={fit} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentAllowed, fit]
                            : currentAllowed.filter((f) => f !== fit);
                          setEditingProduct({ ...editingProduct, allowedClubFits: updated });
                        }}
                        className="rounded text-[#C9A24D] accent-[#C9A24D]"
                      />
                      <span>{fit}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Price ({storeSettings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Original / Sale ({storeSettings.currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.originalPrice || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="block font-semibold text-gray-700">Primary Cover Picture</label>
                <div className="flex items-center gap-2">
                  <label className="bg-[#3B1C59] hover:bg-[#2A1341] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs">
                    <Camera className="w-3 h-3 text-[#C9A24D]" /> Camera Roll
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleDirectFileUpload(e, (dataUrl) =>
                          setEditingProduct({ ...editingProduct, image: dataUrl })
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => openPhotoPicker('editMain', editingProduct.image)}
                    className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                  >
                    <ImageIcon className="w-3 h-3" /> Photo Library
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {editingProduct.image && (
                  <img
                    src={editingProduct.image}
                    alt="Cover preview"
                    className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9] shrink-0"
                  />
                )}
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="Image URL or uploaded data..."
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono text-[11px]"
                />
              </div>
            </div>

            <VisualGalleryManager
              title="Multiple Gallery Pictures"
              images={editGalleryImages}
              onAddFromCameraRoll={(e) =>
                handleDirectFileUpload(e, (dataUrl) =>
                  setEditGalleryImages((prev) => [...prev, dataUrl])
                )
              }
              onOpenPhotoPicker={() => openPhotoPicker('editGallery', '')}
              onRemoveImage={(idx) =>
                setEditGalleryImages((prev) => prev.filter((_, i) => i !== idx))
              }
            />

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3.5"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-6 py-2.5 rounded-xl border border-[#E5DEC9] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                className="flex-1 bg-[#C9A24D] text-white py-2.5 rounded-xl font-bold uppercase shadow-md"
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SALE SLIDE MODAL */}
      {isAddSlideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E5DEC9] shadow-2xl relative space-y-4 text-xs">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Add Promotional Sale Banner</h3>

            <form onSubmit={handleAddSlide} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Slide Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Season Irish Shamrock Special"
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% off all Irish tweed & embroidery designs"
                  value={newSlideSubtitle}
                  onChange={(e) => setNewSlideSubtitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <label className="block font-semibold text-gray-700">Slide Picture</label>
                  <div className="flex items-center gap-2">
                    <label className="bg-[#3B1C59] hover:bg-[#2A1341] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-xs">
                      <Camera className="w-3 h-3 text-[#C9A24D]" /> Camera Roll
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDirectFileUpload(e, setNewSlideImg)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => openPhotoPicker('newSlide', newSlideImg)}
                      className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                    >
                      <ImageIcon className="w-3 h-3" /> Photo Library
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {newSlideImg && (
                    <img
                      src={newSlideImg}
                      alt="Banner slide preview"
                      className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9] shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    required
                    value={newSlideImg}
                    onChange={(e) => setNewSlideImg(e.target.value)}
                    placeholder="Image URL or uploaded data..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={newSlideBadge}
                    onChange={(e) => setNewSlideBadge(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={newSlideDiscount}
                    onChange={(e) => setNewSlideDiscount(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Category Link</label>
                <select
                  value={newSlideCategory}
                  onChange={(e: any) => setNewSlideCategory(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3 py-2 font-medium"
                >
                  <option value="Leather">Leather Collection</option>
                  <option value="Funny">Funny Collection</option>
                  <option value="Irish">Irish Collection</option>
                  <option value="Animal">Animal Collection</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSlideModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-[#E5DEC9] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C9A24D] text-white py-2.5 rounded-xl font-bold uppercase shadow-md"
                >
                  Add Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DELETION CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-red-100">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Confirm Order Deletion
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to permanently delete {orderToDelete.type === 'custom' ? 'Custom Headcover Order' : 'Order'}{' '}
                <span className="font-bold text-[#1A1A1A]">{orderToDelete.numberOrName}</span>?
                This record will be permanently deleted from your store database and cannot be recovered.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (orderToDelete.type === 'live') {
                    deleteOrder(orderToDelete.id);
                  } else {
                    deleteCustomOrder(orderToDelete.id);
                  }
                  setOrderToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPING LABEL GENERATOR MODAL */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
          onLabelGenerated={() => {
            setSelectedOrderForLabel(null);
            triggerToast('Shipping label generated & tracking saved!', 'success');
          }}
        />
      )}

      {/* PACKING SLIP MODAL */}
      {selectedOrderForSlip && (
        <PackingSlipModal
          order={selectedOrderForSlip}
          onClose={() => setSelectedOrderForSlip(null)}
        />
      )}

      {/* DISPATCH NOTIFICATION & EMAIL MODAL */}
      {selectedOrderForNotify && (
        <ShippingNotificationModal
          order={selectedOrderForNotify}
          onClose={() => setSelectedOrderForNotify(null)}
          onSent={() => {
            setSelectedOrderForNotify(null);
            triggerToast(`Dispatch notification sent for ${selectedOrderForNotify.orderNumber}!`, 'success');
          }}
        />
      )}

    </div>
  );
};
