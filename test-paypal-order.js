/**
 * PayPal 沙盒 API 完整流程测试
 */

const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

// 凭证
const clientId = 'AdYd8c4-8sqDdUh4F4rpGyixCVDGnuMLT_BxF8bcTX6mEErfUq__BPnQgS-67gIJdruYnRBwEOrXvAs1';
const clientSecret = 'EK1lg9k4iWum67J4o8V50xD0uljyAsX0SJyOPzg5ocJ8MplVRtx_YtMvoqGKcCVNCkqpbZ1Nr7raQf7v';

async function testFullFlow() {
  console.log('🧪 PayPal 沙盒 API 完整流程测试\n');
  console.log('='.repeat(60));

  try {
    // 1. 获取Access Token
    console.log('\n📡 步骤1: 获取Access Token...');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(`获取Token失败: ${tokenData.error_description}`);
    }

    const accessToken = tokenData.access_token;
    console.log('✅ Access Token获取成功!');
    console.log(`   Token: ${accessToken.substring(0, 30)}...`);
    console.log(`   有效期: ${tokenData.expires_in}秒`);

    // 2. 创建订单
    console.log('\n📦 步骤2: 创建订单...');
    const orderResponse = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders`, {
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
            currency_code: 'EUR',
            value: '10.00'
          },
          description: 'TinyTech Test Order'
        }],
        application_context: {
          brand_name: 'TinyTech',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:3000/checkout/success',
          cancel_url: 'http://localhost:3000/checkout/cancel'
        }
      })
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      throw new Error(`创建订单失败: ${orderData.message || orderResponse.statusText}`);
    }

    console.log('✅ 订单创建成功!');
    console.log(`   订单ID: ${orderData.id}`);
    console.log(`   状态: ${orderData.status}`);
    
    const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
    if (approvalUrl) {
      console.log(`   批准URL: ${approvalUrl}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 完整流程测试成功!\n');
    console.log('💡 下一步操作:');
    console.log('1. 访问上面的批准URL');
    console.log('2. 使用沙盒买家账户登录:');
    console.log('   - Email: buyer@ex.com');
    console.log('   - Password: 12345678');
    console.log('3. 确认付款');
    console.log('4. 订单状态将变为COMPLETED\n');
    console.log('⚠️ 注意: 此测试订单需要手动完成批准流程才能捕获付款');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

testFullFlow();