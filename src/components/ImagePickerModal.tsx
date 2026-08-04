import React, { useState, useRef } from 'react';
import { X, Search, Check, Image as ImageIcon, Sparkles, Link as LinkIcon, Upload, Camera, FileImage } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

export interface PhotoLibraryItem {
  id: string;
  title: string;
  category: 'Leather' | 'Irish' | 'Funny' | 'Animal' | 'Golf Course';
  url: string;
  tags: string[];
}

export const PHOTO_LIBRARY: PhotoLibraryItem[] = [
  // Leather
  {
    id: 'photo-leather-1',
    title: 'Florentine Saddle Tan Leather',
    category: 'Leather',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    tags: ['leather', 'saddle', 'tan', 'driver', 'classic', 'luxury']
  },
  {
    id: 'photo-leather-2',
    title: 'Vintage Cognac Golf Leather',
    category: 'Leather',
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
    tags: ['leather', 'cognac', 'vintage', 'fairway', 'wood']
  },
  {
    id: 'photo-leather-3',
    title: 'Executive Black Leather Grain',
    category: 'Leather',
    url: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1200',
    tags: ['black', 'leather', 'executive', 'putter', 'premium']
  },
  {
    id: 'photo-leather-4',
    title: 'Tuscan Distressed Brown Leather',
    category: 'Leather',
    url: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1200',
    tags: ['brown', 'distressed', 'craftsmanship', 'hybrid']
  },

  // Irish & Tweed
  {
    id: 'photo-irish-1',
    title: 'St. Andrews Shamrock Green',
    category: 'Irish',
    url: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1200',
    tags: ['irish', 'shamrock', 'clover', 'green', 'putter']
  },
  {
    id: 'photo-irish-2',
    title: 'Celtic Heritage Emerald Tweed',
    category: 'Irish',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    tags: ['tweed', 'celtic', 'emerald', 'driver']
  },
  {
    id: 'photo-irish-3',
    title: 'Irish Fairway Links Greens',
    category: 'Irish',
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
    tags: ['links', 'ireland', 'grass', 'custom']
  },

  // Funny & Banter
  {
    id: 'photo-funny-1',
    title: '3-Putt Prodigy Banter Edition',
    category: 'Funny',
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
    tags: ['funny', 'novelty', 'putt', 'banter', 'humor']
  },
  {
    id: 'photo-funny-2',
    title: 'Emergency Slice Driver Shield',
    category: 'Funny',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    tags: ['slice', 'driver', 'humor', 'quote']
  },
  {
    id: 'photo-funny-3',
    title: 'Water Hazard Diver Mascot',
    category: 'Funny',
    url: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1200',
    tags: ['water', 'hazard', 'golfball', 'banter']
  },

  // Animal
  {
    id: 'photo-animal-1',
    title: 'Scottish Highland Stag Headcover',
    category: 'Animal',
    url: 'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&q=80&w=1200',
    tags: ['stag', 'deer', 'animal', 'plush', 'driver']
  },
  {
    id: 'photo-animal-2',
    title: 'Fairway Gopher Bushy Mascot',
    category: 'Animal',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    tags: ['gopher', 'caddyshack', 'animal', 'mascot']
  },
  {
    id: 'photo-animal-3',
    title: 'Golden Retriever Leather Headcover',
    category: 'Animal',
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
    tags: ['dog', 'retriever', 'animal', 'leather']
  },

  // Golf Course & Scenery
  {
    id: 'photo-course-1',
    title: 'Championship 18th Hole Green',
    category: 'Golf Course',
    url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200',
    tags: ['banner', 'course', 'green', 'hero', 'landscape']
  },
  {
    id: 'photo-course-2',
    title: 'Morning Dew Fairway Sunset',
    category: 'Golf Course',
    url: 'https://images.unsplash.com/photo-1593111774601-dfbce7fe2f92?auto=format&fit=crop&q=80&w=1200',
    tags: ['sunset', 'dew', 'links', 'banner']
  },
  {
    id: 'photo-course-3',
    title: 'Classic Leather Golf Bag Showcase',
    category: 'Golf Course',
    url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200',
    tags: ['bag', 'clubs', 'collection', 'leather']
  }
];

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImage?: string;
  title?: string;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage = '',
  title = 'Select Photo from Library or Camera Roll'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'custom'>('upload');
  const [previewSelectedUrl, setPreviewSelectedUrl] = useState(currentImage);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      setUploadedFileName(file.name);
      try {
        const compressedDataUrl = await compressImageFile(file, 1200, 0.85);
        setPreviewSelectedUrl(compressedDataUrl);
      } catch (err) {
        alert('Failed to process selected image file.');
      }
    }
  };

  const filteredPhotos = PHOTO_LIBRARY.filter((photo) => {
    const matchesCategory = selectedCategory === 'All' || photo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleConfirmSelect = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E5DEC9] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#C9A24D]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24D] text-white flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">{title}</h3>
              <p className="text-xs text-gray-300">Upload directly from your camera roll / device or choose from our golf photo gallery</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Search Bar */}
        <div className="p-4 sm:p-6 bg-[#FAF8F5] border-b border-[#E5DEC9] space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Library vs Camera Roll vs Custom URL Tabs */}
            <div className="flex bg-[#E5DEC9]/40 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'upload'
                    ? 'bg-[#3B1C59] text-white shadow-xs font-extrabold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-[#C9A24D]" /> Camera Roll / Device
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'library'
                    ? 'bg-white text-[#1A1A1A] shadow-xs font-extrabold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24D]" /> Preset Photos
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'custom'
                    ? 'bg-white text-[#1A1A1A] shadow-xs font-extrabold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#C9A24D]" /> Image Web Link
              </button>
            </div>

            {/* Search input if library */}
            {activeTab === 'library' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search photos (e.g. leather, driver)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#C9A24D]"
                />
              </div>
            )}
          </div>

          {/* Category Filter Pills (if library tab) */}
          {activeTab === 'library' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {['All', 'Leather', 'Irish', 'Funny', 'Animal', 'Golf Course'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-[#E5DEC9] hover:border-[#C9A24D]'
                  }`}
                >
                  {cat === 'All' ? '🌟 All Photos' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body: Camera Roll Upload, Photo Grid, or Custom Input */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === 'upload' ? (
            <div className="max-w-md mx-auto py-4 space-y-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3B1C59]/40 hover:border-[#3B1C59] bg-[#FAF8F5] hover:bg-purple-50/50 rounded-3xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-3 shadow-xs"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#3B1C59] text-[#C9A24D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <p className="font-serif font-bold text-[#1A1A1A] text-base">
                    Click to Open Camera Roll or Files
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Select any photo from your phone, tablet, or computer (PNG, JPG, WEBP)
                  </p>
                </div>

                <button
                  type="button"
                  className="bg-[#3B1C59] text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider group-hover:bg-[#2A1341] transition-colors shadow-xs"
                >
                  📷 Choose From Device
                </button>
              </div>

              {previewSelectedUrl && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <FileImage className="w-4 h-4 text-[#3B1C59]" /> Selected Photo Preview:
                    </span>
                    {uploadedFileName && (
                      <span className="text-[11px] text-gray-500 truncate max-w-[180px]">
                        {uploadedFileName}
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-4/3 max-h-56 rounded-xl overflow-hidden border border-[#E5DEC9] bg-black/5 mx-auto">
                    <img
                      src={previewSelectedUrl}
                      alt="Uploaded camera roll selection"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-[11px] text-emerald-700 font-semibold text-center">
                    ✓ Photo loaded and ready to be applied across every page!
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'library' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const isSelected = previewSelectedUrl === photo.url;
                return (
                  <div
                    key={photo.id}
                    onClick={() => setPreviewSelectedUrl(photo.url)}
                    className={`group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-xs ${
                      isSelected
                        ? 'border-[#C9A24D] ring-4 ring-[#C9A24D]/20 scale-102'
                        : 'border-[#E5DEC9] hover:border-[#C9A24D]'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                      <p className="font-serif font-bold text-xs truncate">{photo.title}</p>
                      <span className="text-[9px] uppercase tracking-wider text-[#C9A24D] font-bold">
                        {photo.category}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#C9A24D] text-white p-1.5 rounded-full shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 max-w-lg mx-auto py-6">
              <label className="block text-xs font-bold text-gray-700">Paste Direct Image Web Address (URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrlInput}
                  onChange={(e) => {
                    setCustomUrlInput(e.target.value);
                    setPreviewSelectedUrl(e.target.value);
                  }}
                  className="flex-1 bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              {previewSelectedUrl && (
                <div className="pt-4 border-t border-[#F5F1E8]">
                  <p className="text-xs font-bold text-gray-700 mb-2">Image Preview:</p>
                  <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-[#E5DEC9] bg-gray-100 max-w-md mx-auto">
                    <img
                      src={previewSelectedUrl}
                      alt="Custom preview"
                      className="w-full h-full object-cover"
                      onError={() => alert('Unable to load image from provided URL.')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-[#E5DEC9] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {previewSelectedUrl && (
              <>
                <img
                  src={previewSelectedUrl}
                  alt="Selected thumbnail"
                  className="w-10 h-10 object-cover rounded-xl border border-[#E5DEC9] shrink-0"
                />
                <span className="text-xs font-medium text-gray-600 truncate hidden sm:inline-block">
                  Photo selected
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E5DEC9] text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={!previewSelectedUrl}
              onClick={() => handleConfirmSelect(previewSelectedUrl)}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Apply Selected Photo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
