/**
 * PayPal 沙盒完整支付流程测试
 */

const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

// 凭证
const clientId = 'AdYd8c4-8sqDdUh4F4rpGyixCVDGnuMLT_BxF8bcTX6mEErfUq__BPnQgS-67gIJdruYnRBwEOrXvAs1';
const clientSecret = 'EK1lg9k4iWum67J4o8V50xD0uljyAsX0SJyOPzg5ocJ8MplVRtx_YtMvoqGKcCVNCkqpbZ1Nr7raQf7v';

let accessToken = null;
let orderId = null;

async function getAccessToken() {
  console.log('\n📡 步骤1: 获取Access Token...');
  
  const response = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Access Token获取成功!');
    console.log(`   Token: ${data.access_token.substring(0, 30)}...`);
    console.log(`   有效期: ${data.expires_in / 3600}小时`);
    accessToken = data.access_token;
    return true;
  } else {
    console.log('❌ Access Token获取失败!');
    console.log(`   错误: ${JSON.stringify(data)}`);
    return false;
  }
}

async function createOrder() {
  console.log('\n📦 步骤2: 创建订单...');
  
  const response = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders`, {
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
          value: '99.99'
        },
        description: 'TinyTech Order - Test Product'
      }],
      application_context: {
        brand_name: 'TinyTech',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'http://localhost:3001/checkout/success',
        cancel_url: 'http://localhost:3001/checkout/cancel'
      }
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ 订单创建成功!');
    console.log(`   订单ID: ${data.id}`);
    console.log(`   状态: ${data.status}`);
    
    // 查找批准URL
    const approvalLink = data.links?.find(link => link.rel === 'approve');
    if (approvalLink) {
      console.log(`\n🔗 批准URL (用于测试):`);
      console.log(`   ${approvalLink.href}`);
    }
    
    orderId = data.id;
    return true;
  } else {
    console.log('❌ 订单创建失败!');
    console.log(`   错误: ${JSON.stringify(data)}`);
    return false;
  }
}

async function captureOrder(orderId) {
  console.log('\n💰 步骤3: 捕获订单付款...');
  
  const response = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ 订单捕获成功!');
    console.log(`   交易ID: ${data.purchase_units?.[0]?.payments?.captures?.[0]?.id}`);
    console.log(`   状态: ${data.status}`);
    return true;
  } else {
    console.log('❌ 订单捕获失败!');
    console.log(`   错误: ${JSON.stringify(data)}`);
    return false;
  }
}

async function getOrderDetails(orderId) {
  console.log('\n📋 步骤4: 查询订单详情...');
  
  const response = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ 订单详情获取成功!');
    console.log(`   订单ID: ${data.id}`);
    console.log(`   状态: ${data.status}`);
    console.log(`   金额: ${data.purchase_units?.[0]?.amount?.currency_code} ${data.purchase_units?.[0]?.amount?.value}`);
    return data;
  } else {
    console.log('❌ 订单详情获取失败!');
    console.log(`   错误: ${JSON.stringify(data)}`);
    return null;
  }
}

async function runFullTest() {
  console.log('🧪 PayPal 沙盒完整支付流程测试');
  console.log('='.repeat(60));
  
  try {
    // 步骤1: 获取Token
    const hasToken = await getAccessToken();
    if (!hasToken) {
      console.log('\n❌ 测试终止: 无法获取Access Token');
      return;
    }
    
    // 步骤2: 创建订单
    const hasOrder = await createOrder();
    if (!hasOrder) {
      console.log('\n❌ 测试终止: 无法创建订单');
      return;
    }
    
    // 步骤3: 查询订单详情
    await getOrderDetails(orderId);
    
    console.log('\n' + '='.repeat(60));
    console.log('📝 测试说明:');
    console.log('1. 访问上方显示的批准URL完成付款');
    console.log('2. 使用沙盒账户: buyer@ex.com / 12345678');
    console.log('3. 付款完成后，运行 captureOrder(orderId) 捕获付款');
    console.log('\n💡 提示: 要测试完整流程，需要在浏览器中访问批准URL并完成付款');
    
  } catch (error) {
    console.error('\n❌ 测试错误:', error.message);
  }
}

// 运行测试
runFullTest();