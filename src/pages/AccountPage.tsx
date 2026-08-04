import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Package, Heart, MapPin, LogOut, ShieldCheck, Check, ArrowRight } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, loginUser, logoutUser, orders, wishlist, products, navigateTo, triggerToast, storeSettings } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>('orders');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      loginUser(emailInput, false);
      triggerToast('Signed in successfully! Welcome back.', 'success');
    }
  };

  const handleDemoAdminLogin = () => {
    loginUser('admin@golfwardrobe.com', true);
    triggerToast('Logged in as Wardrobe Admin', 'success');
    navigateTo('admin');
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E5DEC9] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center text-[#C9A24D] mx-auto">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Account Login</h1>
            <p className="text-xs text-gray-500">Sign in to track orders, manage saved addresses & wishlist.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="charles@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DEC9] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C9A24D]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A24D] hover:bg-[#b38e3c] text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Sign In to Account
            </button>
          </form>

          <div className="pt-4 border-t border-[#F5F1E8]">
            <button
              onClick={handleDemoAdminLogin}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A24D]" /> Demo Quick Sign-in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
      
      {/* Header Profile Box */}
      <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 sm:p-10 border border-[#C9A24D]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A24D] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user.name}</h1>
              {user.isAdmin && (
                <span className="bg-[#C9A24D] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              className="bg-[#C9A24D] hover:bg-[#b38e3c] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Open Admin Dashboard
            </button>
          )}
          <button
            onClick={logoutUser}
            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5DEC9] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'orders' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" /> Order History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'wishlist' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-4 h-4" /> Saved Wishlist ({wishlistProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 transition-colors relative ${
            activeTab === 'addresses' ? 'text-[#C9A24D] border-b-2 border-[#C9A24D]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" /> Saved Addresses
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-[#E5DEC9] text-center space-y-3">
              <p className="font-serif text-lg font-bold text-gray-800">No orders placed yet</p>
              <button onClick={() => navigateTo('shop')} className="bg-[#C9A24D] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5F1E8] text-xs">
                  <div>
                    <span className="font-serif font-bold text-base text-[#1A1A1A] block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-gray-400">Placed on {order.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                      {order.status}
                    </span>
                    <span className="font-serif text-base font-bold text-[#1A1A1A]">
                      {storeSettings.currencySymbol}{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E5DEC9]">
                      <img src={it.image} alt={it.name} className="w-12 h-12 object-cover rounded-xl border border-[#E5DEC9]" />
                      <div className="text-xs">
                        <p className="font-serif font-bold text-[#1A1A1A] line-clamp-1">{it.name}</p>
                        <p className="text-gray-500">Qty: {it.quantity} • {it.clubFit}</p>
                        <p className="font-semibold text-gray-900">{storeSettings.currencySymbol}{(it.price * it.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-[#E5DEC9] text-center space-y-3">
              <p className="font-serif text-lg font-bold text-gray-800">Your wishlist is empty</p>
              <button onClick={() => navigateTo('shop')} className="bg-[#C9A24D] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">
                Explore Collection
              </button>
            </div>
          ) : (
            wishlistProducts.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border border-[#E5DEC9] space-y-3">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-2xl bg-[#F5F1E8]" />
                <h4 className="font-serif text-sm font-bold text-[#1A1A1A] line-clamp-1">{p.name}</h4>
                <p className="font-serif text-sm font-bold">{storeSettings.currencySymbol}{p.price.toFixed(2)}</p>
                <button
                  onClick={() => navigateTo('product', { productId: p.id })}
                  className="w-full bg-[#1A1A1A] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#C9A24D]"
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5DEC9] space-y-2 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-serif text-sm font-bold text-[#1A1A1A]">Primary Shipping Address</span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">DEFAULT</span>
            </div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-gray-600">14 Kensington Park Gardens</p>
            <p className="text-gray-600">Flat 4, London, W11 3HB</p>
            <p className="text-gray-600">United Kingdom</p>
          </div>
        </div>
      )}

    </div>
  );
};
