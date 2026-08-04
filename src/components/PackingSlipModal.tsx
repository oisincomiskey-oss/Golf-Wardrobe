import React from 'react';
import { Order } from '../types';
import { Printer, X, ShieldCheck, Package, CheckCircle2 } from 'lucide-react';

interface PackingSlipModalProps {
  order: Order;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* HEADER (Hidden on print) */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A24D]/30 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24D]/20 text-[#C9A24D] flex items-center justify-center border border-[#C9A24D]/40">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#C9A24D] font-bold uppercase tracking-widest block">Packing Slip</span>
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

        {/* PRINTABLE SLIP CONTAINER */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 print:p-0 print:overflow-visible">
          
          {/* Slip Header */}
          <div className="flex justify-between items-start border-b-2 border-[#1A1A1A] pb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
                THE GOLF WARDROBE
              </h1>
              <p className="text-xs font-serif italic text-gray-600 mt-0.5">
                Handcrafted Premium Golf Headcovers & Apparel • Dublin, Ireland
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Unit 4, Dublin Logistics Park, Ballymount, Dublin 12, Ireland
                <br />
                Email: support@thegolfwardrobe.com | Web: www.thegolfwardrobe.com
              </p>
            </div>

            <div className="text-right border-l-2 border-[#C9A24D] pl-4">
              <span className="bg-[#1A1A1A] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-sm block text-center mb-1">
                OFFICIAL PACKING SLIP
              </span>
              <div className="font-serif font-bold text-xl text-[#1A1A1A]">{order.orderNumber}</div>
              <div className="text-xs font-bold text-gray-600">Date: {order.date}</div>
              <div className="text-xs text-emerald-700 font-bold mt-1">Status: {order.status}</div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5DEC9] print:bg-white print:border-gray-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A24D] block mb-1">
                SHIP TO CUSTOMER
              </span>
              <h3 className="font-bold text-base text-[#1A1A1A]">
                {order.customer.firstName} {order.customer.lastName}
              </h3>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                {order.customer.address}
                {order.customer.apartment && <><br />{order.customer.apartment}</>}
                <br />
                {order.customer.city}, {order.customer.postcode}
                <br />
                <strong className="text-black uppercase">{order.customer.country}</strong>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A24D] block mb-1">
                CONTACT & DISPATCH INFO
              </span>
              <p className="text-xs text-gray-700 space-y-1">
                <div><strong>Email:</strong> {order.customer.email}</div>
                <div><strong>Phone:</strong> {order.customer.phone || 'N/A'}</div>
                <div><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus || 'Paid'})</div>
                <div><strong>Carrier:</strong> {order.carrier || 'An Post Express'}</div>
                {order.trackingNumber && <div><strong>Tracking:</strong> <span className="font-mono">{order.trackingNumber}</span></div>}
              </p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A] border-b border-gray-200 pb-1">
              Package Contents
            </h3>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-[#1A1A1A] text-white">
                  <th className="py-2.5 px-3 font-bold uppercase">Item Description</th>
                  <th className="py-2.5 px-3 font-bold uppercase">Fit / Spec</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-bold uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{item.name}</div>
                      {item.customConfig && (
                        <div className="mt-1 bg-amber-50 p-2 rounded border border-amber-200 text-[10px] text-amber-950 space-y-0.5">
                          <span className="font-bold text-[#C9A24D] block">✨ Custom Headcover Specifications:</span>
                          <div>• Type: {item.customConfig.type}</div>
                          <div>• Material: {item.customConfig.material} ({item.customConfig.baseColor})</div>
                          {item.customConfig.customText && <div>• Custom Text: "{item.customConfig.customText}" ({item.customConfig.fontFamily})</div>}
                          {item.customConfig.descriptionNotes && <div>• Special Instructions: "{item.customConfig.descriptionNotes}"</div>}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {item.clubFit || 'Standard'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-base text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      €{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY TOTALS */}
          <div className="flex justify-between items-end border-t-2 border-black pt-4">
            <div className="max-w-md text-[11px] text-gray-600 space-y-1">
              <span className="font-bold text-black block">Quality Assured Handcrafted Guarantee:</span>
              <p>
                Every headcover in this package has passed our Dublin artisan quality inspection. If you have any questions or require care instructions, please email <strong className="text-black">support@thegolfwardrobe.com</strong> quoting your Order #{order.orderNumber}.
              </p>
            </div>

            <div className="w-56 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount:</span>
                  <span>-€{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping ({order.carrier || 'Standard'}):</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `€${order.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black border-t-2 border-black pt-1">
                <span>Total Paid:</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* THANK YOU FOOTER */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="font-serif italic text-sm text-[#1A1A1A]">
              Thank you for choosing The Golf Wardrobe. Play well on the greens!
            </p>
          </div>

        </div>

        {/* MODAL FOOTER ACTIONS (Hidden on print) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-[#E5DEC9] flex items-center justify-between print:hidden shrink-0">
          <span className="text-xs text-gray-500">Includes complete item specifications & custom notes</span>
          <button
            onClick={handlePrint}
            className="bg-[#1A1A1A] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#C9A24D]" /> Print Packing Slip
          </button>
        </div>

      </div>
    </div>
  );
};
