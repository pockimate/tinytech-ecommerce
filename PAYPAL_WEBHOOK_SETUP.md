# PayPal Webhook 配置指南

## 概述

PayPal Webhook 用于接收支付状态的实时通知，确保订单状态与支付状态同步。

## 配置步骤

### 1. 在 PayPal 开发者控制台创建 Webhook

1. 登录 [PayPal 开发者控制台](https://developer.paypal.com/dashboard/)
2. 进入 **My Apps & Credentials**
3. 选择你的应用（沙盒或生产环境）
4. 滚动到 **Webhooks** 部分
5. 点击 **Add Webhook**
6. 输入 Webhook URL：
   - 沙盒环境：`https://你的netlify域名.netlify.app/.netlify/functions/paypal-webhook`
   - 生产环境：`https://你的域名/.netlify/functions/paypal-webhook`
7. 选择要监听的事件：
   - `PAYMENT.CAPTURE.COMPLETED` - 支付完成
   - `PAYMENT.CAPTURE.DENIED` - 支付被拒绝
   - `PAYMENT.CAPTURE.REFUNDED` - 退款完成
   - `PAYMENT.CAPTURE.PENDING` - 支付待处理
   - `PAYMENT.CAPTURE.REVERSED` - 支付被撤销
   - `CHECKOUT.ORDER.APPROVED` - 订单已批准
   - `CHECKOUT.ORDER.COMPLETED` - 订单完成
8. 保存后，复制 **Webhook ID**

### 2. 在 Netlify 配置环境变量

在 Netlify 控制台 > Site settings > Environment variables 中添加：

```
PAYPAL_WEBHOOK_ID=你的Webhook ID
PAYPAL_CLIENT_ID=你的PayPal客户端ID
PAYPAL_CLIENT_SECRET=你的PayPal客户端密钥
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com  # 沙盒环境
# PAYPAL_API_BASE=https://api-m.paypal.com  # 生产环境
```

### 3. 部署到 Netlify

```bash
git add .
git commit -m "Add PayPal webhook support"
git push
```

Netlify 会自动部署并启用 Webhook 函数。

## 测试 Webhook

### 使用 PayPal Webhook 模拟器

1. 在 PayPal 开发者控制台，进入你的 Webhook 设置
2. 点击 **Simulate Event**
3. 选择事件类型（如 `PAYMENT.CAPTURE.COMPLETED`）
4. 点击 **Send Test**
5. 检查 Netlify Functions 日志确认收到事件

### 查看 Netlify Functions 日志

1. 登录 Netlify 控制台
2. 进入你的站点
3. 点击 **Functions** 标签
4. 选择 `paypal-webhook` 函数
5. 查看实时日志

## Webhook 事件类型说明

| 事件类型 | 说明 |
|---------|------|
| `PAYMENT.CAPTURE.COMPLETED` | 支付已成功捕获 |
| `PAYMENT.CAPTURE.DENIED` | 支付被拒绝 |
| `PAYMENT.CAPTURE.REFUNDED` | 支付已退款 |
| `PAYMENT.CAPTURE.PENDING` | 支付待处理 |
| `PAYMENT.CAPTURE.REVERSED` | 支付被撤销（争议） |
| `CHECKOUT.ORDER.APPROVED` | 买家已批准订单 |
| `CHECKOUT.ORDER.COMPLETED` | 订单已完成 |

## 安全注意事项

1. **签名验证**：所有 Webhook 请求都会验证 PayPal 签名，确保请求来自 PayPal
2. **HTTPS**：Webhook URL 必须使用 HTTPS
3. **环境变量**：敏感信息（如 Client Secret）存储在环境变量中，不要提交到代码库
4. **幂等处理**：同一事件可能被发送多次，确保处理逻辑是幂等的

## 故障排除

### Webhook 未收到事件

1. 检查 Webhook URL 是否正确
2. 确认 Netlify Functions 已部署
3. 检查 PayPal 控制台的 Webhook 日志

### 签名验证失败

1. 确认 `PAYPAL_WEBHOOK_ID` 正确
2. 确认 `PAYPAL_CLIENT_ID` 和 `PAYPAL_CLIENT_SECRET` 正确
3. 确认 `PAYPAL_API_BASE` 与你的环境匹配（沙盒/生产）

### 函数超时

Netlify Functions 默认超时 10 秒。如果处理逻辑复杂，考虑：
1. 异步处理（先返回 200，后台处理）
2. 使用队列服务

## 扩展功能

你可以在 `netlify/functions/paypal-webhook.ts` 中的 `handleWebhookEvent` 函数中添加：

- 更新数据库订单状态
- 发送确认邮件
- 触发库存更新
- 记录支付日志
- 发送通知到管理后台
