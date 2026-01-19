import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types';
import { TranslatedText } from './TranslatedText';
import TranslatedInput from './TranslatedInput';
import { useTranslatedText } from '../context/TranslationContext';
import { createPayPalOrder, capturePayPalOrder, isPayPalConfigured } from '../services/paypal';
import { processCardPayment, canProcessCard } from '../services/paypalCard';
import { validateCreditCard, formatCardNumber as formatCard, detectCardType } from '../utils/cardValidation';
import { usePayPalCardFields } from '../hooks/usePayPalCardFields';
import { PayPalCardFields } from './PayPalCardFields';

interface CheckoutProps {
  cart: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  discountApplied?: number; // Discount ratio (0.2 = 20%)
  currency?: string; // Currency code (USD, EUR, etc.)
  currencySymbol?: string; // Currency symbol ($, €, etc.)
  formatPrice?: (price: number) => string; // Price formatting function
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
  currency = 'USD',
  currencySymbol = '$',
  formatPrice,
  onBack,
  onOrderComplete
}) => {
  const t = useTranslatedText();
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // PayPal Card Fields v6 Hook
  const {
    isInitialized: cardFieldsInitialized,
    isEligible: cardFieldsEligible,
    isProcessing: cardFieldsProcessing,
    setupCardFields,
    submitPayment: submitCardFieldsPayment,
    error: cardFieldsError
  } = usePayPalCardFields(currency);
  
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
  const [touched, setTouched] = useState<Partial<Record<keyof (ShippingInfo & PaymentInfo), boolean>>>({});

  // Country-specific configuration
  const countryConfig: Record<string, {
    zipLabel: string;
    zipPlaceholder: string;
    zipPattern?: string;
    stateLabel: string;
    statePlaceholder: string;
    phonePrefix: string;
  }> = {
    'Italy': {
      zipLabel: 'CAP',
      zipPlaceholder: '20100',
      zipPattern: '^\\d{5}$',
      stateLabel: 'Province',
      statePlaceholder: 'MI',
      phonePrefix: '+39'
    },
    'US': {
      zipLabel: 'ZIP Code',
      zipPlaceholder: '10001',
      zipPattern: '^\\d{5}(-\\d{4})?$',
      stateLabel: 'State',
      statePlaceholder: 'NY',
      phonePrefix: '+1'
    },
    'UK': {
      zipLabel: 'Postcode',
      zipPlaceholder: 'SW1A 1AA',
      zipPattern: '^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$',
      stateLabel: 'County',
      statePlaceholder: 'London',
      phonePrefix: '+44'
    },
    'Germany': {
      zipLabel: 'PLZ',
      zipPlaceholder: '10115',
      zipPattern: '^\\d{5}$',
      stateLabel: 'Bundesland',
      statePlaceholder: 'Berlin',
      phonePrefix: '+49'
    },
    'France': {
      zipLabel: 'Code Postal',
      zipPlaceholder: '75001',
      zipPattern: '^\\d{5}$',
      stateLabel: 'Région',
      statePlaceholder: 'Île-de-France',
      phonePrefix: '+33'
    },
    'Spain': {
      zipLabel: 'Código Postal',
      zipPlaceholder: '28001',
      zipPattern: '^\\d{5}$',
      stateLabel: 'Provincia',
      statePlaceholder: 'Madrid',
      phonePrefix: '+34'
    },
    'CN': {
      zipLabel: '邮政编码',
      zipPlaceholder: '100000',
      zipPattern: '^\\d{6}$',
      stateLabel: '省/直辖市',
      statePlaceholder: '北京市',
      phonePrefix: '+86'
    },
    'JP': {
      zipLabel: '郵便番号',
      zipPlaceholder: '100-0001',
      zipPattern: '^\\d{3}-?\\d{4}$',
      stateLabel: '都道府県',
      statePlaceholder: '東京都',
      phonePrefix: '+81'
    },
    'KR': {
      zipLabel: '우편번호',
      zipPlaceholder: '03000',
      zipPattern: '^\\d{5}$',
      stateLabel: '시/도',
      statePlaceholder: '서울특별시',
      phonePrefix: '+82'
    }
  };

  const currentCountryConfig = countryConfig[shippingInfo.country] || countryConfig['Italy'];

  // Real-time validation function
  const validateField = (field: keyof ShippingInfo, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return t('error.fullNameRequired', 'Full name is required');
        if (value.trim().length < 2) return t('error.fullNameTooShort', 'Name must be at least 2 characters');
        break;
      case 'email':
        if (!value.trim()) return t('error.emailRequired', 'Email is required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('error.emailInvalid', 'Invalid email format');
        }
        break;
      case 'phone':
        if (!value.trim()) return t('error.phoneRequired', 'Phone is required');
        if (!/^[\d\s\+\-\(\)]+$/.test(value)) {
          return t('error.phoneInvalid', 'Invalid phone format');
        }
        break;
      case 'address':
        if (!value.trim()) return t('error.addressRequired', 'Address is required');
        if (value.trim().length < 5) return t('error.addressTooShort', 'Address must be at least 5 characters');
        break;
      case 'city':
        if (!value.trim()) return t('error.cityRequired', 'City is required');
        break;
      case 'zipCode':
        if (!value.trim()) return t('error.zipRequired', 'ZIP code is required');
        // Country-specific ZIP validation
        const zipPattern = countryConfig[shippingInfo.country]?.zipPattern;
        if (zipPattern && !new RegExp(zipPattern, 'i').test(value.trim())) {
          return t('error.zipInvalid', `Invalid ${currentCountryConfig.zipLabel} format`);
        }
        break;
      case 'country':
        if (!value.trim()) return t('error.countryRequired', 'Country is required');
        break;
    }
    return undefined;
  };

  // Handle field change with real-time validation
  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo({ ...shippingInfo, [field]: value });
    
    // Only validate if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (field: keyof ShippingInfo) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, shippingInfo[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateShipping = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};
    
    if (!shippingInfo.fullName.trim()) newErrors.fullName = t('error.fullNameRequired', 'Full name is required');
    else if (shippingInfo.fullName.trim().length < 2) newErrors.fullName = t('error.fullNameTooShort', 'Name must be at least 2 characters');
    
    if (!shippingInfo.email.trim()) newErrors.email = t('error.emailRequired', 'Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = t('error.emailInvalid', 'Invalid email format');
    }
    
    if (!shippingInfo.phone.trim()) newErrors.phone = t('error.phoneRequired', 'Phone is required');
    else if (!/^[\d\s\+\-\(\)]+$/.test(shippingInfo.phone)) {
      newErrors.phone = t('error.phoneInvalid', 'Invalid phone format');
    }
    
    if (!shippingInfo.address.trim()) newErrors.address = t('error.addressRequired', 'Address is required');
    else if (shippingInfo.address.trim().length < 5) newErrors.address = t('error.addressTooShort', 'Address must be at least 5 characters');
    
    if (!shippingInfo.city.trim()) newErrors.city = t('error.cityRequired', 'City is required');
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = t('error.zipRequired', 'ZIP code is required');
    if (!shippingInfo.country.trim()) newErrors.country = t('error.countryRequired', 'Country is required');

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: Partial<Record<keyof ShippingInfo, boolean>> = {};
    Object.keys(shippingInfo).forEach(key => {
      allTouched[key as keyof ShippingInfo] = true;
    });
    setTouched(allTouched);
    
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
    // 先验证配送信息
    const shippingValid = validateShipping();
    
    if (!shippingValid) {
      // 显示友好的错误提示
      const errorFields = Object.keys(errors).filter(key => errors[key as keyof typeof errors]);
      const errorCount = errorFields.length;
      
      // 创建错误提示消息
      const errorMessage = errorCount === 1 
        ? `Please fix the error in the ${errorFields[0]} field.`
        : `Please fix ${errorCount} errors in the form before proceeding.`;
      
      // 显示错误提示（使用更友好的方式）
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce';
      errorDiv.innerHTML = `
        <i class="fa-solid fa-circle-exclamation text-2xl"></i>
        <div>
          <p class="font-bold">${errorMessage}</p>
          <p class="text-sm opacity-90">Please check the highlighted fields above.</p>
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      // 3秒后自动移除
      setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => errorDiv.remove(), 300);
      }, 3000);
      
      return;
    }
    
    // 如果使用 Card Fields v6，跳过手动卡片验证
    if (!cardFieldsInitialized || !cardFieldsEligible) {
      const paymentValid = validatePayment();
      if (!paymentValid) {
        // 显示支付信息错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce';
        errorDiv.innerHTML = `
          <i class="fa-solid fa-credit-card text-2xl"></i>
          <div>
            <p class="font-bold">Invalid payment information</p>
            <p class="text-sm opacity-90">Please check your card details.</p>
          </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
          errorDiv.style.opacity = '0';
          errorDiv.style.transition = 'opacity 0.3s';
          setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
        
        return;
      }
    }
    
    setIsProcessing(true);
    
    // 显示处理中提示
    const processingDiv = document.createElement('div');
    processingDiv.id = 'processing-indicator';
    processingDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3';
    processingDiv.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
      <div>
        <p class="font-bold">Processing your payment...</p>
        <p class="text-sm opacity-90">Please wait, do not close this page.</p>
      </div>
    `;
    document.body.appendChild(processingDiv);
    
    try {
      console.log('[Checkout] Starting payment process');
      
      // 1. 创建 PayPal 订单
      const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Order');
      
      if (!orderData || !orderData.id) {
        throw new Error('Failed to create payment order');
      }
      
      console.log('[Checkout] Order created:', orderData.id);
      
      // 2. 使用 Card Fields v6 提交支付
      if (cardFieldsInitialized && cardFieldsEligible) {
        console.log('[Checkout] Submitting payment with Card Fields v6');
        
        const paymentResult = await submitCardFieldsPayment(orderData.id, {
          postalCode: shippingInfo.zipCode,
          addressLine1: shippingInfo.address,
          adminArea1: shippingInfo.state,
          adminArea2: shippingInfo.city,
          countryCode: shippingInfo.country
        });
        
        console.log('[Checkout] Payment result:', paymentResult);
        
        if (paymentResult.success) {
          // 支付成功，捕获订单
          console.log('[Checkout] Payment successful, capturing order');
          
          const captureResult = await capturePayPalOrder(orderData.id);
          
          if (captureResult.success) {
            console.log('[Checkout] Order captured successfully');
            
            // 移除处理中提示
            document.getElementById('processing-indicator')?.remove();
            
            // 显示成功提示
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3';
            successDiv.innerHTML = `
              <i class="fa-solid fa-circle-check text-2xl"></i>
              <div>
                <p class="font-bold">Payment successful!</p>
                <p class="text-sm opacity-90">Redirecting to confirmation page...</p>
              </div>
            `;
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
              onOrderComplete(orderData.id);
            }, 1500);
          } else {
            throw new Error('Failed to capture payment');
          }
        } else {
          // 支付失败或取消
          document.getElementById('processing-indicator')?.remove();
          
          const errorDiv = document.createElement('div');
          errorDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3';
          
          if (paymentResult.state === 'canceled') {
            errorDiv.innerHTML = `
              <i class="fa-solid fa-circle-xmark text-2xl"></i>
              <div>
                <p class="font-bold">Payment canceled</p>
                <p class="text-sm opacity-90">You canceled the authentication. Please try again.</p>
              </div>
            `;
          } else {
            errorDiv.innerHTML = `
              <i class="fa-solid fa-circle-xmark text-2xl"></i>
              <div>
                <p class="font-bold">Payment failed</p>
                <p class="text-sm opacity-90">${paymentResult.error || 'Please check your card information and try again.'}</p>
              </div>
            `;
          }
          
          document.body.appendChild(errorDiv);
          setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transition = 'opacity 0.3s';
            setTimeout(() => errorDiv.remove(), 300);
          }, 5000);
          
          setIsProcessing(false);
        }
      } else {
        // 回退到旧的卡片处理方式
        console.log('[Checkout] Using legacy card processing');
        
        if (!canProcessCard()) {
          throw new Error('PayPal payment processing is not configured');
        }
        
        const paymentResult = await processCardPayment(orderData.id, {
          number: paymentInfo.cardNumber,
          expiry: paymentInfo.expiryDate,
          cvv: paymentInfo.cvv,
          name: paymentInfo.cardHolder,
          billingAddress: {
            addressLine1: shippingInfo.address,
            adminArea2: shippingInfo.city,
            adminArea1: shippingInfo.state,
            postalCode: shippingInfo.zipCode,
            countryCode: shippingInfo.country
          }
        });
        
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }
        
        console.log('[Checkout] Payment successful:', paymentResult.captureId);
        
        // 移除处理中提示
        document.getElementById('processing-indicator')?.remove();
        
        // 显示成功提示
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3';
        successDiv.innerHTML = `
          <i class="fa-solid fa-circle-check text-2xl"></i>
          <div>
            <p class="font-bold">Payment successful!</p>
            <p class="text-sm opacity-90">Redirecting to confirmation page...</p>
          </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          onOrderComplete(orderData.id);
        }, 1500);
      }
      
    } catch (error) {
      console.error('[Checkout] Payment error:', error);
      
      // 移除处理中提示
      document.getElementById('processing-indicator')?.remove();
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // 显示错误提示
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 max-w-md';
      errorDiv.innerHTML = `
        <i class="fa-solid fa-circle-xmark text-2xl"></i>
        <div>
          <p class="font-bold">Payment Failed</p>
          <p class="text-sm opacity-90">${errorMessage}</p>
          <p class="text-xs opacity-75 mt-1">Please check your card details and try again, or use PayPal/Google Pay.</p>
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.3s';
        setTimeout(() => errorDiv.remove(), 300);
      }, 5000);
      
      setIsProcessing(false);
    }
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
      
      // 创建 PayPal 按钮 - 使用官方样式
      const button = document.createElement('button');
      button.className = 'flex items-center justify-center gap-2 bg-[#FFC439] hover:bg-[#FFB900] text-[#003087] px-6 py-3 font-bold transition-all shadow-sm border border-[#FFC439]';
      button.style.height = '48px';
      button.style.width = '100%';
      button.style.borderRadius = '8px';
      button.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
      button.innerHTML = `
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.897 19.778H1.975a.534.534 0 0 1-.528-.617L4.12.751C4.188.318 4.562 0 4.998 0h7.015c2.09 0 3.762.744 4.863 2.173 1.071 1.388 1.388 3.349.929 5.672-.514 2.603-1.691 4.518-3.457 5.608-1.01.623-2.161.917-3.416.917H8.06a.534.534 0 0 0-.528.617l-.242 1.53-.111.702-.242 1.53a.534.534 0 0 1-.528.617H5.897z" fill="#003087"/>
          <path d="M13.84 5.532c-.514 2.603-1.691 4.518-3.457 5.608-1.01.623-2.161.917-3.416.917H4.095l-1.12 7.104H5.897c.436 0 .81-.318.878-.751l.036-.186.242-1.53.031-.17c.068-.433.442-.751.878-.751h.553c2.09 0 3.762-.744 4.863-2.173 1.071-1.388 1.388-3.349.929-5.672-.111-.558-.286-1.074-.533-1.544-.247-.47-.565-.897-.944-1.28z" fill="#0070E0"/>
          <path d="M12.896 5.162c-.111-.031-.222-.062-.333-.093a6.67 6.67 0 0 0-.442-.093 10.8 10.8 0 0 0-1.691-.124H6.841a.534.534 0 0 0-.528.617l-.878 5.579-.036.186c.068-.433.442-.751.878-.751h1.83c2.09 0 3.762-.744 4.863-2.173 1.071-1.388 1.388-3.349.929-5.672-.111-.558-.286-1.074-.533-1.544-.247-.47-.565-.897-.944-1.28-.111.031-.222.062-.333.093z" fill="#003087"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600;">PayPal</span>
      `;
      
      button.onclick = async () => {
        try {
          setIsProcessing(true);
          const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate PayPal Order');
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
      
      // 创建 Google Pay 按钮 - 统一样式
      const button = document.createElement('button');
      button.className = 'flex items-center justify-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-all shadow-sm border border-black';
      button.style.height = '48px';
      button.style.width = '100%';
      button.style.borderRadius = '8px';
      button.style.fontFamily = '"Google Sans", "Roboto", Arial, sans-serif';
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="white"/>
        </svg>
        <span style="font-size: 16px; font-weight: 600;">Google Pay</span>
      `;
      
      button.onclick = async () => {
        try {
          setIsProcessing(true);
          const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Google Pay Order');
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
    button.className = 'flex items-center justify-center gap-2 bg-[#FFC439] hover:bg-[#FFB900] text-[#003087] px-6 py-3 font-bold transition-all shadow-sm border border-[#FFC439]';
    button.style.height = '48px';
    button.style.width = '100%';
    button.style.borderRadius = '8px';
    button.style.fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    button.innerHTML = `
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.897 19.778H1.975a.534.534 0 0 1-.528-.617L4.12.751C4.188.318 4.562 0 4.998 0h7.015c2.09 0 3.762.744 4.863 2.173 1.071 1.388 1.388 3.349.929 5.672-.514 2.603-1.691 4.518-3.457 5.608-1.01.623-2.161.917-3.416.917H8.06a.534.534 0 0 0-.528.617l-.242 1.53-.111.702-.242 1.53a.534.534 0 0 1-.528.617H5.897z" fill="#003087"/>
        <path d="M13.84 5.532c-.514 2.603-1.691 4.518-3.457 5.608-1.01.623-2.161.917-3.416.917H4.095l-1.12 7.104H5.897c.436 0 .81-.318.878-.751l.036-.186.242-1.53.031-.17c.068-.433.442-.751.878-.751h.553c2.09 0 3.762-.744 4.863-2.173 1.071-1.388 1.388-3.349.929-5.672-.111-.558-.286-1.074-.533-1.544-.247-.47-.565-.897-.944-1.28z" fill="#0070E0"/>
        <path d="M12.896 5.162c-.111-.031-.222-.062-.333-.093a6.67 6.67 0 0 0-.442-.093 10.8 10.8 0 0 0-1.691-.124H6.841a.534.534 0 0 0-.528.617l-.878 5.579-.036.186c.068-.433.442-.751.878-.751h1.83c2.09 0 3.762-.744 4.863-2.173 1.071-1.388 1.388-3.349.929-5.672-.111-.558-.286-1.074-.533-1.544-.247-.47-.565-.897-.944-1.28-.111.031-.222.062-.333.093z" fill="#003087"/>
      </svg>
      <span style="font-size: 16px; font-weight: 600;">PayPal</span>
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
    button.className = 'flex items-center justify-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-all shadow-sm border border-black';
    button.style.height = '48px';
    button.style.width = '100%';
    button.style.borderRadius = '8px';
    button.style.fontFamily = '"Google Sans", "Roboto", Arial, sans-serif';
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="white"/>
      </svg>
      <span style="font-size: 16px; font-weight: 600;">Google Pay</span>
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
      const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Order');
      
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
      const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Express Order');
      
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
          currencyCode: currency
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
    const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Google Pay Express Order');
    
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
          currencyCode: currency
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
    const orderData = await createPayPalOrder(actualTotal, currency, 'Pockimate Google Pay Order');
    
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
                <div className="flex-1 min-w-0">
                  <div
                    ref={paypalContainerRef}
                    className="w-full"
                    style={{ minHeight: '48px', maxHeight: '48px' }}
                  />
                </div>
                
                {/* Google Pay Express Button */}
                <div className="flex-1 min-w-0">
                  <div
                    ref={googlePayContainerRef}
                    className="w-full"
                    style={{ minHeight: '48px', maxHeight: '48px' }}
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
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      onBlur={() => handleFieldBlur('fullName')}
                      required
                      autoComplete="name"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                      placeholderFallback="John Doe"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <TranslatedText fallback="Email" /> *
                    </label>
                    <TranslatedInput
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                      required
                      autoComplete="email"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                      placeholderFallback="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.email}
                      </p>
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
                    onChange={(e) => handleShippingChange('phone', e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                    placeholder="+39 123 456 7890"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <TranslatedText fallback="Address" /> *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    onBlur={() => handleFieldBlur('address')}
                    required
                    autoComplete="street-address"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                    placeholder="Via Roma 123"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.address}
                    </p>
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
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      onBlur={() => handleFieldBlur('city')}
                      required
                      autoComplete="address-level2"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                      placeholder="Milano"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {currentCountryConfig.stateLabel}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      autoComplete="address-level1"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                      placeholder={currentCountryConfig.statePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {currentCountryConfig.zipLabel} *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      onBlur={() => handleFieldBlur('zipCode')}
                      required
                      autoComplete="postal-code"
                      inputMode="numeric"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                      placeholder={currentCountryConfig.zipPlaceholder}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <TranslatedText fallback="Country" /> *
                  </label>
                  <select
                    value={shippingInfo.country}
                    onChange={(e) => {
                      const newCountry = e.target.value;
                      handleShippingChange('country', newCountry);
                      // Clear ZIP and state errors when country changes
                      setErrors(prev => ({
                        ...prev,
                        zipCode: undefined,
                        state: undefined
                      }));
                      // Update phone prefix hint
                      const config = countryConfig[newCountry];
                      if (config && !shippingInfo.phone.startsWith('+')) {
                        // Optionally auto-add country code prefix
                        // setShippingInfo(prev => ({ ...prev, phone: config.phonePrefix + ' ' }));
                      }
                    }}
                    onBlur={() => handleFieldBlur('country')}
                    required
                    autoComplete="country-name"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors`}
                  >
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Spain">🇪🇸 Spain</option>
                    <option value="UK">🇬🇧 United Kingdom</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="CN">🇨🇳 China</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="KR">🇰🇷 South Korea</option>
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.country}
                    </p>
                  )}
                  {/* Phone prefix hint */}
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <i className="fa-solid fa-phone text-indigo-600"></i>
                    Phone prefix: <span className="font-bold">{currentCountryConfig.phonePrefix}</span>
                  </p>
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
                  className={`p-5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    shippingMethod === 'standard'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        shippingMethod === 'standard' ? 'border-indigo-600' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'standard' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base sm:text-sm"><TranslatedText fallback="Standard Shipping" /></p>
                        <p className="text-sm sm:text-xs text-gray-500 mt-0.5">5-7 <TranslatedText fallback="business days" /></p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900 text-base sm:text-sm"><TranslatedText fallback="Free" /></p>
                  </div>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    shippingMethod === 'express'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        shippingMethod === 'express' ? 'border-indigo-600' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'express' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-sm">
                          <TranslatedText fallback="Express Shipping" />
                          <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full"><TranslatedText fallback="FAST" /></span>
                        </p>
                        <p className="text-sm sm:text-xs text-gray-500 mt-0.5">2-3 <TranslatedText fallback="business days" /></p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900 text-base sm:text-sm">{currencySymbol}15.00</p>
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

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 sm:p-5 rounded-2xl border-2 font-bold transition-all active:scale-[0.98] min-h-[120px] sm:min-h-[100px] ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <i className="fa-solid fa-credit-card text-4xl sm:text-3xl mb-3 block"></i>
                  <p className="text-sm"><TranslatedText fallback="Credit Card" /></p>
                </button>

                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-6 sm:p-5 rounded-2xl border-2 font-bold transition-all active:scale-[0.98] min-h-[120px] sm:min-h-[100px] ${
                    paymentMethod === 'paypal'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <i className="fa-brands fa-paypal text-4xl sm:text-3xl mb-3 block"></i>
                  <p className="text-sm">PayPal</p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-6">
                  {/* PayPal Card Fields v6 或手动输入表单 */}
                  {cardFieldsInitialized && cardFieldsEligible ? (
                    /* 使用 PayPal Card Fields v6 (安全的 iframe 输入) */
                    <PayPalCardFields
                      onSetupComplete={setupCardFields}
                      currency={currency}
                    />
                  ) : (
                    /* 回退到手动输入表单 */
                    <>
                      {!cardFieldsInitialized && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                          <i className="fa-solid fa-info-circle mr-2"></i>
                          支付表单加载中，请稍候...
                        </div>
                      )}
                      
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
                    </>
                  )}
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
                    <p className="font-black text-gray-900">{formatPrice ? formatPrice(item.price) : `${currencySymbol}${item.price}`}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600"><TranslatedText fallback="Subtotal" /></span>
                  <span className="font-bold text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>
                      <TranslatedText fallback="Discount" /> ({(discountApplied * 100).toFixed(0)}%)
                    </span>
                    <span>-{currencySymbol}{(subtotal * discountApplied).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600"><TranslatedText fallback="Shipping" /></span>
                  <span className="font-bold text-gray-900">
                    {actualShippingCost === 0 ? <TranslatedText fallback="Free" /> : `${currencySymbol}${actualShippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-black text-gray-900 text-lg"><TranslatedText fallback="Total" /></span>
                  <span className="font-black text-2xl text-indigo-600">{currencySymbol}{actualTotal.toFixed(2)}</span>
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
