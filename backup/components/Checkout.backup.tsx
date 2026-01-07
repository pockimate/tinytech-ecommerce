import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types';
import { TranslatedText } from './TranslatedText';
import { createPayPalOrder, capturePayPalOrder, isPayPalConfigured } from '../services/paypal';

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discountApplied?: number; // 折扣比例 (0.2 = 20%)
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

// PayPal Card Fields类型定义
declare global {
  interface Window {
    paypal: any;
    paypalCardFields: any;
  }
}

const Checkout: React.FC<CheckoutProps> = ({
  cart,
  subtotal,
  shippingCost,
  total,
  discountApplied = 0,
  onBack,
  onOrderComplete
}) => {
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Italy'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Partial<ShippingInfo & PaymentInfo>>({});

  const validateShipping = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};
    
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    if (paymentMethod === 'paypal') return true;

    const newErrors: Partial<PaymentInfo> = {};
    
    if (!paymentInfo.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    if (!paymentInfo.cardHolder.trim()) newErrors.cardHolder = 'Cardholder name is required';
    if (!paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Format: MM/YY';
    }
    if (!paymentInfo.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping() || !validatePayment()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderId = 'ORD-' + Date.now();
    onOrderComplete(orderId);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const actualShippingCost = shippingMethod === 'express' ? 15 : shippingCost;
  const actualTotal = subtotal - subtotal * discountApplied + actualShippingCost;

  // PayPal按钮容器
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const paypalAltContainerRef = useRef<HTMLDivElement | null>(null);
  const googlePayContainerRef = useRef<HTMLDivElement | null>(null);
  const googlePayAltContainerRef = useRef<HTMLDivElement | null>(null);
  // PayPal Card Fields容器
  const cardFieldsContainerRef = useRef<HTMLDivElement | null>(null);
  // SDK加载状态
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  // Card Fields实例
  const [cardFields, setCardFields] = useState<any>(null);

  // 加载PayPal SDK
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
    
    if (!clientId) {
      console.warn('[PayPal] No Client ID configured');
      return;
    }
    
    if (window.paypal && window.paypal.Buttons) {
      console.log('[PayPal] SDK already loaded with Buttons');
      setPaypalSDKLoaded(true);
      return;
    }
    
    console.log('[PayPal] Loading SDK from CDN...');
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&components=buttons,card-fields`;
    script.async = true;
    script.onload = () => {
      console.log('[PayPal] SDK loaded, checking...');
      setTimeout(() => {
        if (window.paypal && window.paypal.Buttons) {
          console.log('[PayPal] Buttons available');
          setPaypalSDKLoaded(true);
        } else {
          console.error('[PayPal] Buttons not available after SDK load');
        }
      }, 500);
    };
    script.onerror = (event) => {
      console.error('[PayPal] SDK load failed:', event);
    };
    document.head.appendChild(script);
  }, []);


  // 渲染PayPal按钮（黄色）
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.Buttons || !paypalAltContainerRef.current) return;
    
    console.log('[PayPal] Rendering PayPal button...');
    
    const container = paypalAltContainerRef.current;
    container.innerHTML = '';
    
    window.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 55,
      },
      createOrder: () => {
        setIsProcessing(true);
        return createPayPalOrder(actualTotal, 'EUR', 'TinyTech Order')
          .then(order => order?.id || Promise.reject('No order ID'));
      },
      onApprove: (data) => {
        capturePayPalOrder(data.orderID).then(success => {
          if (success) {
            onOrderComplete(data.orderID);
          } else {
            setIsProcessing(false);
            alert('Payment capture failed. Please try again.');
          }
        });
      },
      onCancel: () => {
        setIsProcessing(false);
        console.log('[PayPal] Payment was cancelled by user');
      },
      onError: (err) => {
        setIsProcessing(false);
        console.error('[PayPal] Payment error:', err);
        alert('Payment failed. Please try again or use a different payment method.');
      }
    }).render(container).catch(console.error);
  }, [paypalSDKLoaded]);

  // 渲染快速支付 PayPal 按钮（顶部）
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.Buttons || !paypalContainerRef.current) return;
    
    console.log('[PayPal Express] Rendering express PayPal button...');
    
    const container = paypalContainerRef.current;
    container.innerHTML = '';
    
    window.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 48,
      },
      createOrder: () => {
        setIsProcessing(true);
        return createPayPalOrder(actualTotal, 'EUR', 'TinyTech Express Order')
          .then(order => order?.id || Promise.reject('No order ID'));
      },
      onApprove: (data) => {
        capturePayPalOrder(data.orderID).then(success => {
          if (success) {
            onOrderComplete(data.orderID);
          } else {
            setIsProcessing(false);
            alert('Payment capture failed. Please try again.');
          }
        });
      },
      onCancel: () => {
        setIsProcessing(false);
        console.log('[PayPal Express] Payment was cancelled by user');
      },
      onError: (err) => {
        setIsProcessing(false);
        console.error('[PayPal Express] Payment error:', err);
        alert('Payment failed. Please try again or use a different payment method.');
      }
    }).render(container).catch(console.error);
  }, [paypalSDKLoaded, actualTotal]);

  // 渲染Google Pay按钮
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.Buttons || !googlePayAltContainerRef.current) return;
    
    console.log('[Google Pay] Rendering button...');
    
    const container = googlePayAltContainerRef.current;
    container.innerHTML = '';
    
    // 检查Google Pay是否可用
    if (!window.paypal.FUNDING.GOOGLEPAY) {
      console.warn('[Google Pay] Not available in this region/browser');
      container.innerHTML = '<span class="text-gray-400 text-sm">Google Pay not available</span>';
      return;
    }
    
    window.paypal.Buttons({
      fundingSource: 'googlepay',
      style: {
        layout: 'horizontal',
        color: 'black',
        height: 45,
      },
      createOrder: () => {
        setIsProcessing(true);
        return createPayPalOrder(actualTotal, 'EUR', 'TinyTech Order')
          .then(order => order?.id || Promise.reject('No order ID'));
      },
      onApprove: (data) => {
        capturePayPalOrder(data.orderID).then(success => {
          if (success) {
            onOrderComplete(data.orderID);
          } else {
            setIsProcessing(false);
          }
        });
      },
      onCancel: () => {
        setIsProcessing(false);
        console.log('[Google Pay] Payment was cancelled by user');
      },
      onError: (err) => {
        console.error('[Google Pay] Payment error:', err);
        setIsProcessing(false);
        alert('Google Pay failed. Please try again or use a different payment method.');
      }
    }).render(container).catch(err => {
      console.error('[Google Pay] Render error:', err);
      container.innerHTML = '<span class="text-gray-400 text-sm">Google Pay not available</span>';
    });
  }, [paypalSDKLoaded]);

  // 渲染快速支付 Google Pay 按钮（顶部）
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.Buttons || !googlePayContainerRef.current) return;
    
    console.log('[Google Pay Express] Rendering express Google Pay button...');
    
    const container = googlePayContainerRef.current;
    container.innerHTML = '';
    
    // 检查Google Pay是否可用
    if (!window.paypal.FUNDING || !window.paypal.FUNDING.GOOGLEPAY) {
      console.warn('[Google Pay Express] Not available in this region/browser');
      // 显示备用按钮
      container.innerHTML = `
        <button
          onclick="alert('Google Pay is not available in your region. Please use PayPal or credit card.')"
          class="w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm"
          style="height: 48px;"
        >
          <svg width="18" height="7" viewBox="0 0 18 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.3584 0.755859H4.8584V6.24414H7.3584V0.755859Z" fill="white"/>
            <path d="M11.8584 0.755859C11.2584 0.755859 10.7584 0.955859 10.3584 1.35586V0.755859H7.8584V6.24414H10.3584V4.05586C10.3584 3.25586 10.7584 2.85586 11.3584 2.85586C11.9584 2.85586 12.2584 3.25586 12.2584 4.05586V6.24414H14.7584V3.65586C14.7584 1.85586 13.6584 0.755859 11.8584 0.755859Z" fill="white"/>
            <path d="M3.3584 0.755859C2.7584 0.755859 2.2584 0.955859 1.8584 1.35586V0.755859H-0.6416V6.24414H1.8584V4.05586C1.8584 3.25586 2.2584 2.85586 2.8584 2.85586C3.4584 2.85586 3.7584 3.25586 3.7584 4.05586V6.24414H6.2584V3.65586C6.2584 1.85586 5.1584 0.755859 3.3584 0.755859Z" fill="white"/>
          </svg>
          <span>Google Pay</span>
        </button>
      `;
      return;
    }
    
    window.paypal.Buttons({
      fundingSource: window.paypal.FUNDING.GOOGLEPAY,
      style: {
        layout: 'horizontal',
        color: 'black',
        height: 48,
      },
      createOrder: () => {
        setIsProcessing(true);
        return createPayPalOrder(actualTotal, 'EUR', 'TinyTech Express Order')
          .then(order => order?.id || Promise.reject('No order ID'));
      },
      onApprove: (data) => {
        capturePayPalOrder(data.orderID).then(success => {
          if (success) {
            onOrderComplete(data.orderID);
          } else {
            setIsProcessing(false);
          }
        });
      },
      onCancel: () => {
        setIsProcessing(false);
        console.log('[Google Pay Express] Payment was cancelled by user');
      },
      onError: (err) => {
        console.error('[Google Pay Express] Payment error:', err);
        setIsProcessing(false);
        alert('Google Pay failed. Please try again or use a different payment method.');
      }
    }).render(container).catch(err => {
      console.error('[Google Pay Express] Render error:', err);
      // 显示备用按钮
      container.innerHTML = `
        <button
          onclick="alert('Google Pay is not available in your region. Please use PayPal or credit card.')"
          class="w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm"
          style="height: 48px;"
        >
          <svg width="18" height="7" viewBox="0 0 18 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.3584 0.755859H4.8584V6.24414H7.3584V0.755859Z" fill="white"/>
            <path d="M11.8584 0.755859C11.2584 0.755859 10.7584 0.955859 10.3584 1.35586V0.755859H7.8584V6.24414H10.3584V4.05586C10.3584 3.25586 10.7584 2.85586 11.3584 2.85586C11.9584 2.85586 12.2584 3.25586 12.2584 4.05586V6.24414H14.7584V3.65586C14.7584 1.85586 13.6584 0.755859 11.8584 0.755859Z" fill="white"/>
            <path d="M3.3584 0.755859C2.7584 0.755859 2.2584 0.955859 1.8584 1.35586V0.755859H-0.6416V6.24414H1.8584V4.05586C1.8584 3.25586 2.2584 2.85586 2.8584 2.85586C3.4584 2.85586 3.7584 3.25586 3.7584 4.05586V6.24414H6.2584V3.65586C6.2584 1.85586 5.1584 0.755859 3.3584 0.755859Z" fill="white"/>
          </svg>
          <span>Google Pay</span>
        </button>
      `;
      (window as any).handleQuickPaySimulation = handleQuickPaySimulation;
    });
  }, [paypalSDKLoaded, actualTotal]);

  // 渲染PayPal Card Fields
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.CardFields || !cardFieldsContainerRef.current) return;
    
    console.log('[PayPal] Creating Card Fields...');
    
    if (!window.paypal?.CardFields) {
      console.warn('[PayPal] CardFields not available');
      return;
    }

    try {
      const cardFieldsInstance = window.paypal.CardFields({
        createOrder: () => {
          setIsProcessing(true);
          return createPayPalOrder(actualTotal, 'EUR', 'TinyTech Order')
            .then(order => order?.id || Promise.reject('No order ID'));
        },
        onApprove: (data) => {
          capturePayPalOrder(data.orderID).then(success => {
            if (success) {
              onOrderComplete(data.orderID);
            } else {
              setIsProcessing(false);
            }
          });
        },
        onCancel: () => setIsProcessing(false),
        onError: () => setIsProcessing(false)
      });

      // 等待实例准备好
      setTimeout(() => {
        try {
          if (cardFieldsInstance.renderCardNumberField) {
            cardFieldsInstance.renderCardNumberField('#paypal-card-number');
          }
          if (cardFieldsInstance.renderExpirationField) {
            cardFieldsInstance.renderExpirationField('#paypal-card-expiry');
          }
          if (cardFieldsInstance.renderCVVField) {
            cardFieldsInstance.renderCVVField('#paypal-card-cvv');
          }
          setCardFields(cardFieldsInstance);
        } catch (e) {
          console.error('[PayPal] Card Fields render error:', e);
        }
      }, 100);
    } catch (e) {
      console.error('[PayPal] Card Fields init error:', e);
    }
  }, [paypalSDKLoaded]);

  const showFallbackButton = (container: HTMLDivElement) => {
    container.innerHTML = `
      <button
        onClick={handleQuickPaySimulation}
        disabled={isProcessing}
        className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-50 shadow-sm"
      >
        <i className="fa-brands fa-paypal text-xl"></i>
        <span>Pay with PayPal</span>
      </button>
    `;
  };

  const showGooglePayFallback = (container: HTMLDivElement) => {
    container.innerHTML = `
      <button
        onClick={handleQuickPaySimulation}
        disabled={isProcessing}
        className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black hover:border-[#4285f4] hover:text-[#4285f4] transition-all disabled:opacity-50 shadow-sm"
      >
        <i className="fa-brands fa-google text-xl"></i>
        <span>Google Pay</span>
      </button>
    `;
  };

  const handleQuickPaySimulation = () => {
    // 这个函数应该只在真正的支付成功后调用，而不是作为备用方案
    console.log('[Quick Pay] This should only be called after successful payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <TranslatedText fallback="Back to Cart" />
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
          <TranslatedText fallback="Checkout" />
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            
            {/* Express Checkout Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-lg font-black text-gray-900 mb-2">
                  <TranslatedText fallback="Express checkout" />
                </h2>
                <p className="text-sm text-gray-500">
                  <TranslatedText fallback="Express Checkout" />
                </p>
              </div>
              
              <div className="flex gap-4 mb-6">
                {/* PayPal Express Button */}
                <div className="flex-1">
                  <div
                    ref={paypalContainerRef}
                    className="w-full"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                
                {/* Google Pay Express Button */}
                <div className="flex-1">
                  <div
                    ref={googlePayContainerRef}
                    className="w-full"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400 font-medium">
                  <TranslatedText fallback="OR" />
                </span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <i className="fa-solid fa-truck text-indigo-600"></i>
                <TranslatedText fallback="Shipping Information" />
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="Full Name" /> *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.fullName ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholder="Mario Rossi"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="Email" /> *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholder="mario@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <TranslatedText fallback="Phone" /> *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                    placeholder="+39 123 456 7890"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <TranslatedText fallback="Address" /> *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.address ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                    placeholder="Via Roma 123"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="City" /> *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.city ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholder="Milano"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="State" />
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="MI"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="ZIP" /> *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholder="20100"
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <TranslatedText fallback="Country" />
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Italy">Italy</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="CN">China</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <i className="fa-solid fa-box text-indigo-600"></i>
                <TranslatedText fallback="Shipping Method" />
              </h2>
              <div className="space-y-3">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === 'standard' ? 'border-indigo-600' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'standard' && (
                          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900"><TranslatedText fallback="Standard Shipping" /></p>
                        <p className="text-sm text-gray-500">5-7 business days</p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900"><TranslatedText fallback="Free" /></p>
                  </div>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === 'express' ? 'border-indigo-600' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'express' && (
                          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          <TranslatedText fallback="Express Shipping" />
                          <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full">FAST</span>
                        </p>
                        <p className="text-sm text-gray-500">2-3 business days</p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900">€15.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <i className="fa-solid fa-credit-card text-indigo-600"></i>
                <TranslatedText fallback="Payment Method" />
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <i className="fa-solid fa-credit-card text-2xl mb-2 block"></i>
                  <p className="text-sm"><TranslatedText fallback="Credit Card" /></p>
                </button>

                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <i className="fa-brands fa-paypal text-2xl mb-2 block"></i>
                  <p className="text-sm">PayPal</p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div>
                  {/* 传统卡表单 */}
                  <div id="legacy-card-form" className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <TranslatedText fallback="Card Number" /> *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({
                          ...paymentInfo,
                          cardNumber: formatCardNumber(e.target.value)
                        })}
                        maxLength={19}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        <TranslatedText fallback="Cardholder Name" /> *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cardHolder}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.cardHolder ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                        placeholder="MARIO ROSSI"
                      />
                      {errors.cardHolder && (
                        <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <TranslatedText fallback="Expiry" /> *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setPaymentInfo({ ...paymentInfo, expiryDate: value });
                          }}
                          maxLength={5}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPaymentInfo({ ...paymentInfo, cvv: value });
                          }}
                          maxLength={4}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.cvv ? 'border-red-500' : 'border-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                          placeholder="123"
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <i className="fa-brands fa-paypal text-5xl text-blue-600 mb-3"></i>
                    <p className="text-gray-600 font-medium">
                      <TranslatedText fallback="You will be redirected to PayPal to complete your payment" />
                    </p>
                  </div>
                  
                  {/* PayPal Button */}
                  <div
                    ref={paypalAltContainerRef}
                    className="w-full"
                    style={{ minHeight: '55px' }}
                  />
                  
                  {/* Google Pay as secondary option */}
                  <div
                    ref={googlePayAltContainerRef}
                    className="w-full flex items-center justify-center"
                    style={{ minHeight: '45px' }}
                  />
                </div>
              )}

              {/* Place Order Button - for credit card */}
              {paymentMethod === 'card' && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <TranslatedText fallback="Processing..." />
                    </span>
                  ) : (
                    <TranslatedText fallback="Place Order" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-28">
              <h3 className="text-xl font-black mb-6"><TranslatedText fallback="Order Summary" /></h3>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500"><TranslatedText fallback="Qty" />: {item.quantity}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">{item.selectedColor}</p>
                      )}
                    </div>
                    <p className="font-black text-gray-900">€{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600"><TranslatedText fallback="Subtotal" /></span>
                  <span className="font-bold text-gray-900">€{subtotal.toFixed(2)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>
                      <TranslatedText fallback="Discount" /> ({(discountApplied * 100).toFixed(0)}%)
                    </span>
                    <span>-€{(subtotal * discountApplied).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600"><TranslatedText fallback="Shipping" /></span>
                  <span className="font-bold text-gray-900">
                    {actualShippingCost === 0 ? <TranslatedText fallback="Free" /> : `€${actualShippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-black text-gray-900 text-lg"><TranslatedText fallback="Total" /></span>
                  <span className="font-black text-2xl text-indigo-600">€{actualTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button - for PayPal, shown at bottom */}
              {paymentMethod === 'paypal' && (
                <button
                  onClick={() => {
                    // Trigger PayPal button click
                    const paypalBtn = paypalAltContainerRef.current?.querySelector('button');
                    if (paypalBtn) {
                      paypalBtn.click();
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-black text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <TranslatedText fallback="Processing..." />
                    </span>
                  ) : (
                    <TranslatedText fallback="Proceed to PayPal" />
                  )}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <i className="fa-solid fa-lock text-indigo-600"></i>
                  <span><TranslatedText fallback="Secure payment protected" /></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <i className="fa-solid fa-rotate-left text-indigo-600"></i>
                  <span><TranslatedText fallback="30-day free returns" /></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <i className="fa-solid fa-shield-halved text-indigo-600"></i>
                  <span><TranslatedText fallback="2-year official warranty" /></span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-4 text-gray-400 flex-wrap">
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-lock text-indigo-600 text-sm"></i>
                  <span className="text-[10px] text-gray-500">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-brands fa-cc-paypal text-lg text-[#003087]"></i>
                  <i className="fa-brands fa-cc-visa text-lg"></i>
                  <i className="fa-brands fa-cc-mastercard text-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 隐藏传统卡表单，显示PayPal Card Fields
const hideLegacyCardForm = () => {
  const legacyForm = document.getElementById('legacy-card-form');
  if (legacyForm) {
    legacyForm.style.display = 'none';
  }
};

// 显示传统卡表单
const showLegacyCardForm = () => {
  const legacyForm = document.getElementById('legacy-card-form');
  if (legacyForm) {
    legacyForm.style.display = 'block';
  }
};

export default Checkout;
