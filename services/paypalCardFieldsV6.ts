/**
 * PayPal JS SDK v6 Card Fields Service
 * Modern card payment integration using PayPal's hosted card fields
 */

// SDK v6 types - Updated based on actual API
interface PayPalSDKV6 {
  createInstance: (config: {
    clientToken: string;
    components: string[];
  }) => Promise<PayPalSDKInstance>;
}

interface PayPalSDKInstance {
  findEligibleMethods: (options?: { currencyCode?: string }) => Promise<{
    isEligible: (method: string) => boolean;
  }>;
  // Correct method name based on error message
  CardFields: () => CardFieldsBuilder;
}

interface CardFieldsBuilder {
  Render: (selector: string) => void;
  submit: (options: {
    orderId: string;
    billingAddress?: {
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      adminArea1?: string;
      adminArea2?: string;
      countryCode?: string;
    };
  }) => Promise<{
    data: {
      orderId: string;
      liabilityShift?: string;
      message?: string;
    };
    state: 'succeeded' | 'canceled' | 'failed';
  }>;
}

interface CardFieldsSession {
  createCardFieldsComponent: (config: {
    type: 'number' | 'expiry' | 'cvv';
    placeholder?: string;
    style?: any;
  }) => HTMLElement;
  submit: (orderId: string, options?: {
    billingAddress?: {
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      adminArea1?: string;
      adminArea2?: string;
      countryCode?: string;
    };
  }) => Promise<{
    data: {
      orderId: string;
      liabilityShift?: string;
      message?: string;
    };
    state: 'succeeded' | 'canceled' | 'failed';
  }>;
}

declare global {
  interface Window {
    paypal?: any; // Use any to avoid conflicts with Checkout.tsx
  }
}

let sdkInstance: PayPalSDKInstance | null = null;
let cardSession: CardFieldsSession | null = null;

/**
 * Get browser-safe client token from backend
 */
export async function getBrowserSafeClientToken(): Promise<string> {
  try {
    const response = await fetch('/api/paypal-client-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get client token');
    }

    const data = await response.json();
    return data.clientToken;
  } catch (error) {
    console.error('[PayPal Card Fields] Error getting client token:', error);
    throw error;
  }
}

/**
 * Load PayPal SDK v6 script
 */
