/**
 * PayPal 沙盒 API 连接测试脚本
 *
 * 使用方法:
 * 1. 从 https://developer.paypal.com 获取沙盒账户
 * 2. 在PayPal开发者仪表板中创建REST API应用
 * 3. 获取Client ID和Client Secret
 * 4. 更新 .env.local 文件中的配置
 * 5. 运行: node test-paypal-sandbox.js
 */

const PAYPAL_SANDBOX_API_BASE = 'https://api-m.sandbox.paypal.com';

// PayPal沙盒凭证（已配置）
const clientId = 'AWpU3pWBDzw9f0otzwofJphfLltTn7fsu9ZHjisxHM-MRXvVm3zQaMXbLh4GFTeZtv40l9D0mX4l4tmA';
const clientSecret = 'EDAj7RJYs3TSaR6DzEiCqebUEastricY3uQbAu8-DNMa3j_1OokG-Q8yilUL5jEOCCcD5v1LglkFVoJc2';

async function testPayPalConnection() {
  console.log('🧪 PayPal 沙盒 API 连接测试\n');
  console.log('='.repeat(50));
  console.log(`📋 Client ID: ${clientId.substring(0, 20)}...\n`);

  if (!clientSecret || clientSecret.includes('YOUR_') || clientSecret.length < 10) {
    console.log('❌ 错误: 请提供 Client Secret\n');
    console.log('有两种方式提供 Client Secret:\n');
    console.log('方式1: 直接输入');
    console.log('  运行: set VITE_PAYPAL_CLIENT_SECRET=您的Secret && node test-paypal-sandbox.js');
    console.log('');
    console.log('方式2: 手动更新 .env.local 文件');
    console.log('  VITE_PAYPAL_CLIENT_SECRET=您的Secret');
    console.log('  然后运行: node test-paypal-sandbox.js\n');
    console.log('💡 获取Client Secret:');
    console.log('  1. 访问 https://developer.paypal.com');
    console.log('  2. 进入 Dashboard -> REST API apps');
    console.log('  3. 点击您的应用');
    console.log('  4. 点击 "Show" 查看 Client Secret');
    return;
  }

  try {
    // 测试1: 获取Access Token
    console.log('📡 测试1: 获取Access Token...');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log(`   Client ID长度: ${clientId.length}`);
    console.log(`   Client Secret长度: ${clientSecret.length}`);
    console.log(`   Auth header: Basic ${auth.substring(0, 20)}...`);
    
    const tokenResponse = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      const errorMsg = errorData.error_description || errorData.message || tokenResponse.statusText;
      console.log(`   错误详情: ${JSON.stringify(errorData)}`);
      throw new Error(`HTTP ${tokenResponse.status}: ${errorMsg}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access Token 获取成功!');
    console.log(`   Token类型: ${tokenData.token_type}`);
    console.log(`   有效期: ${tokenData.expires_in}秒\n`);

    // 测试2: 创建测试订单
    console.log('📦 测试2: 创建测试订单...');
    const orderResponse = await fetch(`${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `test-order-${Date.now()}`
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
          brand_name: 'TinyTech Test',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:3000/checkout/success',
          cancel_url: 'http://localhost:3000/checkout/cancel'
        }
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(error.message || `HTTP ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();
    console.log('✅ 测试订单创建成功!');
    console.log(`   订单ID: ${orderData.id}`);
    console.log(`   状态: ${orderData.status}`);
    
    const approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
    if (approvalUrl) {
      console.log(`   批准URL: ${approvalUrl}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 PayPal 沙盒 API 连接测试完成!');
    console.log('\n💡 下一步:');
    console.log('1. 访问上面的批准URL完成支付');
    console.log('2. 使用沙盒账户登录 (email: buyer@ex.com, password: 12345678)');
    console.log('3. 测试完成后可以运行 captureOrder 来捕获付款');
    console.log(`   捕获命令: curl -X POST "${PAYPAL_SANDBOX_API_BASE}/v2/checkout/orders/${orderData.id}/capture" \\`);
    console.log(`     -H "Authorization: Bearer ${accessToken}" \\`);
    console.log('     -H "Content-Type: application/json"');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n🔧 排查建议:');
    console.log('');
    console.log('1. 检查凭证是否正确:');
    console.log('   - 登录 https://developer.paypal.com');
    console.log('   - 进入 Dashboard -> REST API apps');
    console.log('   - 点击您的应用，复制最新的凭证');
    console.log('');
    console.log('2. 确认Secret格式:');
    console.log('   - 确保没有多余的空格');
    console.log('   - 确保没有换行符');
    console.log('   - 复制完整长度 (应该是80-100字符)');
    console.log('');
    console.log('3. 检查应用状态:');
    console.log('   - 确认应用没有被删除');
    console.log('   - 确认账户没有被暂停');
    console.log('');
    console.log('4. 如果凭证是新的，请等待几分钟再试');
  }
}

testPayPalConnection();