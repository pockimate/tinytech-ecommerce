/**
 * PayPal 沙盒 API 服务
 * 用于处理PayPal支付
 * 
 * 需要在 .env.local 中配置:
 * - VITE_PAYPAL_CLIENT_ID: PayPal沙盒客户端ID
 * - VITE_PAYPAL_CLIENT_SECRET: PayPal沙盒客户端密钥
 * - VITE_PAYPAL_API_BASE: PayPal API基础URL (沙盒: https://api-m.sandbox.paypal.com)
 */

// 获取PayPal配置
const getPayPalConfig = () => {
  return {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
    apiBase: import.meta.env.VITE_PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'
  };
};

// 获取Access Token
export async function getPayPalAccessToken(): Promise<string | null> {
  const config = getPayPalConfig();
  
  if (!config.clientId || !config.clientSecret) {
    console.warn('[PayPal] Client ID or Secret not configured');
    return null;
  }

  try {
    const auth = btoa(`${config.clientId}:${config.clientSecret}`);
    
    const response = await fetch(`${config.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[PayPal] Error getting access token:', error);
    return null;
  }
}

// 创建订单
export async function createPayPalOrder(
  amount: number,
  currency: string = 'EUR',
  description: string = 'Pockimate Order'
): Promise<{ id: string; approvalUrl: string } | null> {
  const config = getPayPalConfig();
  
  if (!config.clientId) {
    console.warn('[PayPal] Client ID not configured');
    return null;
  }

  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    console.warn('[PayPal] Could not get access token');
    return null;
  }

  try {
    const response = await fetch(`${config.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order-${Date.now()}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          },
          description
        }],
        application_context: {
          brand_name: 'Pockimate',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}?paypal=success`,
          cancel_url: `${window.location.origin}?paypal=cancel`,
          shipping_preference: 'GET_FROM_FILE' // 要求PayPal收集地址信息
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[PayPal] Create order error:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await response.json();
    
    // 获取批准URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    
    if (approvalUrl) {
      return { id: order.id, approvalUrl };
    }
    
    throw new Error('No approval URL found');
  } catch (error) {
    console.error('[PayPal] Error creating order:', error);
    return null;
  }
}

// 捕获订单付款并返回详细信息
export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean; orderDetails?: any }> {
  const config = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    return { success: false };
  }

  try {
    const response = await fetch(`${config.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[PayPal] Capture error:', error);
      throw new Error('Failed to capture PayPal order');
    }

    const result = await response.json();
    console.log('[PayPal] Capture result:', result);
    
    if (result.status === 'COMPLETED') {
      // 获取详细的订单信息，包括地址
      const orderDetails = await getPayPalOrderDetails(orderId);
      return { 
        success: true, 
        orderDetails: orderDetails || result 
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('[PayPal] Error capturing order:', error);
    return { success: false };
  }
}

// 获取订单详情
export async function getPayPalOrderDetails(orderId: string): Promise<any> {
  const config = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${config.apiBase}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get order details');
    }

    return await response.json();
  } catch (error) {
    console.error('[PayPal] Error getting order details:', error);
    return null;
  }
}

// 退款
export async function refundPayPalPayment(
  captureId: string,
  amount: number,
  currency: string = 'EUR'
): Promise<boolean> {
  const config = getPayPalConfig();
  const accessToken = await getPayPalAccessToken();
  
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(`${config.apiBase}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refund');
    }

    return true;
  } catch (error) {
    console.error('[PayPal] Error refunding:', error);
    return false;
  }
}

// 检查PayPal是否已配置
export function isPayPalConfigured(): boolean {
  const config = getPayPalConfig();
  return !!(config.clientId && config.clientSecret);
}

export default {
  getAccessToken: getPayPalAccessToken,
  createOrder: createPayPalOrder,
  captureOrder: capturePayPalOrder,
  getOrderDetails: getPayPalOrderDetails,
  refund: refundPayPalPayment,
  isConfigured: isPayPalConfigured
};