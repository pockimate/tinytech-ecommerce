# PayPal 沙盒集成测试指南

## ✅ 已完成的集成

### 1. 真实PayPal API集成
- 使用PayPal沙盒环境
- 真实的订单创建和支付捕获
- 完整的支付流程

### 2. 支付按钮
- **快速支付按钮**: 位于结账页面左侧顶部
- **PayPal支付方式按钮**: 选择PayPal支付方式后显示
- **订单摘要按钮**: 右侧订单摘要中的"Proceed to PayPal"

### 3. 支付流程
1. 用户点击PayPal按钮
2. 创建PayPal订单（调用真实API）
3. 跳转到PayPal沙盒进行支付
4. 用户在PayPal完成支付
5. 返回应用并自动捕获支付
6. 跳转到订单成功页面

## 🧪 测试步骤

### 测试环境
- **PayPal环境**: 沙盒 (sandbox)
- **API端点**: https://api-m.sandbox.paypal.com
- **客户端ID**: AdYd8c4-8sqDdUh4F4rpGyixCVDGnuMLT_BxF8bcTX6mEErfUq__BPnQgS-67gIJdruYnRBwEOrXvAs1

### 测试用PayPal账户
使用PayPal沙盒测试账户：
- **买家账户**: sb-buyer@personal.example.com
- **密码**: 通常是自动生成的测试密码
- 或者可以在PayPal Developer Dashboard创建测试账户

### 测试流程
1. **添加商品到购物车**
2. **进入结账页面**
3. **点击任意PayPal按钮**
4. **验证订单创建**:
   - 检查浏览器控制台日志
   - 应该看到: `[PayPal] Order created: XXXXXXXXXX`
5. **PayPal支付页面**:
   - 自动跳转到PayPal沙盒
   - 使用测试账户登录
   - 确认支付
6. **返回应用**:
   - 自动返回到应用
   - 支付被自动捕获
   - 跳转到成功页面

## 🔍 调试信息

### 浏览器控制台日志
正常流程应该看到：
```
[PayPal] Using development fallback buttons
[PayPal] Setting up buttons...
[PayPal] Starting real PayPal payment
[PayPal] Order created: 7XX12345XX123456X
[PayPal] Approval URL: https://www.sandbox.paypal.com/checkoutnow?token=...
[PayPal] Payment approved, capturing order...
[PayPal] Payment captured successfully
```

### 错误排查
如果遇到问题，检查：
1. **网络请求**: 开发者工具 → Network 标签
2. **PayPal API响应**: 查看API调用结果
3. **控制台错误**: 任何JavaScript错误
4. **环境变量**: 确认.env.local中的PayPal配置

## 💳 测试支付信息

### PayPal沙盒测试卡
- **Visa**: 4032035728926093
- **MasterCard**: 5425233430109903
- **American Express**: 374245455400001

### 测试金额
- 当前测试金额: €{实际订单总额}
- 支持的货币: EUR (欧元)

## 🚀 生产环境部署

要切换到生产环境：
1. 更新 `.env.production`:
   ```
   VITE_PAYPAL_CLIENT_ID=your_live_client_id
   VITE_PAYPAL_CLIENT_SECRET=your_live_client_secret
   VITE_PAYPAL_API_BASE=https://api-m.paypal.com
   ```
2. 在PayPal Developer Dashboard中获取生产环境凭据
3. 测试生产环境的支付流程

## ⚠️ 注意事项

1. **沙盒限制**: 沙盒环境仅用于测试，不会产生真实费用
2. **返回URL**: 应用会处理PayPal返回的URL参数
3. **错误处理**: 包含完整的错误处理和用户反馈
4. **安全性**: 客户端密钥仅用于服务器端API调用

现在PayPal集成已经完成，可以进行真实的沙盒支付测试！