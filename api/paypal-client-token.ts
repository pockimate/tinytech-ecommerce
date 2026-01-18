/**
 * PayPal Client Token Generation API
 * Generates a client token for PayPal SDK v6 (Card Fields & Fastlane)
 */

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel Serverless Functions use environment variables without VITE_ prefix
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.VITE_PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || process.env.VITE_PAYPAL_API_BASE || 'https://api-m.paypal.com';

  if (!clientId || !clientSecret) {
    console.error('[PayPal Token] Missing credentials');
    return res.status(500).json({ error: 'PayPal not configured' });
  }

  try {
    // Generate SDK client token (for Card Fields v6)
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials&response_type=client_token&intent=sdk_init'
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('[PayPal Token] Token error:', error);
      throw new Error('Failed to get client token');
    }

    const tokenData = await tokenResponse.json();

    return res.status(200).json({
      clientToken: tokenData.access_token
    });

  } catch (error) {
    console.error('[PayPal Token] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate client token'
    });
  }
}
