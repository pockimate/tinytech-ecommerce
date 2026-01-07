# PayPal 沙盒 API 配置指南

## 概述

本项目已集成PayPal沙盒API，用于测试支付功能。在投入生产环境之前，请按照以下步骤配置沙盒环境。

## 快速开始

### 步骤 1: 访问PayPal开发者平台

1. 打开浏览器访问: **https://developer.paypal.com**
2. 使用您的PayPal账户登录（如果没有账户，需要先注册）
3. 如果是首次登录，系统会自动创建开发者账户

### 步骤 2: 创建沙盒账户

登录后，您会看到开发者仪表板：

```
┌─────────────────────────────────────────────────────────┐
│  PayPal Developer Dashboard                              │
├─────────────────────────────────────────────────────────┤
│  [Sandbox]  [Notifications]  [Webhooks]  [Logs]         │
│                                                          │
│  📋 Sandbox Accounts                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Type          Email               Status       │    │
│  │  Business      biz@ex.com          ✅ Active    │    │
│  │  Personal      buyer@ex.com        ✅ Active    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Create Account]                                        │
└─────────────────────────────────────────────────────────┘
```

**重要**: 系统会自动创建两个沙盒账户：
- **商家账户 (Business)**: 用于接收付款
- **个人账户 (Personal)**: 用于模拟买家付款

**默认测试账户凭证**:
```
买家账户:
- Email: buyer@ex.com
- Password: 12345678

商家账户:
- Email: biz@ex.com  
- Password: 12345678
```

### 步骤 3: 创建REST API应用

1. 在左侧菜单中点击 **"REST API apps"**
2. 点击 **"Create app"** 按钮
3. 填写应用信息:
   - App Name: `TinyTech Sandbox` (或您喜欢的名称)
   - Sandbox Developer Account: 选择您的商家账户
4. 点击 **"Create app"** 完成创建

### 步骤 4: 获取API凭证

创建应用后，您会看到以下信息：

```
┌─────────────────────────────────────────────────────────┐
│  App Details - TinyTech Sandbox                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🆔 Client ID                                            │
│  AeB1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJ     │
│  [📋 Copy]                                               │
│                                                          │
│  🔑 Client Secret                                        │
│  *****************************************************   │
│  [👁 Show] [📋 Copy]                                     │
│                                                          │
│  [Edit] [Delete]                                         │
└─────────────────────────────────────────────────────────┘
```

**注意**: 
- Client ID 是公开的，可以在前端代码中使用
- Client Secret 必须保密，仅用于服务端API调用

### 步骤 5: 配置环境变量

编辑项目根目录下的 `.env.local` 文件：

```bash
# PayPal Sandbox API - 从开发者仪表板获取
VITE_PAYPAL_CLIENT_ID=您的Client_ID
VITE_PAYPAL_CLIENT_SECRET=您的Client_Secret

# API Base URL (沙盒环境)
VITE_PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```

**重要**: `.env.local 文件已添加到 .gitignore，不会提交到代码仓库。

### 步骤 6: 测试连接

运行测试脚本验证配置：

```bash
node test-paypal-sandbox.js
```

如果配置正确，您将看到：
```
🧪 PayPal 沙盒 API 连接测试

📡 测试1: 获取Access Token...
✅ Access Token 获取成功!

📦 测试2: 创建测试订单...
✅ 测试订单创建成功!
   订单ID: 123456789
   状态: CREATED
```

## 测试支付流程

### 完整测试步骤

1. **创建订单**: 通过API创建订单，获取批准URL
2. **用户批准**: 访问批准URL，使用沙盒买家账户登录并确认付款
3. **捕获付款**: 调用capture API完成交易
4. **验证结果**: 检查订单状态为COMPLETED

### 使用沙盒测试卡

除了使用沙盒账户，您还可以使用测试卡号进行测试：

| 卡类型 | 卡号 | CVV | 有效期 |
|--------|------|-----|--------|
| Visa | 4032038079815685 | Any 3 digits | Any future date |
| Mastercard | 5500005555555559 | Any 3 digits | Any future date |

## 常见问题

### Q1: 获取Access Token失败

**错误**: `401 Unauthorized`
**原因**: Client ID或Client Secret错误
**解决**: 
- 确认凭证复制正确（注意不要有多余空格）
- 检查应用是否关联了正确的沙盒账户

### Q2: 创建订单失败

**错误**: `400 Bad Request`
**原因**: 请求参数格式错误
**解决**:
- 确认金额格式正确（如 "10.00" 而不是 10）
- 确认货币代码正确（如 "EUR"）
- 检查return_url和cancel_url是有效的URL

### Q3: 捕获订单失败

**错误**: `404 Not Found`
**原因**: 订单不存在或已被捕获
**解决**:
- 确认订单ID正确
- 确认订单状态是"CREATED"（已批准但未捕获）

### Q4: 订单状态不是COMPLETED

**原因**: 订单可能处于以下状态：
- `CREATED`: 刚创建，未批准
- `SAVED`: 已保存，未完成
- `APPROVED`: 已批准，未捕获
- `VOIDED`: 已作废

**解决**: 只有调用capture API后状态才会变为COMPLETED

## 沙盒 vs 生产环境

| 环境 | API Base URL | 用途 |
|------|--------------|------|
| Sandbox | `https://api-m.sandbox.paypal.com` | 开发测试 |
| Production | `https://api-m.paypal.com` | 真实交易 |

**重要**: 部署到生产环境前，请务必：
1. 更换为生产环境API URL
2. 使用生产环境的API凭证
3. 充分测试所有支付场景

## 相关资源

- **PayPal开发者文档**: https://developer.paypal.com/docs/api/overview/
- **沙盒测试指南**: https://developer.paypal.com/docs/api-basics/sandbox/
- **API参考**: https://developer.paypal.com/docs/api/orders/v2/
- **PayPal开发者社区**: https://community.paypal.com/

## 故障排除

如果遇到其他问题：

1. 查看浏览器控制台错误信息
2. 检查网络请求是否被阻止
3. 确认防火墙没有阻止PayPal域名
4. 尝试清除浏览器缓存后重试

---

**提示**: 沙盒环境与生产环境完全隔离，测试数据不会影响真实交易。