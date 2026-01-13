import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * PayPal Webhook 验证和处理 (Vercel API Route)
 * 
 * 需要在 Vercel 环境变量中配置:
 * - PAYPAL_WEBHOOK_ID: PayPal Webhook ID
 * - PAYPAL_CLIENT_ID: PayPal 客户端 ID
 * - PAYPAL_CLIENT_SECRET: PayPal 客户端密钥
 * - PAYPAL_API_BASE: PayPal API 基础 URL
 */

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: any;
  create_time: string;
  summary: string;
}

// 获取 PayPal Access Token
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('[PayPal Webhook] Missing credentials');
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[PayPal Webhook] Error getting access token:', error);
    return null;
  }
}

// 验证 PayPal Webhook 签名
async function verifyWebhookSignature(
  headers: { [key: string]: string | string[] | undefined },
  body: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  if (!webhookId) {
    console.error('[PayPal Webhook] PAYPAL_WEBHOOK_ID not configured');
    return false;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return false;
  }

  try {
    // PayPal 签名验证所需的 headers
    const getHeader = (name: string): string => {
      const value = headers[name] || headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : (value || '');
    };

    const transmissionId = getHeader('paypal-transmission-id');
    const transmissionTime = getHeader('paypal-transmission-time');
    const certUrl = getHeader('paypal-cert-url');
    const authAlgo = getHeader('paypal-auth-algo');
    const transmissionSig = getHeader('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('[PayPal Webhook] Missing required headers');
      console.log('Headers received:', { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig });
      return false;
    }

    // 调用 PayPal API 验证签名
    const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[PayPal Webhook] Verification API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('[PayPal Webhook] Verification result:', result.verification_status);
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('[PayPal Webhook] Verification error:', error);
    return false;
  }
}

// 处理不同类型的 Webhook 事件
async function handleWebhookEvent(event: PayPalWebhookEvent): Promise<void> {
  console.log(`[PayPal Webhook] Processing event: ${event.event_type}`);
  console.log(`[PayPal Webhook] Event ID: ${event.id}`);

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      // 支付完成
      console.log('[PayPal Webhook] Payment captured successfully');
      console.log('[PayPal Webhook] Capture ID:', event.resource?.id);
      console.log('[PayPal Webhook] Amount:', event.resource?.amount);
      // TODO: 更新数据库订单状态为已支付
      // TODO: 发送确认邮件
      break;

    case 'PAYMENT.CAPTURE.DENIED':
      // 支付被拒绝
      console.log('[PayPal Webhook] Payment denied');
      // TODO: 更新订单状态为支付失败
      break;

    case 'PAYMENT.CAPTURE.REFUNDED':
      // 退款完成
      console.log('[PayPal Webhook] Payment refunded');
      console.log('[PayPal Webhook] Refund ID:', event.resource?.id);
      // TODO: 更新订单状态为已退款
      break;

    case 'CHECKOUT.ORDER.APPROVED':
      // 订单已批准（用户已授权支付）
      console.log('[PayPal Webhook] Order approved by buyer');
      console.log('[PayPal Webhook] Order ID:', event.resource?.id);
      break;

    case 'CHECKOUT.ORDER.COMPLETED':
      // 订单完成
      console.log('[PayPal Webhook] Order completed');
      break;

    case 'PAYMENT.CAPTURE.PENDING':
      // 支付待处理
      console.log('[PayPal Webhook] Payment pending');
      break;

    case 'PAYMENT.CAPTURE.REVERSED':
      // 支付被撤销
      console.log('[PayPal Webhook] Payment reversed');
      // TODO: 更新订单状态
      break;

    default:
      console.log(`[PayPal Webhook] Unhandled event type: ${event.event_type}`);
  }
}

// 读取请求体
async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

// Vercel API Route Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取原始请求体（用于签名验证）
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // 验证 Webhook 签名
    const isValid = await verifyWebhookSignature(req.headers, rawBody);
    
    if (!isValid) {
      console.error('[PayPal Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // 解析事件
    const webhookEvent: PayPalWebhookEvent = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : req.body;
    
    // 处理事件
    await handleWebhookEvent(webhookEvent);

    // 返回成功响应
    return res.status(200).json({ 
      received: true,
      event_id: webhookEvent.id,
      event_type: webhookEvent.event_type
    });
  } catch (error) {
    console.error('[PayPal Webhook] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 配置：禁用 body 解析以获取原始请求体
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
