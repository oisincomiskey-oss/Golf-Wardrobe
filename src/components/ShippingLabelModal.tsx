import React, { useState } from 'react';
import { Order, ShippingLabelData, CustomsDeclaration } from '../types';
import { useStore } from '../context/StoreContext';
import { isCustomsRequired } from '../utils/shipping';
import { Printer, X, Check, Truck, ShieldCheck, FileText, Globe, Package, AlertCircle, Copy } from 'lucide-react';

interface ShippingLabelModalProps {
  order: Order;
  onClose: () => void;
  onLabelGenerated?: (label: ShippingLabelData) => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ order, onClose, onLabelGenerated }) => {
  const { generateOrderLabel, triggerToast, updateOrderStatus } = useStore();

  const totalHeadcovers = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const defaultWeight = Math.max(0.3, Math.round(totalHeadcovers * 0.25 * 100) / 100);

  const [carrier, setCarrier] = useState<'An Post' | 'DPD' | 'DHL' | 'UPS' | 'FedEx'>(
    (order.carrier as any) || 'An Post'
  );
  const [parcelWeight, setParcelWeight] = useState<number>(
    order.shippingLabel?.parcelWeightKg || defaultWeight
  );
  const [dimensions, setDimensions] = useState({
    length: order.shippingLabel?.dimensionsCm.length || 30,
    width: order.shippingLabel?.dimensionsCm.width || 20,
    height: order.shippingLabel?.dimensionsCm.height || 10,
  });
  const [productDescription, setProductDescription] = useState<string>(
    order.shippingLabel?.productDescription || 'Golf Headcover'
  );

  // Address fields (editable)
  const [recipient, setRecipient] = useState({ ...order.customer });

  // Customs Fields
  const customsNeeded = isCustomsRequired(recipient.country);
  const [hsCode, setHsCode] = useState<string>(
    order.shippingLabel?.customsInfo?.hsCode || '9506.39.00'
  );
  const [customsValue, setCustomsValue] = useState<number>(
    order.shippingLabel?.customsInfo?.itemValueEuro || order.subtotal
  );
  const [declarationType, setDeclarationType] = useState<'Commercial Goods' | 'Merchandise' | 'Gift' | 'Sample'>(
    order.shippingLabel?.customsInfo?.declarationType || 'Commercial Goods'
  );

  // Active generated label state
  const [labelData, setLabelData] = useState<ShippingLabelData | null>(
    order.shippingLabel || null
  );

  const handleGenerateLabel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const generated = generateOrderLabel(order.id, carrier, parcelWeight);
      
      // Attach customs info if required
      if (customsNeeded) {
        generated.customsInfo = {
          hsCode,
          description: productDescription,
          countryOfOrigin: 'IE',
          declarationType,
          itemValueEuro: customsValue,
          weightKg: parcelWeight
        };
      }
      generated.recipientAddress = recipient;
      generated.productDescription = productDescription;
      generated.dimensionsCm = dimensions;

      setLabelData(generated);
      if (onLabelGenerated) onLabelGenerated(generated);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to generate label', 'error');
    }
  };

  const handlePrintLabel = () => {
    if (!labelData) {
      handleGenerateLabel();
    }
    window.print();
  };

  const handleMarkShipped = () => {
    if (!labelData) {
      handleGenerateLabel();
    }
    const currentTracking = labelData?.trackingNumber || order.trackingNumber || 'AP' + Math.floor(10000000 + Math.random() * 90000000) + 'IE';
    updateOrderStatus(order.id, 'Shipped', currentTracking, carrier);
    triggerToast(`Order #${order.orderNumber} marked as Shipped via ${carrier}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* MODAL HEADER (Hidden on print) */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A24D]/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center border border-[#C9A24D]/40">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#C9A24D] text-[#1A1A1A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Official Shipping Label Integration
                </span>
                <span className="text-xs text-gray-400">Order #{order.orderNumber}</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-white mt-0.5">
                Generate & Print Parcel Shipping Label
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
          
          {/* CARRIER SELECTION & EDITABLE PARCEL DETAILS FORM (Hidden on print) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E5DEC9] print:hidden">
            
            {/* Carrier Selection */}
            <div className="md:col-span-12 space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Select Postal / Shipping Carrier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { name: 'An Post', label: 'An Post (Ireland Official)', flag: '🇮🇪', color: 'border-emerald-600 bg-emerald-50 text-emerald-950' },
                  { name: 'DPD', label: 'DPD Courier', flag: '🇪🇺', color: 'border-red-600 bg-red-50 text-red-950' },
                  { name: 'DHL', label: 'DHL Express', flag: '🌐', color: 'border-amber-600 bg-amber-50 text-amber-950' },
                  { name: 'UPS', label: 'UPS Express', flag: '🇺🇸', color: 'border-amber-900 bg-amber-950/10 text-amber-950' },
                  { name: 'FedEx', label: 'FedEx Int.', flag: '🌐', color: 'border-purple-600 bg-purple-50 text-purple-950' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCarrier(c.name as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                      carrier === c.name ? `${c.color} shadow-xs ring-2 ring-offset-1 ring-current` : 'border-[#E5DEC9] bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Parcel Weight & Dimensions */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Parcel Weight (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={parcelWeight}
                onChange={(e) => setParcelWeight(parseFloat(e.target.value) || 0.3)}
                className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A24D]"
              />
              <span className="text-[10px] text-gray-500">Auto-calculated: ~0.25kg per headcover</span>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Dimensions (L x W x H cm)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({ ...dimensions, length: parseInt(e.target.value) || 30 })}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-2 text-xs font-bold text-center focus:outline-none"
                  placeholder="L"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 20 })}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-2 text-xs font-bold text-center focus:outline-none"
                  placeholder="W"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 10 })}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-2.5 py-2 text-xs font-bold text-center focus:outline-none"
                  placeholder="H"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                Product Description
              </label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#C9A24D]"
              />
            </div>

            {/* CUSTOMS DECLARATION SECTION FOR UK / US / NON-EU */}
            {customsNeeded ? (
              <div className="md:col-span-12 bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>Customs Declaration (CN22 / CN23) Required for {recipient.country}</span>
                  <span className="bg-amber-200 text-amber-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Non-EU / UK Destination</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">HS Tariff Code</label>
                    <input
                      type="text"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Customs Declared Value (€)</label>
                    <input
                      type="number"
                      value={customsValue}
                      onChange={(e) => setCustomsValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Declaration Type</label>
                    <select
                      value={declarationType}
                      onChange={(e) => setDeclarationType(e.target.value as any)}
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    >
                      <option value="Commercial Goods">Commercial Goods</option>
                      <option value="Merchandise">Merchandise</option>
                      <option value="Sample">Sample</option>
                      <option value="Gift">Gift</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-12 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Domestic / EU Destination ({recipient.country}) — No Customs Declaration CN22 required.</span>
              </div>
            )}

            {/* Editable Recipient Address */}
            <div className="md:col-span-12 space-y-2 pt-2 border-t border-[#E5DEC9]">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Recipient Shipping Address
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={`${recipient.firstName} ${recipient.lastName}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' ');
                      setRecipient({
                        ...recipient,
                        firstName: parts[0] || '',
                        lastName: parts.slice(1).join(' ') || ''
                      });
                    }}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Street Address</label>
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">City & Region</label>
                  <input
                    type="text"
                    value={recipient.city}
                    onChange={(e) => setRecipient({ ...recipient, city: e.target.value })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Eircode / Postcode</label>
                  <input
                    type="text"
                    value={recipient.postcode}
                    onChange={(e) => setRecipient({ ...recipient, postcode: e.target.value })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Country</label>
                  <input
                    type="text"
                    value={recipient.country}
                    onChange={(e) => setRecipient({ ...recipient, country: e.target.value })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={recipient.phone || ''}
                    onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                    className="w-full bg-white border border-[#E5DEC9] rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                type="button"
                onClick={() => handleGenerateLabel()}
                className="bg-[#3B1C59] hover:bg-[#2E1065] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#C9A24D]" /> Generate / Update Label Barcode
              </button>
            </div>

          </div>

          {/* OFFICIAL PRINTABLE SHIPPING LABEL PREVIEW */}
          <div className="border-2 border-black p-6 bg-white rounded-xl font-sans text-black max-w-xl mx-auto space-y-4 print:max-w-none print:w-full print:border-3 print:p-8">
            
            {/* Label Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-3">
                {carrier === 'An Post' && (
                  <div className="bg-emerald-800 text-white font-black text-xl px-3 py-1 rounded-sm uppercase tracking-wider">
                    AN POST 🇮🇪
                  </div>
                )}
                {carrier === 'DPD' && (
                  <div className="bg-red-600 text-white font-black text-xl px-3 py-1 rounded-sm uppercase tracking-wider">
                    DPD COURIER
                  </div>
                )}
                {carrier === 'DHL' && (
                  <div className="bg-amber-400 text-black font-black text-xl px-3 py-1 rounded-sm uppercase tracking-wider">
                    DHL EXPRESS
                  </div>
                )}
                {carrier === 'UPS' && (
                  <div className="bg-amber-950 text-amber-400 font-black text-xl px-3 py-1 rounded-sm uppercase tracking-wider">
                    UPS EXPRESS
                  </div>
                )}
                {carrier === 'FedEx' && (
                  <div className="bg-purple-900 text-white font-black text-xl px-3 py-1 rounded-sm uppercase tracking-wider">
                    FedEx INT
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block text-gray-600">REGISTERED PRIORITY</span>
                  <span className="font-mono font-bold text-xs">
                    {labelData ? labelData.serviceType : 'Express Standard Parcel'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="border-2 border-black px-2 py-1 font-black text-lg block">
                  PRIORITY
                </span>
                <span className="text-[10px] font-bold text-gray-500">WT: {parcelWeight.toFixed(2)} KG</span>
              </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-4 text-xs">
              {/* FROM / SENDER */}
              <div className="border-r border-gray-300 pr-3 space-y-0.5">
                <span className="font-bold uppercase text-[9px] text-gray-500 block">SENDER / RETURN ADDRESS:</span>
                <div className="font-bold text-sm text-black">The Golf Wardrobe</div>
                <div>Unit 4, Dublin Logistics Park</div>
                <div>Ballymount, Dublin 12</div>
                <div className="font-bold">IRELAND (IE)</div>
                <div className="text-[10px] text-gray-600">+353 1 800 465 392</div>
              </div>

              {/* TO / RECIPIENT */}
              <div className="space-y-0.5 pl-1">
                <span className="font-bold uppercase text-[9px] text-gray-500 block">SHIP TO / DELIVER TO:</span>
                <div className="font-black text-base uppercase text-black">
                  {recipient.firstName} {recipient.lastName}
                </div>
                <div className="font-bold text-sm">{recipient.address}</div>
                {recipient.apartment && <div>{recipient.apartment}</div>}
                <div className="font-bold text-sm">{recipient.city}, {recipient.postcode}</div>
                <div className="font-black text-base uppercase text-black">{recipient.country}</div>
                <div className="font-mono text-xs text-gray-800">TEL: {recipient.phone || 'N/A'}</div>
              </div>
            </div>

            {/* BARCODE SECTION */}
            <div className="text-center py-3 space-y-2 border-b-2 border-black">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                TRACKING NUMBER BARCODE ({carrier})
              </span>
              
              {/* Simulated High-Res Line Barcode SVG */}
              <div className="bg-white p-2 border border-black max-w-md mx-auto rounded-xs">
                <svg className="w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <rect width="300" height="60" fill="white" />
                  {/* Generate pseudo barcode bars */}
                  {[
                    2, 4, 1, 3, 5, 2, 1, 4, 2, 3, 1, 5, 2, 3, 4, 1, 2, 5, 3, 2, 1, 4, 3, 2, 5, 1, 3, 2, 4,
                    1, 5, 2, 3, 1, 4, 2, 5, 3, 1, 2, 4, 3, 2, 5, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 5, 3, 1, 2
                  ].map((w, idx) => (
                    <rect
                      key={idx}
                      x={idx * 5}
                      y="0"
                      width={w > 3 ? 3 : w > 1 ? 2 : 1}
                      height="60"
                      fill="black"
                    />
                  ))}
                </svg>
                <div className="font-mono font-black text-lg tracking-widest text-black mt-1">
                  {labelData ? labelData.trackingNumber : (order.trackingNumber || 'AP948201948IE')}
                </div>
              </div>
            </div>

            {/* CN22 CUSTOMS ATTACHMENT IF UK / NON-EU */}
            {customsNeeded && (
              <div className="border border-black p-3 bg-gray-50 text-[10px] space-y-1 rounded-xs">
                <div className="flex justify-between font-bold border-b border-black pb-1 uppercase">
                  <span>CUSTOMS DECLARATION CN22</span>
                  <span>HS: {hsCode}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-gray-500 block">Contents:</span>
                    <span className="font-bold">{productDescription}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Value (€):</span>
                    <span className="font-bold">€{customsValue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Origin:</span>
                    <span className="font-bold">Ireland (IE)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Label Footer */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 font-mono">
              <span>Order #{order.orderNumber}</span>
              <span>Headcovers x{totalHeadcovers}</span>
              <span>Logistics Hub Dublin</span>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER ACTIONS (Hidden on print) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <div className="text-xs text-gray-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tracking number will automatically save to order upon label print.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrintLabel}
              className="flex-1 sm:flex-none bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>

            <button
              type="button"
              onClick={handleMarkShipped}
              className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" /> Mark as Shipped & Save Tracking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
