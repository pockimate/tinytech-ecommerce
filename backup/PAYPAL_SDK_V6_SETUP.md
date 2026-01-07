# PayPal SDK v6 集成指南

## 当前状态

✅ **开发环境**: 使用Demo按钮模拟PayPal和Google Pay支付流程
✅ **UI集成**: 快速支付按钮已正确放置在结账页面左侧顶部
✅ **错误处理**: 完善的错误处理和用户反馈机制

## 生产环境设置

要在生产环境中启用真实的PayPal SDK v6集成，需要以下步骤：

### 1. 服务器端客户端令牌生成

创建一个服务器端点来生成PayPal客户端令牌：

```javascript
// /api/paypal/client-token
app.get('/api/paypal/client-token', async (req, res) => {
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/identity/generate-token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    res.json({ clientToken: data.client_token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate client token' });
  }
});
```

### 2. 启用真实SDK v6

在 `components/Checkout.tsx` 中，将开发模式切换为生产模式：

```typescript
// 将这行：
console.log('[PayPal] Using fallback buttons for development');

// 改为：
if (window.paypal && window.paypal.createInstance) {
  console.log('[PayPal] SDK v6 already loaded');
  setPaypalSDKLoaded(true);
  return;
}

console.log('[PayPal] Loading SDK v6...');
const script = document.createElement('script');
script.src = 'https://www.sandbox.paypal.com/web-sdk/v6/core'; // 生产环境使用: https://www.paypal.com/web-sdk/v6/core
script.async = true;
script.onload = () => {
  console.log('[PayPal] SDK v6 loaded successfully');
  setPaypalSDKLoaded(true);
};
document.head.appendChild(script);
```

### 3. 客户端令牌获取

更新 `getBrowserSafeClientToken` 函数：

```typescript
const getBrowserSafeClientToken = async () => {
  try {
    const response = await fetch('/api/paypal/client-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.clientToken;
    } else {
      throw new Error('Failed to get client token');
    }
  } catch (error) {
    console.error('[PayPal] Client token error:', error);
    throw error;
  }
};
```

### 4. 环境配置

确保在 `.env.production` 中设置正确的PayPal配置：

```env
# 生产环境PayPal配置
VITE_PAYPAL_CLIENT_ID=your_live_client_id
VITE_PAYPAL_CLIENT_SECRET=your_live_client_secret
VITE_PAYPAL_API_BASE=https://api-m.paypal.com
```

## 当前功能

### ✅ 已实现功能
- 快速支付按钮位置正确（左侧表单顶部）
- PayPal Demo按钮（开发环境）
- Google Pay占位符（开发环境）
- 完整的支付流程模拟
- 错误处理和用户反馈
- TypeScript类型安全
- 响应式设计

### 🔄 待生产环境配置
- 真实PayPal SDK v6集成
- 服务器端客户端令牌生成
- Google Pay真实集成
- 生产环境测试

## 测试

当前可以测试：
1. 点击PayPal Demo按钮 → 模拟支付成功
2. 查看Google Pay占位符显示
3. 验证按钮位置和样式
4. 测试错误处理流程

## 注意事项

- PayPal SDK v6需要有效的JWT客户端令牌
- 客户端令牌必须从服务器端生成，不能在前端硬编码
- Google Pay需要通过PayPal SDK v6的eligibility检查
- 生产环境需要使用HTTPS和真实的PayPal凭据