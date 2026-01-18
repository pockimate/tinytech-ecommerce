# PayPal 信用卡支付配置指南

## ✅ 当前状态

您的网站现在使用 **PayPal** 作为支付处理器来处理信用卡支付。

## 🔐 工作原理

1. **用户输入信用卡信息** - 在您的结账页面
2. **创建 PayPal 订单** - 使用 PayPal Orders API
3. **处理信用卡** - PayPal 验证和处理卡片
4. **捕获支付** - 完成交易
5. **订单完成** - 用户看到成功页面

## 📋 已配置的内容

### 1. PayPal Live 凭证
```
✅ VITE_PAYPAL_CLIENT_ID - 已配置
✅ VITE_PAYPAL_CLIENT_SECRET - 已配置
✅ VITE_PAYPAL_API_BASE - https://api-m.paypal.com
```

### 2. 信用卡验证
- ✅ Luhn 算法验证
- ✅ 卡类型检测（Visa, Mastercard, Amex等）
- ✅ 过期日期验证
- ✅ CVV 验证
- ✅ 持卡人姓名验证

### 3. 支付流程
- ✅ 创建订单
- ✅ 处理信用卡
- ✅ 捕获支付
- ✅ 错误处理

## ⚠️ 重要：PayPal Advanced Card Processing

要在生产环境中处理信用卡，您需要：

### 1. 启用 Advanced Card Processing

在 PayPal 开发者平台：

1. 登录 https://developer.paypal.com
2. 选择您的 Live 应用
3. 在 **Features** 部分，启用：
   - ✅ **Accept payments**
   - ✅ **Advanced Credit and Debit Card Payments**

### 2. 完成商家认证

PayPal 需要验证您的商家账户才能处理信用卡：

1. 提供商业信息
2. 验证银行账户
3. 提交身份证明文件
4. 等待审核（通常 1-3 个工作日）

### 3. 配置支付接收

确保您的 PayPal 商家账户可以接收付款：

1. 添加银行账户
2. 设置自动转账
3. 配置货币偏好

## 💳 支持的信用卡

PayPal 支持以下信用卡：

- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Discover
- ✅ JCB
- ✅ Diners Club

## 💰 费用

### PayPal 交易费用

**标准费率**: 2.9% + 固定费用

| 货币 | 固定费用 |
|------|---------|
| USD  | $0.30   |
| EUR  | €0.35   |
| GBP  | £0.20   |
| JPY  | ¥40     |

### 国际交易

- 额外 1.5% 用于货币转换
- 额外 1.5% 用于跨境交易

## 🧪 测试

### 测试模式（Sandbox）

使用 Sandbox 凭证测试：

```bash
# .env.local
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
VITE_PAYPAL_CLIENT_SECRET=your_sandbox_secret
VITE_PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```

**测试卡号**:
```
Visa: 4032 0388 0796 1527
Mastercard: 5425 2334 3010 9903
Amex: 3782 822463 10005
```

### 生产模式（Live）

使用 Live 凭证（已配置）：

```bash
# .env.production
VITE_PAYPAL_CLIENT_ID=AbP53A18hJh2mL92zcJir52Z4P13RGiKGmV7UvUrXxwRo3UJzfCYxDZsruJppZ3OWgt4uOIkwMEdhSmu
VITE_PAYPAL_CLIENT_SECRET=EFACaRcwHRt_Wx8Ww3MzOijFk9ZDbLVqA_jP66RH9wITp6O3lVeJNoQApv75OEhIoRUSGOWQJHDlhXtb
VITE_PAYPAL_API_BASE=https://api-m.paypal.com
```

## 🔒 安全性

### PCI DSS 合规

使用 PayPal 处理信用卡的好处：

- ✅ **PayPal 处理 PCI 合规** - 您不需要自己认证
- ✅ **卡片信息不存储在您的服务器** - 直接发送到 PayPal
- ✅ **内置欺诈检测** - PayPal 的风险管理
- ✅ **3D Secure 支持** - 额外的安全层

### 最佳实践

1. **使用 HTTPS** - 所有页面必须使用 SSL
2. **不记录卡片信息** - 永远不要记录完整的卡号
3. **验证所有输入** - 前端和后端都要验证
4. **监控交易** - 定期检查异常活动

## 📊 监控和报告

### PayPal Dashboard

访问 https://www.paypal.com/businessmanage/account/transactions

查看：
- 交易历史
- 退款
- 争议
- 报告

### Webhook 通知

已配置的 Webhook：
```
URL: https://www.pockimate.com/api/paypal-webhook
Events:
  - PAYMENT.CAPTURE.COMPLETED
  - PAYMENT.CAPTURE.DENIED
  - PAYMENT.CAPTURE.REFUNDED
```

## 🔄 退款流程

### 如何退款

1. 登录 PayPal Dashboard
2. 找到交易
3. 点击 "Refund"
4. 输入退款金额
5. 确认退款

### 通过 API 退款

```typescript
import { refundPayPalPayment } from './services/paypal';

const result = await refundPayPalPayment(
  captureId,  // 从支付结果获取
  amount,     // 退款金额
  currency    // 货币代码
);
```

## ❓ 常见问题

### Q: 为什么我的信用卡支付失败？

**可能原因**:
1. 卡片信息不正确
2. 余额不足
3. 卡片被银行拒绝
4. PayPal Advanced Card Processing 未启用
5. 商家账户未完成认证

### Q: 支付成功但订单未创建？

**检查**:
1. 查看浏览器控制台错误
2. 检查 PayPal Webhook 日志
3. 验证数据库连接
4. 查看服务器日志

### Q: 如何处理争议？

1. 登录 PayPal Resolution Center
2. 查看争议详情
3. 提供证据（发货证明、通信记录等）
4. 等待 PayPal 裁决

### Q: 可以同时使用 PayPal 和 Stripe 吗？

可以！您可以提供多个支付选项：
- PayPal（已集成）
- 信用卡通过 PayPal（已集成）
- Google Pay（已集成）
- Stripe（需要额外集成）

## 📞 支持

### PayPal 商家支持

- **网站**: https://www.paypal.com/merchantsupport
- **电话**: 查看您所在地区的支持号码
- **社区**: https://community.paypal.com

### 技术文档

- **Orders API**: https://developer.paypal.com/docs/api/orders/v2/
- **Card Processing**: https://developer.paypal.com/docs/checkout/advanced/integrate/
- **Webhooks**: https://developer.paypal.com/docs/api-basics/notifications/webhooks/

## ✅ 上线检查清单

在生产环境启用信用卡支付前：

- [ ] PayPal Live 凭证已配置
- [ ] Advanced Card Processing 已启用
- [ ] 商家账户已完成认证
- [ ] 银行账户已添加
- [ ] Webhook 已配置并测试
- [ ] 在 Sandbox 环境充分测试
- [ ] 进行小额真实交易测试（€0.01）
- [ ] 测试退款流程
- [ ] 错误处理已实施
- [ ] 日志记录已配置
- [ ] 客户支持流程已准备

## 🎉 完成！

您的网站现在可以通过 PayPal 处理信用卡支付了！

所有支付都会通过 PayPal 的安全基础设施处理，您不需要担心 PCI 合规或存储敏感的卡片信息。