export function loadPayPalSDKV6(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.paypal) {
      console.log('[PayPal Card Fields] SDK already loaded');
      resolve();
      return;
    }

    // Remove existing script if any
    const existingScript = document.querySelector('script[data-paypal-sdk-v6]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    // 根据环境使用不同的 SDK URL
    const apiBase = import.meta.env.VITE_PAYPAL_API_BASE || 'https://api-m.paypal.com';
    const isSandbox = apiBase.includes('sandbox');
    script.src = isSandbox 
      ? 'https://www.sandbox.paypal.com/web-sdk/v6/core'
      : 'https://www.paypal.com/web-sdk/v6/core';
    script.setAttribute('data-paypal-sdk-v6', 'true');
    script.async = true;

    script.onload = () => {
      console.log('[PayPal Card Fields] SDK v6 loaded successfully');
      resolve();
    };

    script.onerror = () => {
      console.error('[PayPal Card Fields] Failed to load SDK v6');
      reject(new Error('Failed to load PayPal SDK v6'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initialize PayPal SDK v6 and create instance
 */
export async function initializePayPalSDKV6(): Promise<any> {
  if (sdkInstance) {
    console.log('[PayPal Card Fields] Using existing SDK instance');
    return sdkInstance;
  }

  try {
    // Load SDK
    await loadPayPalSDKV6();

    if (!window.paypal) {
      throw new Error('PayPal SDK not available');
    }

    // Get client token
    const clientToken = await getBrowserSafeClientToken();

    // Create SDK instance
    sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ['card-fields']
    });

    console.log('[PayPal Card Fields] SDK initialized successfully');
    return sdkInstance;
  } catch (error) {
    console.error('[PayPal Card Fields] Initialization error:', error);
    throw error;
  }
}

/**
 * Check if card fields are eligible
 */
export async function isCardFieldsEligible(currencyCode: string = 'USD'): Promise<boolean> {
  if (!sdkInstance) {
    throw new Error('SDK not initialized');
  }

  try {
    const paymentMethods = await sdkInstance.findEligibleMethods({ currencyCode });
    return paymentMethods.isEligible('advanced_cards');
  } catch (error) {
    console.error('[PayPal Card Fields] Eligibility check error:', error);
    return false;
  }
}

/**
 * Create card fields session
 */
export function createCardFieldsSession(): any {
  if (!sdkInstance) {
    throw new Error('SDK not initialized');
  }

  // Create card fields instance
  cardSession = sdkInstance.CardFields();
  return cardSession;
}

/**
 * Render card fields in containers
 */
export function renderCardFields(
  session: any,
  containers: {
    number: string | HTMLElement;
    expiry: string | HTMLElement;
    cvv: string | HTMLElement;
    name?: string | HTMLElement;
  },
  style?: any
): void {
  // Default style for compact fields
  const defaultStyle = {
    input: {
      'font-size': '16px',
      'font-family': 'monospace',
      'padding': '12px',
      'color': '#1f2937'
    },
    ':focus': {
      'color': '#1f2937'
    }
  };

  const fieldStyle = style || defaultStyle;

  // Get container elements
  const numberContainer = typeof containers.number === 'string' 
    ? document.querySelector(containers.number) 
    : containers.number;
  
  const expiryContainer = typeof containers.expiry === 'string'
    ? document.querySelector(containers.expiry)
    : containers.expiry;
  
  const cvvContainer = typeof containers.cvv === 'string'
    ? document.querySelector(containers.cvv)
    : containers.cvv;

  if (!numberContainer || !expiryContainer || !cvvContainer) {
    throw new Error('Card field containers not found');
  }

  // Clear containers
  numberContainer.innerHTML = '';
  expiryContainer.innerHTML = '';
  cvvContainer.innerHTML = '';

  // Create card field components using the correct API
  try {
    const numberField = session.NumberField({
      style: fieldStyle,
      placeholder: 'Card number'
    });
    numberContainer.appendChild(numberField);

    const expiryField = session.ExpiryField({
      style: fieldStyle,
      placeholder: 'MM/YY'
    });
    expiryContainer.appendChild(expiryField);

    const cvvField = session.CVVField({
      style: fieldStyle,
      placeholder: 'CVV'
    });
    cvvContainer.appendChild(cvvField);

    console.log('[PayPal Card Fields] Fields rendered successfully');
  } catch (error) {
    console.error('[PayPal Card Fields] Render error:', error);
    throw error;
  }
}

/**
 * Submit card payment
 */
export async function submitCardPayment(
  session: any,
  orderId: string,
  billingAddress?: {
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    adminArea1?: string;
    adminArea2?: string;
    countryCode?: string;
  }
): Promise<{
  success: boolean;
  orderId?: string;
  liabilityShift?: string;
  error?: string;
  state: 'succeeded' | 'canceled' | 'failed';
}> {
  try {
    const result = await session.submit({
      orderId,
      billingAddress
    });

    switch (result.state) {
      case 'succeeded':
        return {
          success: true,
          orderId: result.data.orderId,
          liabilityShift: result.data.liabilityShift,
          state: 'succeeded'
        };

      case 'canceled':
        return {
          success: false,
          error: 'Payment canceled by user',
          state: 'canceled'
        };

      case 'failed':
        return {
          success: false,
          error: result.data.message || 'Payment failed',
          state: 'failed'
        };

      default:
        return {
          success: false,
          error: 'Unknown payment state',
          state: 'failed'
        };
    }
  } catch (error) {
    console.error('[PayPal Card Fields] Submit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment submission failed',
      state: 'failed'
    };
  }
}

/**
 * Get current SDK instance
 */
export function getSDKInstance(): any {
  return sdkInstance;
}

/**
 * Get current card session
 */
export function getCardSession(): any {
  return cardSession;
}

/**
 * Check if SDK is initialized
 */
export function isSDKInitialized(): boolean {
  return !!sdkInstance;
}

export default {
  initializePayPalSDKV6,
  isCardFieldsEligible,
  createCardFieldsSession,
  renderCardFields,
  submitCardPayment,
  getSDKInstance,
  getCardSession,
  isSDKInitialized
};
