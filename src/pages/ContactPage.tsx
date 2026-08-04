import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Phone, MapPin, MessageSquare, ChevronDown, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { triggerToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion Toggle state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsSubmitted(true);
      triggerToast('Thank you! Your message has been routed to our client care team.', 'success');
    }
  };

  const faqs = [
    {
      q: 'Will your headcovers fit my 460cc Driver?',
      a: 'Yes, absolutely! All of our Driver headcovers are engineered to fit standard and oversized 460cc driver heads (including TaylorMade, Titleist, Callaway, PING, Cobra, and Mizuno).'
    },
    {
      q: 'What is your delivery timeframe for Ireland and International orders?',
      a: 'Ireland Standard An Post Tracked delivery takes 1-2 business days. Next-Day Express Priority Courier delivers the following working day. International express shipping typically takes 3-6 business days.'
    },
    {
      q: 'Are your leather headcovers waterproof?',
      a: 'Yes! Our full-grain Florentine leather headcovers undergo a proprietary hydrophobic wax seal during tanning, protecting the leather against rain and wet course conditions.'
    },
    {
      q: 'Do you offer corporate or custom club embroidery?',
      a: 'Yes, we accept bespoke club and corporate orders starting at minimum quantities of 20 pieces. Contact concierge@thegolfwardrobe.com for custom digital mockups.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-16">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#C9A24D]">
          Client Concierge & Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A1A1A]">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-light">
          Have a question about sizing, delivery, or custom embroidery? Our team is available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Contact Form Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] pb-3 border-b border-[#F5F1E8]">
            Send Us a Message
          </h2>

          {isSubmitted ? (
            <div className="p-8 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9] text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Message Sent</h3>
              <p className="text-xs text-gray-600">
                Thank you, {name}. A member of our London client care team will respond to {email} within 4 business hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-[#C9A24D] font-bold hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Charles Sterling"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="charles@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Order Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GW-10024"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Message Detail</label>
                <textarea
                  required
                  rows={5}
                  placeholder="How can our concierge assist your game today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl p-3.5 focus:outline-none focus:border-[#C9A24D]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#C9A24D] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>

        {/* Info & Location Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#1A1A1A] text-white p-8 rounded-3xl border border-[#C9A24D]/30 shadow-xl space-y-6">
            <h3 className="font-serif text-xl font-bold text-white pb-3 border-b border-white/10">
              London Concierge HQ
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C9A24D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">The Golf Wardrobe Showroom</p>
                  <p className="text-gray-400">14 Kensington Park Gardens, London, W11 3HB, United Kingdom</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C9A24D] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Email Inquiries</p>
                  <p className="text-gray-400">concierge@thegolfwardrobe.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C9A24D] shrink-0" />
                <div>
                  <p className="font-semibold text-white">Telephone Support</p>
                  <p className="text-gray-400">+44 (0) 20 7946 0912</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] pb-2 border-b border-[#F5F1E8]">
              Frequently Asked Questions
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-[#F5F1E8] rounded-2xl overflow-hidden bg-[#FAF8F5]">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-4 text-xs font-bold text-[#1A1A1A] flex items-center justify-between gap-2"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#C9A24D] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-[#E5DEC9]/50 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
