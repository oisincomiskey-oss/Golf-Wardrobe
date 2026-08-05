import React, { useState } from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { Send, X, Copy, Check, Truck, Mail, Calendar, ExternalLink } from 'lucide-react';

interface ShippingNotificationModalProps {
  order: Order;
  onClose: () => void;
}

export const ShippingNotificationModal: React.FC<ShippingNotificationModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus, triggerToast } = useStore();

  const [carrier, setCarrier] = useState(order.carrier || 'An Post');
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || `AP${Math.floor(10000000 + Math.random() * 90000000)}IE`
  );
  
  // Estimated delivery based on destination
  const isIE = order.customer.country.toLowerCase().includes('ireland');
  const isUK = order.customer.country.toLowerCase().includes('united kingdom') || order.customer.country.toLowerCase().includes('uk');
  const defaultETA = isIE ? '1-2 Business Days' : isUK ? '2-3 Business Days' : '4-7 Business Days';

  const [estimatedDelivery, setEstimatedDelivery] = useState(defaultETA);
  const [customNote, setCustomNote] = useState(
    'Your handcrafted golf headcovers have been carefully packaged and dispatched from our Dublin logistics studio.'
  );
  const [copied, setCopied] = useState(false);

  const emailSubject = `Order #${order.orderNumber} Dispatched! Your Tracking Details - The Golf Wardrobe`;
  
  const emailBody = `Hi ${order.customer.firstName},

Great news! Your order #${order.orderNumber} from The Golf Wardrobe has been packed and handed over to ${carrier} for fast delivery.

🚚 SHIPPING & TRACKING DETAILS:
• Carrier: ${carrier}
• Tracking Number: ${trackingNumber}
• Estimated Delivery: ${estimatedDelivery}
• Shipping Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.country}

📦 ORDER SUMMARY:
${order.items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}

${customNote}

You can track your package status directly on the ${carrier} official portal or reply to this email if you need any assistance with your delivery.

Thank you for shopping with The Golf Wardrobe!

Warm regards,
The Golf Wardrobe Fulfillment Team
Dublin, Ireland`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    triggerToast('Notification email text copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendNotification = () => {
    updateOrderStatus(order.id, 'Shipped', trackingNumber, carrier);
    triggerToast(`Order status updated to Shipped with ${carrier} tracking!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A24D]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#C9A24D] font-bold uppercase tracking-widest block">Customer Dispatch Notification</span>
              <h2 className="font-serif text-lg font-bold text-white">Order #{order.orderNumber}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DEC9] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 font-bold text-gray-900"
                >
                  <option value="An Post">An Post (Ireland Official)</option>
                  <option value="DPD">DPD Courier</option>
                  <option value="DHL">DHL Express</option>
                  <option value="UPS">UPS Express</option>
                  <option value="FedEx">FedEx International</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 font-mono font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Estimated Delivery Window</label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full bg-white border border-[#E5DEC9] rounded-xl px-3 py-2 font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Email</label>
                <input
                  type="text"
                  disabled
                  value={order.customer.email}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-gray-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Custom Note / Care Instructions</label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#E5DEC9] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#C9A24D]"
              />
            </div>
          </div>

          {/* EMAIL PREVIEW BOX */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-gray-700">
              <span>Customer Notification Preview</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-[#C9A24D] hover:text-[#b38e3c] flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Email Text'}
              </button>
            </div>

            <div className="bg-[#1A1A1A] text-gray-200 font-mono text-xs p-4 rounded-2xl border border-gray-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              <span className="text-[#C9A24D] font-bold">Subject: {emailSubject}</span>
              {'\n\n'}
              {emailBody}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 border-t border-[#E5DEC9] flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">Updates live website tracking info & marks order as Shipped</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendNotification}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" /> Save Tracking & Mark Shipped
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
