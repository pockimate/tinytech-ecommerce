import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types';
import { TranslatedText } from './TranslatedText';
import { createPayPalOrder, capturePayPalOrder } from '../services/paypal';

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discountApplied?: number;
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

const CheckoutV6: React.FC<CheckoutProps> = ({
  cart,
  subtotal,
  shippingCost,
  total,
  discountApplied = 0,
  onBack,
  onOrderComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const [paypalSDKInstance, setPaypalSDKInstance] = useState<any>(null);
  
  // Refs for button containers
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const googlePayContainerRef = useRef<HTMLDivElement | null>(null);
  
  const actualTotal = subtotal - subtotal * discountApplied + shippingCost;

  // 加载 PayPal SDK v6
  useEffect(() => {
    if (window.paypal && window.paypal.createInstance) {
      console.log('[PayPal] SDK v6 already loaded');
      setPaypalSDKLoaded(true);
      return;
    }
    
    console.log('[PayPal] Loading SDK v6...');
    const script = document.createElement('script');
    script.src = 'https://www.sandbox.paypal.com/web-sdk/v6/core';
    script.async = true;
    script.onload = () => {
      console.log('[PayPal] SDK v6 loaded successfully');
      setPaypalSDKLoaded(true);
    };
    script.onerror = (event) => {
      console.error('[PayPal] SDK v6 load failed:', event);
    };
    document.head.appendChild(script);
  }, []);

  // 获取客户端令牌（模拟）
  const getBrowserSafeClientToken = async () => {
    console.warn('[PayPal] Using mock client token for development');
    return 'mock-client-token-for-development';
  };

  // 初始化 PayPal SDK v6
  useEffect(() => {
    if (!paypalSDKLoaded || !window.paypal?.createInstance) return;
    
    const initializeSDK = async () => {
      try {
        console.log('[PayPal] Initializing SDK v6...');
        
        const clientToken = await getBrowserSafeClientToken();
        
        const sdkInstance = await window.paypal.createInstance({
          clientToken,
          components: ["paypal-payments", "googlepay-payments"],
          pageType: "checkout",
        });
        
        console.log('[PayPal] SDK instance created');
        setPaypalSDKInstance(sdkInstance);
        
        const paymentMethods = await sdkInstance.findEligibleMethods({
          currencyCode: "EUR",
        });
        
        // 设置 PayPal 按钮
        if (paymentMethods.isEligible("paypal")) {
          console.log('[PayPal] PayPal is eligible');
          setupPayPalButton(sdkInstance);
        } else {
          console.log('[PayPal] PayPal is not eligible');
          setupFallbackPayPalButton();
        }
        
        // 设置 Google Pay 按钮
        if (paymentMethods.isEligible("googlepay")) {
          console.log('[Google Pay] Google Pay is eligible');
          setupGooglePayButton(sdkInstance);
        } else {
          console.log('[Google Pay] Google Pay is not eligible');
          setupGooglePayNotAvailable();
        }
        
      } catch (error) {
        console.error('[PayPal] SDK initialization failed:', error);
        setupFallbackPayPalButton();
        setupGooglePayNotAvailable();
      }
    };
    
    initializeSDK();
  }, [paypalSDKLoaded, actualTotal]);

  // 设置 PayPal 按钮
  const setupPayPalButton = async (sdkInstance: any) => {
    if (!paypalContainerRef.current) return;
    
    const container = paypalContainerRef.current;
    container.innerHTML = '';
    
    try {
      const paypalSession = sdkInstance.createPayPalOneTimePaymentSession({
        async onApprove(data: any) {
          console.log('[PayPal] Payment approved:', data);
          try {
            const success = await capturePayPalOrder(data.orderId);
            if (success) {
              onOrderComplete(data.orderId);
            } else {
              setIsProcessing(false);
              alert('Payment capture failed. Please try again.');
            }
          } catch (error) {
            console.error('[PayPal] Capture error:', error);
            setIsProcessing(false);
            alert('Payment processing failed. Please try again.');
          }
        },
        onCancel(data: any) {
          console.log('[PayPal] Payment cancelled:', data);
          setIsProcessing(false);
        },
        onError(error: any) {
          console.error('[PayPal] Payment error:', error);
          setIsProcessing(false);
          alert('PayPal payment failed. Please try again.');
        },
      });
      
      const button = document.createElement('button');
      button.className = 'w-full flex items-center justify-center gap-3 bg-[#0070ba] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005ea6] transition-all shadow-sm';
      button.style.height = '48px';
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.835 2.607 1.285 1.666 1.666 4.019 1.115 6.807-.617 3.123-2.029 5.421-4.148 6.729C16.185 16.735 14.793 17.1 13.3 17.1H9.672a.641.641 0 0 0-.633.74l-.29 1.836-.133.842-.29 1.836a.641.641 0 0 1-.633.74H7.076z" fill="white"/>
        </svg>
        <span>PayPal</span>
      `;
      
      button.onclick = async () => {
        try {
          setIsProcessing(true);
          const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech PayPal Order');
          if (orderData?.id) {
            await paypalSession.start(
              { presentationMode: "auto" },
              { orderId: orderData.id }
            );
          } else {
            throw new Error('Failed to create order');
          }
        } catch (error) {
          console.error('[PayPal] Start error:', error);
          setIsProcessing(false);
          alert('Failed to start PayPal payment. Please try again.');
        }
      };
      
      container.appendChild(button);
      
    } catch (error) {
      console.error('[PayPal] Button setup error:', error);
      setupFallbackPayPalButton();
    }
  };

  // 设置 Google Pay 按钮
  const setupGooglePayButton = async (sdkInstance: any) => {
    if (!googlePayContainerRef.current) return;
    
    const container = googlePayContainerRef.current;
    container.innerHTML = '';
    
    try {
      const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession({
        async onApprove(data: any) {
          console.log('[Google Pay] Payment approved:', data);
          try {
            const success = await capturePayPalOrder(data.orderId);
            if (success) {
              onOrderComplete(data.orderId);
            } else {
              setIsProcessing(false);
              alert('Payment capture failed. Please try again.');
            }
          } catch (error) {
            console.error('[Google Pay] Capture error:', error);
            setIsProcessing(false);
            alert('Payment processing failed. Please try again.');
          }
        },
        onCancel(data: any) {
          console.log('[Google Pay] Payment cancelled:', data);
          setIsProcessing(false);
        },
        onError(error: any) {
          console.error('[Google Pay] Payment error:', error);
          setIsProcessing(false);
          alert('Google Pay payment failed. Please try again.');
        },
      });
      
      const button = document.createElement('button');
      button.className = 'w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm';
      button.style.height = '48px';
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="white"/>
        </svg>
        <span>Google Pay</span>
      `;
      
      button.onclick = async () => {
        try {
          setIsProcessing(true);
          const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech Google Pay Order');
          if (orderData?.id) {
            await googlePaySession.start(
              { presentationMode: "auto" },
              { orderId: orderData.id }
            );
          } else {
            throw new Error('Failed to create order');
          }
        } catch (error) {
          console.error('[Google Pay] Start error:', error);
          setIsProcessing(false);
          alert('Failed to start Google Pay payment. Please try again.');
        }
      };
      
      container.appendChild(button);
      
    } catch (error) {
      console.error('[Google Pay] Button setup error:', error);
      setupGooglePayNotAvailable();
    }
  };

  // 回退按钮
  const setupFallbackPayPalButton = () => {
    if (!paypalContainerRef.current) return;
    
    const container = paypalContainerRef.current;
    container.innerHTML = '';
    
    const button = document.createElement('button');
    button.className = 'w-full flex items-center justify-center gap-3 bg-[#0070ba] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005ea6] transition-all shadow-sm';
    button.style.height = '48px';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.835 2.607 1.285 1.666 1.666 4.019 1.115 6.807-.617 3.123-2.029 5.421-4.148 6.729C16.185 16.735 14.793 17.1 13.3 17.1H9.672a.641.641 0 0 0-.633.74l-.29 1.836-.133.842-.29 1.836a.641.641 0 0 1-.633.74H7.076z" fill="white"/>
      </svg>
      <span>PayPal (Demo)</span>
    `;
    
    button.onclick = () => {
      setIsProcessing(true);
      setTimeout(() => {
        const orderId = 'ORD-DEMO-' + Date.now();
        onOrderComplete(orderId);
      }, 1500);
    };
    
    container.appendChild(button);
  };

  const setupGooglePayNotAvailable = () => {
    if (!googlePayContainerRef.current) return;
    
    const container = googlePayContainerRef.current;
    container.innerHTML = `
      <div class="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-medium cursor-not-allowed" style="height: 48px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
        <span>Google Pay (不可用)</span>
      </div>
    `;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <TranslatedText fallback="Back to Cart" />
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8">
          <TranslatedText fallback="Checkout" />
        </h1>

        {/* Express Checkout Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-gray-900 mb-2">
              <TranslatedText fallback="Express checkout" />
            </h2>
            <p className="text-sm text-gray-500">
              <TranslatedText fallback="Express Checkout" />
            </p>
          </div>
          
          <div className="flex gap-4 max-w-md mx-auto">
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
          
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">
              <TranslatedText fallback="OR" />
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            <TranslatedText fallback="Continue below to enter shipping and payment details manually" />
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
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
                {shippingCost === 0 ? <TranslatedText fallback="Free" /> : `€${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="font-black text-gray-900 text-lg"><TranslatedText fallback="Total" /></span>
              <span className="font-black text-2xl text-indigo-600">€{actualTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutV6;