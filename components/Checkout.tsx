import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types';
import { TranslatedText } from './TranslatedText';
import TranslatedInput from './TranslatedInput';
import { useTranslatedText } from '../context/TranslationContext';
import { createPayPalOrder, capturePayPalOrder, isPayPalConfigured } from '../services/paypal';
import { validateCreditCard, formatCardNumber as formatCard, detectCardType } from '../utils/cardValidation';

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discountApplied?: number; // Discount ratio (0.2 = 20%)
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

// PayPal SDK v6 type definitions
declare global {
  interface Window {
    paypal: {
      createInstance: (config: {
        clientToken: string;
        components: string[];
        pageType?: string;
      }) => Promise<{
        findEligibleMethods: (options?: { currencyCode?: string }) => Promise<{
          isEligible: (method: string) => boolean;
          getDetails: (method: string) => any;
        }>;
        createPayPalOneTimePaymentSession: (options: any) => any;
        createGooglePayOneTimePaymentSession: (options: any) => any;
        createCardFieldsOneTimePaymentSession: (options?: any) => any;
      }>;
    };
    google: {
      payments: {
        api: {
          PaymentsClient: new (config: { environment: string }) => {
            createButton: (config: any) => HTMLElement;
            loadPaymentData: (request: any) => Promise<any>;
          };
        };
      };
    };
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
  const t = useTranslatedText();
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
    
    if (!shippingInfo.fullName.trim()) newErrors.fullName = t('error.fullNameRequired', 'Full name is required');
    if (!shippingInfo.email.trim()) newErrors.email = t('error.emailRequired', 'Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = t('error.emailInvalid', 'Invalid email format');
    }
    if (!shippingInfo.phone.trim()) newErrors.phone = t('error.phoneRequired', 'Phone is required');
    if (!shippingInfo.address.trim()) newErrors.address = t('error.addressRequired', 'Address is required');
    if (!shippingInfo.city.trim()) newErrors.city = t('error.cityRequired', 'City is required');
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = t('error.zipRequired', 'ZIP code is required');

    setErrors(newErrors);
    
    // If there are errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Focus on the error field
          (firstErrorField as HTMLInputElement).focus();
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    if (paymentMethod === 'paypal') return true;

    // 使用增强的信用卡验证
    const validation = validateCreditCard(
      paymentInfo.cardNumber,
      paymentInfo.expiryDate,
      paymentInfo.cvv,
      paymentInfo.cardHolder
    );
    
    if (!validation.valid) {
      const newErrors: Partial<PaymentInfo> = {};
      if (validation.errors.cardNumber) newErrors.cardNumber = validation.errors.cardNumber;
      if (validation.errors.cardholderName) newErrors.cardHolder = validation.errors.cardholderName;
      if (validation.errors.expiryDate) newErrors.expiryDate = validation.errors.expiryDate;
      if (validation.errors.cvv) newErrors.cvv = validation.errors.cvv;
      
      setErrors(newErrors);
      return false;
    }
    
    // 警告：检测到测试卡
    if (validation.isTestCard) {
      console.warn('[Checkout] Test card detected:', validation.cardType);
    }

    setErrors({});
    return true;
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
    return formatCard(value);
  };

  const actualShippingCost = shippingMethod === 'express' ? 15 : shippingCost;
  const actualTotal = subtotal - subtotal * discountApplied + actualShippingCost;

  // PayPal button containers
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const googlePayContainerRef = useRef<HTMLDivElement | null>(null);
  const paypalPaymentContainerRef = useRef<HTMLDivElement | null>(null); // PayPal payment method button
  // SDK loading state
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const [paypalSDKInstance, setPaypalSDKInstance] = useState<any>(null);

  // Load PayPal SDK v6 and Google Pay API
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
    
    if (!clientId) {
      console.warn('[PayPal] No Client ID configured');
      return;
    }
    
    // Load Google Pay API
    const loadGooglePayAPI = () => {
      if (window.google && window.google.payments) {
        console.log('[Google Pay] API already loaded');
        return Promise.resolve();
      }
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        script.onload = () => {
          console.log('[Google Pay] API loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.warn('[Google Pay] API load failed');
          resolve(false); // Don't block, continue using fallback
        };
        document.head.appendChild(script);
      });
    };
    
    // Load API and setup buttons
    loadGooglePayAPI().then(() => {
      console.log('[PayPal] Using fallback buttons for development (SDK v6 requires server-side client token)');
      setPaypalSDKLoaded(true);
    });
  }, []); // Only run once when component mounts

  // Get browser-safe client token (mock)
  const getBrowserSafeClientToken = async () => {
    // PayPal SDK v6 requires real client token, mock token will fail
    // In development environment, we skip SDK v6 initialization and use fallback buttons directly
    console.warn('[PayPal] SDK v6 requires real client token from server. Using fallback buttons for development.');
    throw new Error('Client token required for SDK v6');
  };

  // 清理所有PayPal按钮
  const cleanupPayPalButtons = () => {
    console.log('[PayPal] Cleaning up existing buttons');
    
    // 清理容器
    if (paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = '';
    }
    if (googlePayContainerRef.current) {
      googlePayContainerRef.current.innerHTML = '';
    }
    if (paypalPaymentContainerRef.current) {
      paypalPaymentContainerRef.current.innerHTML = '';
    }
  };

  // 标记按钮是否已初始化
  const [buttonsInitialized, setButtonsInitialized] = useState(false);

  // 初始化 PayPal 和 Google Pay 按钮
  useEffect(() => {
    if (!paypalSDKLoaded) return;
    
    console.log('[PayPal] Setting up buttons...');
    
    // 清理现有按钮
    cleanupPayPalButtons();
    
    // 延迟设置按钮，确保DOM已准备好
    const timer = setTimeout(() => {
      setupFallbackPayPalButton();
      setupGooglePayButton(); // 使用新的Google Pay按钮设置
      setupPayPalPaymentButton();
      setButtonsInitialized(true);
      console.log('[PayPal] All buttons setup completed');
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [paypalSDKLoaded]); // 移除 buttonsInitialized 依赖，允许重新初始化

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      console.log('[PayPal] Component unmounting, cleaning up');
      cleanupPayPalButtons();
      setButtonsInitialized(false);
    };
  }, []);

  // 设置 PayPal 按钮 (SDK v6)
  const setupPayPalButtonV6 = async (sdkInstance: any) => {
    if (!paypalContainerRef.current) return;
    
    const container = paypalContainerRef.current;
    container.innerHTML = '';
    
    try {
      // 创建 PayPal 支付会话
      const paypalSession = sdkInstance.createPayPalOneTimePaymentSession({
        async onApprove(data: any) {
          console.log('[PayPal] Payment approved:', data);
          try {
            const result = await capturePayPalOrder(data.orderId);
            if (result.success) {
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
      
      // 创建 PayPal 按钮
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

  // 设置 Google Pay 按钮 (SDK v6)
  const setupGooglePayButtonV6 = async (sdkInstance: any) => {
    if (!googlePayContainerRef.current) return;
    
    const container = googlePayContainerRef.current;
    container.innerHTML = '';
    
    try {
      // 创建 Google Pay 支付会话
      const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession({
        async onApprove(data: any) {
          console.log('[Google Pay] Payment approved:', data);
          try {
            const result = await capturePayPalOrder(data.orderId);
            if (result.success) {
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
      
      // 创建 Google Pay 按钮
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
      console.error('[Google Pay] Error creating official button:', error);
      setupGooglePayFallback();
    }
  };

  // 设置回退 PayPal 按钮（快捷支付，无需地址验证）
  const setupFallbackPayPalButton = () => {
    console.log('[PayPal] Setting up fallback PayPal button');
    if (!paypalContainerRef.current) {
      console.log('[PayPal] paypalContainerRef.current is null');
      return;
    }
    
    const container = paypalContainerRef.current;
    
    // 清理容器内容
    container.innerHTML = '';
    
    // 移除可能存在的重复按钮
    const existingButton = document.getElementById('paypal-express-button');
    if (existingButton) {
      existingButton.remove();
      console.log('[PayPal] Removed existing button');
    }
    
    const button = document.createElement('button');
    button.id = 'paypal-express-button';
    button.className = 'w-full flex items-center justify-center gap-3 bg-[#0070ba] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005ea6] transition-all shadow-sm';
    button.style.height = '48px';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.835 2.607 1.285 1.666 1.666 4.019 1.115 6.807-.617 3.123-2.029 5.421-4.148 6.729C16.185 16.735 14.793 17.1 13.3 17.1H9.672a.641.641 0 0 0-.633.74l-.29 1.836-.133.842-.29 1.836a.641.641 0 0 1-.633.74H7.076z" fill="white"/>
      </svg>
      <span>PayPal</span>
    `;
    
    // 使用快捷PayPal支付（无需地址验证）
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[PayPal] Express button clicked');
      await handleExpressPayPalPayment();
    });
    container.appendChild(button);
    console.log('[PayPal] Fallback PayPal button created and added');
  };

  // 设置 Google Pay 按钮
  const setupGooglePayButton = () => {
    if (!googlePayContainerRef.current) return;
    
    const container = googlePayContainerRef.current;
    
    // 确保容器为空
    if (container.children.length > 0) {
      console.log('[Google Pay] Container already has children, clearing');
      container.innerHTML = '';
    }
    
    // 检查Google Pay是否可用
    if (!window.google || !window.google.payments) {
      console.log('[Google Pay] Google Pay API not available, setting up fallback');
      setupGooglePayFallback();
      return;
    }
    
    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST' // 沙盒模式
      });
      
      const button = paymentsClient.createButton({
        onClick: handleExpressGooglePayPayment,
        buttonColor: 'black',
        buttonType: 'pay',
        buttonSizeMode: 'fill'
      });
      
      container.appendChild(button);
      console.log('[Google Pay] Official button created');
    } catch (error) {
      console.error('[Google Pay] Error creating official button:', error);
      setupGooglePayFallback();
    }
  };

  // 设置 Google Pay 回退按钮
  const setupGooglePayFallback = () => {
    if (!googlePayContainerRef.current) return;
    
    const container = googlePayContainerRef.current;
    
    // 清理容器内容
    container.innerHTML = '';
    
    // 移除可能存在的重复按钮
    const existingButton = document.getElementById('google-pay-express-button');
    if (existingButton) {
      existingButton.remove();
      console.log('[Google Pay] Removed existing button');
    }
    
    const button = document.createElement('button');
    button.id = 'google-pay-express-button';
    button.className = 'w-full flex items-center justify-center gap-3 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm';
    button.style.height = '48px';
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="white"/>
        </svg>
        <span>Google Pay</span>
    `;
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Google Pay] Fallback button clicked');
      await handleExpressGooglePayPayment();
    });
    
    container.appendChild(button);
    console.log('[Google Pay] Fallback button created');
  };

  // 设置PayPal支付方式下的PayPal按钮
  const setupPayPalPaymentButton = () => {
    console.log('[PayPal] Setting up PayPal payment button');
    if (!paypalPaymentContainerRef.current) {
      console.log('[PayPal] paypalPaymentContainerRef.current is null');
      return;
    }
    
    const container = paypalPaymentContainerRef.current;
    
    // 清理容器内容
    container.innerHTML = '';
    
    // 移除可能存在的重复按钮
    const existingButton = document.getElementById('paypal-payment-button');
    if (existingButton) {
      existingButton.remove();
      console.log('[PayPal] Removed existing payment button');
    }
    
    const button = document.createElement('button');
    button.id = 'paypal-payment-button';
    button.className = 'w-full flex items-center justify-center gap-3 bg-[#0070ba] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#005ea6] transition-all shadow-lg';
    button.style.height = '56px';
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.835 2.607 1.285 1.666 1.666 4.019 1.115 6.807-.617 3.123-2.029 5.421-4.148 6.729C16.185 16.735 14.793 17.1 13.3 17.1H9.672a.641.641 0 0 0-.633.74l-.29 1.836-.133.842-.29 1.836a.641.641 0 0 1-.633.74H7.076z" fill="white"/>
      </svg>
      <span style="font-size: 18px;">Pay with PayPal</span>
    `;
    
    // 使用真实的PayPal API
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[PayPal] Payment button clicked');
      await handleRealPayPalPayment();
    });
    container.appendChild(button);
    console.log('[PayPal] PayPal payment button created and added');
  };

  const handleQuickPaySimulation = () => {
    console.log('[PayPal] handleQuickPaySimulation called');
    // 简化的快速支付模拟
    setIsProcessing(true);
    
    // 显示用户反馈
    alert('PayPal Demo: Starting payment simulation...');
    
    setTimeout(() => {
      const orderId = 'ORD-DEMO-' + Date.now();
      console.log('[PayPal] Simulated payment completed, orderId:', orderId);
      setIsProcessing(false);
      onOrderComplete(orderId);
    }, 1500);
  };

  // PayPal支付处理（需要地址验证）
  const handleRealPayPalPayment = async () => {
    console.log('[PayPal] Starting real PayPal payment');
    
    // First validate shipping information
    if (!validateShipping()) {
      console.log('[PayPal] Shipping validation failed');
      
      // Show user-friendly message
      const errorCount = Object.keys(errors).length;
      const message = errorCount === 1 
        ? 'Please fill in complete shipping address information' 
        : `Please fill in complete shipping address information (${errorCount} fields remaining)`;
      
      alert(message);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 创建PayPal订单
      const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech Order');
      
      if (!orderData || !orderData.approvalUrl) {
        throw new Error('Failed to create PayPal order');
      }
      
      console.log('[PayPal] Order created:', orderData.id);
      console.log('[PayPal] Approval URL:', orderData.approvalUrl);
      
      // 跳转到PayPal进行支付
      window.location.href = orderData.approvalUrl;
      
    } catch (error) {
      console.error('[PayPal] Payment error:', error);
      setIsProcessing(false);
      alert('PayPal payment failed, please try again or use another payment method.');
    }
  };

  // 快捷PayPal支付处理（无需地址验证）
  const handleExpressPayPalPayment = async () => {
    console.log('[PayPal Express] Starting express PayPal payment');
    setIsProcessing(true);
    
    try {
      // 直接创建PayPal订单，无需地址验证
      const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech Express Order');
      
      if (!orderData || !orderData.approvalUrl) {
        throw new Error('Failed to create PayPal order');
      }
      
      console.log('[PayPal Express] Order created:', orderData.id);
      console.log('[PayPal Express] Approval URL:', orderData.approvalUrl);
      
      // 跳转到PayPal进行支付
      window.location.href = orderData.approvalUrl;
      
    } catch (error) {
      console.error('[PayPal Express] Payment error:', error);
      setIsProcessing(false);
      alert('PayPal express payment failed, please try again or use another payment method.');
    }
  };

  // 快捷Google Pay支付处理（无需地址验证）
  const handleExpressGooglePayPayment = async () => {
    console.log('[Google Pay Express] Starting express Google Pay payment');
    setIsProcessing(true);
    
    try {
      // 检查Google Pay是否可用
      if (window.google && window.google.payments) {
        await handleExpressGooglePayWithAPI();
      } else {
        // 回退到PayPal处理Google Pay
        await handleExpressGooglePayWithPayPal();
      }
    } catch (error) {
      console.error('[Google Pay Express] Payment error:', error);
      setIsProcessing(false);
      alert('Google Pay express payment failed, please try again or use another payment method.');
    }
  };

  // 使用Google Pay API处理快捷支付
  const handleExpressGooglePayWithAPI = async () => {
    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });
      
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'TinyTech'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: actualTotal.toFixed(2),
          currencyCode: 'EUR'
        },
        shippingAddressRequired: true, // 要求用户在Google Pay中填写地址
        emailRequired: true
      };
      
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      console.log('[Google Pay Express] Payment successful:', paymentData);
      
      // 模拟处理支付数据
      setTimeout(() => {
        const orderId = 'ORD-GOOGLEPAY-EXPRESS-' + Date.now();
        onOrderComplete(orderId);
      }, 1000);
      
    } catch (error: any) {
      // 处理用户取消支付的情况
      if (error.statusCode === 'CANCELED' || error.name === 'AbortError') {
        console.log('[Google Pay Express] Payment cancelled by user');
        setIsProcessing(false);
        return;
      }
      
      console.error('[Google Pay Express] API error:', error);
      // 回退到PayPal处理
      await handleExpressGooglePayWithPayPal();
    }
  };

  // 使用PayPal处理快捷Google Pay（回退方案）
  const handleExpressGooglePayWithPayPal = async () => {
    console.log('[Google Pay Express] Using PayPal as fallback for express Google Pay');
    
    // 创建PayPal订单，但标记为Google Pay Express
    const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech Google Pay Express Order');
    
    if (!orderData || !orderData.approvalUrl) {
      throw new Error('Failed to create PayPal order for Google Pay Express');
    }
    
    console.log('[Google Pay Express] PayPal order created:', orderData.id);
    
    // 跳转到PayPal进行支付
    window.location.href = orderData.approvalUrl;
  };

  // Google Pay支付处理
  const handleGooglePayPayment = async () => {
    console.log('[Google Pay] Starting Google Pay payment');
    
    // First validate shipping information
    if (!validateShipping()) {
      console.log('[Google Pay] Shipping validation failed');
      
      // Show user-friendly message
      const errorCount = Object.keys(errors).length;
      const message = errorCount === 1 
        ? 'Please fill in complete shipping address information' 
        : `Please fill in complete shipping address information (${errorCount} fields remaining)`;
      
      alert(message);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 检查Google Pay是否可用
      if (window.google && window.google.payments) {
        await handleGooglePayWithAPI();
      } else {
        // 回退到PayPal处理Google Pay
        await handleGooglePayWithPayPal();
      }
    } catch (error) {
      console.error('[Google Pay] Payment error:', error);
      setIsProcessing(false);
      alert('Google Pay payment failed, please try again or use another payment method.');
    }
  };

  // 使用Google Pay API处理支付
  const handleGooglePayWithAPI = async () => {
    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: 'TEST'
      });
      
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'TinyTech'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: actualTotal.toFixed(2),
          currencyCode: 'EUR'
        }
      };
      
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      console.log('[Google Pay] Payment successful:', paymentData);
      
      // 模拟处理支付数据
      setTimeout(() => {
        const orderId = 'ORD-GOOGLEPAY-' + Date.now();
        onOrderComplete(orderId);
      }, 1000);
      
    } catch (error: any) {
      // 处理用户取消支付的情况
      if (error.statusCode === 'CANCELED' || error.name === 'AbortError') {
        console.log('[Google Pay] Payment cancelled by user');
        setIsProcessing(false);
        return;
      }
      
      console.error('[Google Pay] API error:', error);
      // 回退到PayPal处理
      await handleGooglePayWithPayPal();
    }
  };

  // 使用PayPal处理Google Pay（回退方案）
  const handleGooglePayWithPayPal = async () => {
    console.log('[Google Pay] Using PayPal as fallback for Google Pay');
    
    // 创建PayPal订单，但标记为Google Pay
    const orderData = await createPayPalOrder(actualTotal, 'EUR', 'TinyTech Google Pay Order');
    
    if (!orderData || !orderData.approvalUrl) {
      throw new Error('Failed to create PayPal order for Google Pay');
    }
    
    console.log('[Google Pay] PayPal order created:', orderData.id);
    
    // 跳转到PayPal进行支付
    window.location.href = orderData.approvalUrl;
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
                  <TranslatedText fallback="Express Checkout" />
                </h2>
                <p className="text-sm text-gray-500">
                  <TranslatedText fallback="Quick payment with PayPal or Google Pay" />
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  <TranslatedText fallback="Please fill in shipping address below before using express checkout" />
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
                    <TranslatedInput
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.fullName ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholderFallback="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="Email" /> *
                    </label>
                    <TranslatedInput
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                      placeholderFallback="john@example.com"
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
                        <p className="text-sm text-gray-500">5-7 <TranslatedText fallback="business days" /></p>
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
                          <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full"><TranslatedText fallback="FAST" /></span>
                        </p>
                        <p className="text-sm text-gray-500">2-3 <TranslatedText fallback="business days" /></p>
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

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-2xl border-2 font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <i className="fa-solid fa-credit-card text-3xl mb-3 block"></i>
                  <p className="text-sm"><TranslatedText fallback="Credit Card" /></p>
                </button>

                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-6 rounded-2xl border-2 font-bold transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <i className="fa-brands fa-paypal text-3xl mb-3 block"></i>
                  <p className="text-sm">PayPal</p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-6">
                  {/* 现代化的信用卡表单 */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-credit-card text-indigo-600"></i>
                      <TranslatedText fallback="Credit Card" />
                    </h3>
                    
                    <div className="space-y-4">
                      {/* 卡号 */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <TranslatedText fallback="Card Number" /> *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({
                              ...paymentInfo,
                              cardNumber: formatCardNumber(e.target.value)
                            })}
                            maxLength={19}
                            className={`w-full px-4 py-4 rounded-xl border-2 ${
                              errors.cardNumber ? 'border-red-500' : 'border-gray-200 focus:border-indigo-600'
                            } focus:outline-none transition-colors text-lg font-mono`}
                            placeholder="1234 5678 9012 3456"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-1">
                            <i className="fa-brands fa-cc-visa text-blue-600 text-xl"></i>
                            <i className="fa-brands fa-cc-mastercard text-red-600 text-xl"></i>
                            <i className="fa-brands fa-cc-amex text-blue-500 text-xl"></i>
                          </div>
                        </div>
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <i className="fa-solid fa-exclamation-circle"></i>
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      {/* 持卡人姓名 */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <TranslatedText fallback="Cardholder Name" /> *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardHolder}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value.toUpperCase() })}
                          className={`w-full px-4 py-4 rounded-xl border-2 ${
                            errors.cardHolder ? 'border-red-500' : 'border-gray-200 focus:border-indigo-600'
                          } focus:outline-none transition-colors text-lg uppercase`}
                          placeholder="MARIO ROSSI"
                        />
                        {errors.cardHolder && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <i className="fa-solid fa-exclamation-circle"></i>
                            {errors.cardHolder}
                          </p>
                        )}
                      </div>

                      {/* 有效期和CVV */}
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
                            className={`w-full px-4 py-4 rounded-xl border-2 ${
                              errors.expiryDate ? 'border-red-500' : 'border-gray-200 focus:border-indigo-600'
                            } focus:outline-none transition-colors text-lg font-mono text-center`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <i className="fa-solid fa-exclamation-circle"></i>
                              {errors.expiryDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <TranslatedText fallback="CVV" /> *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={paymentInfo.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setPaymentInfo({ ...paymentInfo, cvv: value });
                              }}
                              maxLength={4}
                              className={`w-full px-4 py-4 rounded-xl border-2 ${
                                errors.cvv ? 'border-red-500' : 'border-gray-200 focus:border-indigo-600'
                              } focus:outline-none transition-colors text-lg font-mono text-center`}
                              placeholder="123"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <i className="fa-solid fa-question-circle text-gray-400 cursor-help" title="3-4 digit security code on the back of your card"></i>
                            </div>
                          </div>
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                              <i className="fa-solid fa-exclamation-circle"></i>
                              {errors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 安全提示 */}
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-shield-halved text-green-600 text-xl"></i>
                        <div>
                          <p className="text-sm font-bold text-green-800">
                            <TranslatedText fallback="Secure Payment" />
                          </p>
                          <p className="text-xs text-green-600">
                            <TranslatedText fallback="Your payment information is encrypted and secure" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <i className="fa-brands fa-paypal text-5xl text-blue-600 mb-3"></i>
                    <p className="text-gray-600 font-medium">
                      <TranslatedText fallback="You will be redirected to PayPal to complete your payment" />
                    </p>
                  </div>
                  
                  {/* PayPal Payment Button */}
                  <div
                    ref={paypalPaymentContainerRef}
                    className="w-full"
                    style={{ minHeight: '56px' }}
                  />
                </div>
              )}

              {/* Place Order Button - for credit card */}
              {paymentMethod === 'card' && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 group"
                >
                  {isProcessing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span><TranslatedText fallback="Processing..." /></span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock"></i>
                      <span><TranslatedText fallback="Place Order" /></span>
                      <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </>
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
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}-${item.selectedColor || 'default'}`} className="flex gap-4">
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
                  onClick={async () => {
                    // 先验证地址，再触发PayPal支付
                    await handleRealPayPalPayment();
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
