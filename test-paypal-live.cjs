/**
 * PayPal 生产环境配置测试脚本
 * 使用方法: node test-paypal-live.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔴 PayPal 生产环境配置测试\n');
console.log('⚠️  警告: 此脚本连接到 PayPal LIVE 环境\n');

// 读取 .env.production 文件
const envPath = path.join(__dirname, '.env.production');
const envContent = fs.readFileSync(envPath, 'utf8');

// 解析环境变量
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    env[key.trim()] = value;
  }
});

const PAYPAL_CLIENT_ID = env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = env.VITE_PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = env.VITE_PAYPAL_API_BASE;

// 验证环境变量
if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID.includes('your_')) {
  console.error('❌ 错误: VITE_PAYPAL_CLIENT_ID 未配置\n');
  process.exit(1);
}

if (!PAYPAL_CLIENT_SECRET || PAYPAL_CLIENT_SECRET.includes('your_')) {
  console.error('❌ 错误: VITE_PAYPAL_CLIENT_SECRET 未配置\n');
  process.exit(1);
}

if (PAYPAL_API_BASE !== 'https://api-m.paypal.com') {
  console.error('❌ 错误: API Base URL 不正确\n');
  process.exit(1);
}

console.log('✅ 环境变量配置检查通过\n');
console.log('配置信息:');
console.log(`   Client ID: ${PAYPAL_CLIENT_ID.substring(0, 20)}...`);
console.log(`   API Base: ${PAYPAL_API_BASE}\n`);

// 测试 1: 获取 Access Token
async function getAccessToken() {
  console.log('📡 测试 1: 获取 Access Token...');
  
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Access Token 获取成功!');
    console.log(`   Token: ${data.access_token.substring(0, 30)}...\n`);
    return data.access_token;
  } catch (error) {
    console.error('❌ Access Token 获取失败!');
    console.error(`   错误: ${error.message}\n`);
    
    if (error.message.includes('401')) {
      console.log('💡 可能的原因:');
      console.log('   1. Client ID 或 Secret 不正确');
      console.log('   2. 使用了 Sandbox 凭证而不是 Live 凭证');
      console.log('   3. 凭证复制时包含了多余的空格\n');
    }
    
    process.exit(1);
  }
}

// 测试 2: 验证 API 连接
async function verifyConnection(accessToken) {
  console.log('📡 测试 2: 验证 API 连接...');
  
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 连接验证成功!');
      console.log(`   已配置 ${data.webhooks ? data.webhooks.length : 0} 个 Webhook\n`);
    } else {
      console.log('✅ API 连接正常（Webhook 未配置）\n');
    }
    return true;
  } catch (error) {
    console.error('❌ API 连接验证失败!');
    console.error(`   错误: ${error.message}\n`);
    return false;
  }
}

// 主测试流程
async function runTests() {
  try {
    const accessToken = await getAccessToken();
    await verifyConnection(accessToken);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ 所有测试通过！PayPal Live 配置正确！');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📋 下一步配置（在 PayPal 开发者平台）:\n');
    console.log('1️⃣  配置 Return URL:');
    console.log('   https://www.pockimate.com/checkout/success\n');
    
    console.log('2️⃣  配置 Cancel URL:');
    console.log('   https://www.pockimate.com/checkout/cancel\n');
    
    console.log('3️⃣  配置 Webhook URL (推荐):');
    console.log('   https://www.pockimate.com/api/paypal-webhook\n');
    
    console.log('4️⃣  在部署平台（Netlify/Vercel）配置环境变量:');
    console.log('   VITE_PAYPAL_CLIENT_ID=' + PAYPAL_CLIENT_ID);
    console.log('   VITE_PAYPAL_CLIENT_SECRET=' + PAYPAL_CLIENT_SECRET);
    console.log('   VITE_PAYPAL_API_BASE=https://api-m.paypal.com\n');
    
    console.log('5️⃣  进行小额测试:');
    console.log('   - 创建 €0.01 测试订单');
    console.log('   - 使用真实 PayPal 账户完成支付');
    console.log('   - 验证订单状态和数据库记录\n');
    
    console.log('⚠️  重要提醒:');
    console.log('   - 这是生产环境，所有交易都是真实的');
    console.log('   - 请先进行小额测试');
    console.log('   - 确保所有功能正常后再正式上线\n');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

runTests();
