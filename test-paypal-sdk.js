/**
 * PayPal 沙盒 API 测试 (使用官方SDK方式)
 */

const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

// 凭证 (2024年1月6日更新)
const clientId = 'AdYd8c4-8sqDdUh4F4rpGyixCVDGnuMLT_BxF8bcTX6mEErfUq__BPnQgS-67gIJdruYnRBwEOrXvAs1';
const clientSecret = 'EK1lg9k4iWum67J4o8V50xD0uljyAsX0SJyOPzg5ocJ8MplVRtx_YtMvoqGKcCVNCkqpbZ1Nr7raQf7v';

async function testPayPal() {
  console.log('🧪 PayPal 沙盒 API 测试 (SDK方式)\n');
  console.log('='.repeat(50));

  try {
    // 方式1: 使用URLSearchParams
    console.log('\n📡 方式1: 使用URLSearchParams...');
    const params1 = new URLSearchParams();
    params1.append('grant_type', 'client_credentials');

    const response1 = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: params1.toString()
    });

    console.log(`   状态: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`   响应: ${JSON.stringify(data1)}`);

    if (response1.ok) {
      console.log('✅ 成功获取Access Token!');
      console.log(`   Token: ${data1.access_token.substring(0, 20)}...`);
      return;
    }

    // 方式2: 直接字符串
    console.log('\n📡 方式2: 直接字符串...');
    const response2 = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    console.log(`   状态: ${response2.status}`);
    const data2 = await response2.json();
    console.log(`   响应: ${JSON.stringify(data2)}`);

    if (response2.ok) {
      console.log('✅ 成功获取Access Token!');
      return;
    }

    console.log('\n❌ 两种方式都失败了');
    console.log('\n🔧 请检查:');
    console.log('1. 登录 https://developer.paypal.com');
    console.log('2. 确认应用存在且状态正常');
    console.log('3. 重新复制Client Secret (不要有空格)');
    console.log('4. 如果Secret被重置，需要使用新的Secret');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

testPayPal();