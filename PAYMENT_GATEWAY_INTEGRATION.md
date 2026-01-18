# 支付网关集成指南

## ⚠️ 当前状态

**当前的信用卡支付是演示模式**，不会处理真实的支付交易。

在生产环境中，您需要集成真实的支付网关来处理信用卡支付。

## 🔐 为什么需要支付网关？

直接处理信用卡信息需要：
1. **PCI DSS 合规认证** - 极其昂贵和复杂
2. **安全的服务器基础设施** - 防止数据泄露
3. **欺诈检测系统** - 防止欺诈交易
4. **银行关系** - 与银行建立商户账户

**使用支付网关可以避免这些复杂性**，它们已经处理了所有这些问题。

## 💳 推荐的支付网关

### 1. Stripe (推荐)

**优点**:
- 最受欢迎的支付网关
- 优秀的开发者体验
- 支持全球支付
- 内置欺诈检测
- 详细的文档

**费用**: 2.9% + $0.30 每笔交易

**集成步骤**:

#### 安装 Stripe SDK
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### 创建 Stripe 服务
```typescript
// services/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createPaymentIntent(amount: number, currency: string) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency })
  });
  
  return response.json();
}

export { stripePromise };
```

#### 后端 API (Netlify Function)
```javascript
// netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, currency } = JSON.parse(event.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

#### 更新 Checkout 组件
```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent } from '../services/stripe';

const handlePlaceOrder = async () => {
  if (!validateShipping() || !validatePayment()) return;
  
  setIsProcessing(true);
  
  try {
    // 创建 Payment Intent
    const { clientSecret } = await createPaymentIntent(actualTotal, currency);
    
    // 确认支付
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: paymentInfo.cardHolder,
          email: shippingInfo.email,
          address: {
            line1: shippingInfo.address,
            city: shippingInfo.city,
            postal_code: shippingInfo.zipCode,
            country: shippingInfo.country,
          },
        },
      },
    });
    
    if (error) {
      alert('Payment failed: ' + error.message);
      setIsProcessing(false);
      return;
    }
    
    if (paymentIntent.status === 'succeeded') {
      // 保存订单到数据库
      const orderId = await saveOrder({
        paymentIntentId: paymentIntent.id,
        amount: actualTotal,
        currency,
        shipping: shippingInfo,
      });
      
      onOrderComplete(orderId);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('An error occurred. Please try again.');
    setIsProcessing(false);
  }
};
```

**环境变量**:
```bash
# .env.production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

**文档**: https://stripe.com/docs

---

### 2. Square

**优点**:
- 适合实体店和在线业务
- 统一的支付系统
- 良好的报告工具

**费用**: 2.9% + $0.30 每笔交易

**集成步骤**:

```bash
npm install square
```

```typescript
// services/square.ts
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: import.meta.env.VITE_SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

export async function createPayment(amount: number, sourceId: string) {
  const { result } = await client.paymentsApi.createPayment({
    sourceId,
    amountMoney: {
      amount: BigInt(Math.round(amount * 100)),
      currency: 'USD',
    },
    idempotencyKey: crypto.randomUUID(),
  });
  
  return result;
}
```

**文档**: https://developer.squareup.com/docs

---

### 3. PayPal Advanced Card Processing

**优点**:
- 已经集成了 PayPal
- 可以添加信用卡处理
- 统一的支付体验

**集成步骤**:

使用 PayPal 的 Card Fields 组件（已在代码中部分实现）

```typescript
// 在 Checkout 组件中
const cardFields = await paypal.CardFields({
  createOrder: async () => {
    const order = await createPayPalOrder(actualTotal, currency);
    return order.id;
  },
  onApprove: async (data) => {
    const result = await capturePayPalOrder(data.orderID);
    if (result.success) {
      onOrderComplete(data.orderID);
    }
  },
});

// 渲染卡片字段
cardFields.NumberField().render('#card-number');
cardFields.ExpiryField().render('#card-expiry');
cardFields.CVVField().render('#card-cvv');
```

**文档**: https://developer.paypal.com/docs/checkout/advanced/integrate/

---

## 🔒 安全最佳实践

### 1. 永远不要在前端存储敏感信息
```typescript
// ❌ 错误
localStorage.setItem('cardNumber', cardNumber);

// ✅ 正确
// 直接发送到支付网关，不存储
```

### 2. 使用 HTTPS
所有支付页面必须使用 HTTPS

### 3. 实施 CSP (Content Security Policy)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://js.stripe.com">
```

### 4. 验证所有输入
- 前端验证（用户体验）
- 后端验证（安全性）

### 5. 记录所有交易
```typescript
await logTransaction({
  orderId,
  amount,
  currency,
  status: 'success',
  paymentMethod: 'card',
  timestamp: new Date(),
});
```

---

## 📊 比较表

| 功能 | Stripe | Square | PayPal |
|------|--------|--------|--------|
| 交易费用 | 2.9% + $0.30 | 2.9% + $0.30 | 2.9% + $0.30 |
| 国际支付 | ✅ 优秀 | ✅ 良好 | ✅ 优秀 |
| 开发者体验 | ✅ 优秀 | ✅ 良好 | ⚠️ 一般 |
| 文档质量 | ✅ 优秀 | ✅ 良好 | ✅ 良好 |
| 欺诈检测 | ✅ 内置 | ✅ 内置 | ✅ 内置 |
| 订阅支持 | ✅ 是 | ✅ 是 | ✅ 是 |
| 移动 SDK | ✅ 是 | ✅ 是 | ✅ 是 |

---

## 🚀 快速开始（Stripe 示例）

### 1. 注册 Stripe 账户
访问 https://dashboard.stripe.com/register

### 2. 获取 API 密钥
Dashboard → Developers → API keys

### 3. 安装依赖
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 4. 添加环境变量
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 5. 创建后端 API
在 `netlify/functions/` 或 `api/` 目录创建支付端点

### 6. 更新前端代码
集成 Stripe Elements 到 Checkout 组件

### 7. 测试
使用 Stripe 测试卡号：
- 成功: 4242 4242 4242 4242
- 失败: 4000 0000 0000 0002

### 8. 上线
切换到生产环境密钥

---

## ❓ 常见问题

### Q: 我必须使用支付网关吗？
A: 是的，除非您想自己处理 PCI DSS 合规（非常昂贵和复杂）。

### Q: 哪个支付网关最好？
A: Stripe 通常是最受欢迎的选择，因为其优秀的开发者体验和文档。

### Q: 费用是多少？
A: 大多数支付网关收取 2.9% + $0.30 每笔交易。

### Q: 需要多长时间集成？
A: 使用 Stripe，有经验的开发者可以在 1-2 天内完成基本集成。

### Q: 如何处理退款？
A: 所有主要支付网关都提供退款 API。

---

## 📚 相关资源

- **Stripe 文档**: https://stripe.com/docs
- **Square 文档**: https://developer.squareup.com
- **PayPal 文档**: https://developer.paypal.com
- **PCI DSS 标准**: https://www.pcisecuritystandards.org

---

## ⚠️ 重要提醒

**在生产环境中使用真实支付之前**:

1. ✅ 完成支付网关集成
2. ✅ 在测试模式下充分测试
3. ✅ 实施错误处理和日志记录
4. ✅ 设置 Webhook 接收支付状态更新
5. ✅ 配置退款流程
6. ✅ 添加欺诈检测规则
7. ✅ 准备客户支持流程
8. ✅ 审查法律和合规要求

**当前的演示模式仅用于展示 UI/UX，不应在生产环境中使用！**
