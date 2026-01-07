
import React, { useState } from 'react';
import TranslatedInput from './TranslatedInput';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onStartCheckout: (discountApplied: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty, onStartCheckout }) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  const getItemPrice = (item: CartItem) => {
    let price = item.price;
    
    // Add bundle pricing if selected
    if (item.bundleId && item.bundles) {
      const bundle = item.bundles.find(b => b.id === item.bundleId);
      if (bundle) price = bundle.price;
    }
    
    // Add variant pricing
    if (item.selectedVariants && item.variants) {
      Object.entries(item.selectedVariants).forEach(([type, optionId]) => {
        const variant = item.variants?.find(v => v.type === type);
        const option = variant?.options.find(o => o.id === optionId);
        if (option?.price) {
          price += option.price;
        }
      });
    }
    
    return price;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);
  const discount = subtotal * discountApplied;
  const total = subtotal - discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'TINY20') {
      setDiscountApplied(0.2);
    } else {
      alert('Invalid Promo Code');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-500 animate-in slide-in-from-right">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
            Shopping Bag 
            <span className="text-sm font-normal text-gray-400">({items.length})</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-bag-shopping text-4xl opacity-20"></i>
              </div>
              <p className="text-lg font-bold">Your bag is empty</p>
              <button onClick={onClose} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg">Start Shopping</button>
            </div>
          ) : (
            items.map((item, idx) => {
              const bundle = item.bundleId ? item.bundles?.find(b => b.id === item.bundleId) : null;
              const itemCount = bundle ? bundle.count : 1; // Number of items in the bundle
              return (
                <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {bundle && itemCount > 1 && (
                      <div className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        ×{itemCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedColor && !item.bundleItems && <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded-full font-black uppercase text-gray-500">{item.selectedColor}</span>}
                          {bundle && <span className="text-[9px] bg-indigo-50 px-2 py-0.5 rounded-full font-black uppercase text-indigo-600">{bundle.name} Package</span>}
                          {item.selectedVariants && !item.bundleItems && Object.entries(item.selectedVariants).map(([type, value]) => {
                            const variant = item.variants?.find(v => v.type === type);
                            const option = variant?.options.find(o => o.id === value);
                            return option ? (
                              <span key={type} className="text-[9px] bg-purple-50 px-2 py-0.5 rounded-full font-black uppercase text-purple-600">
                                {option.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                        {/* Show individual bundle item selections */}
                        {item.bundleItems && item.bundleItems.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.bundleItems.map((bundleItem, bidx) => (
                              <div key={bidx} className="text-[9px] text-gray-600 flex gap-1 flex-wrap">
                                <span className="font-black">#{bidx + 1}:</span>
                                {bundleItem.color && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">{bundleItem.color}</span>}
                                {bundleItem.variants && Object.entries(bundleItem.variants).map(([type, value]) => {
                                  const variant = item.variants?.find(v => v.type === type);
                                  const option = variant?.options.find(o => o.id === value);
                                  return option ? (
                                    <span key={type} className="bg-purple-50 px-1.5 py-0.5 rounded font-bold text-purple-600">
                                      {option.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="text-gray-400 hover:text-indigo-600"><i className="fa-solid fa-minus text-[10px]"></i></button>
                        <span className="font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} className="text-gray-400 hover:text-indigo-600"><i className="fa-solid fa-plus text-[10px]"></i></button>
                      </div>
                      <p className="text-indigo-600 font-black text-sm sm:text-base">${(getItemPrice(item) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t bg-gray-50 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <TranslatedInput 
                  type="text" 
                  placeholderFallback="Promo code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
                <button 
                  onClick={handleApplyPromo}
                  className="bg-gray-900 text-white px-4 rounded-xl text-xs font-black uppercase"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>TINY20 Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-indigo-600 font-black uppercase text-[10px]">Free Express</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => onStartCheckout(discountApplied)}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Secure Checkout
              <i className="fa-solid fa-lock text-sm"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
