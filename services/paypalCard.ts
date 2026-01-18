/**
 * PayPal 信用卡支付服务
 * 使用 PayPal 作为支付处理器来处理信用卡支付
 */

import { getPayPalAccessToken } from './paypal';

/**
 * 通过 PayPal 处理信用卡支付
 * 注意：这需要 PayPal Advanced Credit and Debit Card Payments
 * 
 * @param orderId PayPal 订单 ID
 * @param cardDetails 信用卡详情
 * @returns 支付结果
 */
export async function processCardPayment(
  orderId: string,
  cardDetails: {
    number: string;
    expiry: string; // MM/YY
    cvv: string;
    name: string;
    billingAddress: {
      addressLine1: string;
      adminArea2: string; // City
      adminArea1: string; // State
      postalCode: string;
      countryCode: string;
    };
  }
): Promise<{ success: boolean; error?: string; captureId?: string }> {
  const config = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
    apiBase: import.meta.env.VITE_PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'
  };

  if (!config.clientId || !config.clientSecret) {
    console.error('[PayPal Card] Missing credentials');
    return { success: false, error: 'PayPal not configured' };
  }

  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // 解析过期日期
    const [month, year] = cardDetails.expiry.split('/');
    const fullYear = '20' + year;

    // 使用 PayPal Orders API v2 捕获支付
    // 注意：直接处理信用卡需要 PayPal Advanced Card Processing
    // 这里我们使用订单捕获，实际的卡片验证由 PayPal 处理
    
    const response = await fetch(`${config.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `card-${Date.now()}`
      },
      body: JSON.stringify({
        payment_source: {
          card: {
            number: cardDetails.number.replace(/\s/g, ''),
            expiry: `${fullYear}-${month}`,
            security_code: cardDetails.cvv,
            name: cardDetails.name,
            billing_address: cardDetails.billingAddress
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[PayPal Card] Capture failed:', error);
      
      // 提取错误信息
      let errorMessage = 'Payment failed';
      if (error.details && error.details.length > 0) {
        errorMessage = error.details[0].description || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    console.log('[PayPal Card] Payment captured:', result);

    if (result.status === 'COMPLETED') {
      const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      return { success: true, captureId };
    }

    return { success: false, error: 'Payment not completed' };
  } catch (error) {
    console.error('[PayPal Card] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 验证信用卡是否可以通过 PayPal 处理
 */
export function canProcessCard(): boolean {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_PAYPAL_CLIENT_SECRET;
  
  return !!(clientId && clientSecret);
}

export default {
  processCardPayment,
  canProcessCard
};
