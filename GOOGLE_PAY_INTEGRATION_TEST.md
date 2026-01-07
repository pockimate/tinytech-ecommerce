# Google Pay 沙盒集成测试指南

## ✅ 已完成的Google Pay集成

### 1. Google Pay API集成
- 使用Google Pay官方API
- 沙盒测试环境 (TEST mode)
- 官方按钮样式和交互
- 回退到PayPal处理机制

### 2. 支付流程
1. **加载Google Pay API**: 从 `https://pay.google.com/gp/p/js/pay.js`
2. **创建官方按钮**: 使用Google Pay API创建标准按钮
3. **地址验证**: 确保收货地址完整
4. **支付处理**: 
   - 优先使用Google Pay API
   - 回退到PayPal处理Google Pay订单
5. **订单完成**: 跳转到成功页面

### 3. 按钮功能
- **快速支付区域**: Google Pay官方按钮
- **地址验证**: 与PayPal相同的验证逻辑
- **错误处理**: 完整的错误处理和用户反馈

## 🧪 测试步骤

### 测试环境配置
- **Google Pay环境**: TEST (沙盒模式)
- **支持的卡网络**: VISA, MasterCard
- **认证方法**: PAN_ONLY, CRYPTOGRAM_3DS

### Google Pay测试流程
1. **添加商品到购物车**
2. **进入结账页面**
3. **填写完整的收货地址**
4. **点击Google Pay按钮**
5. **验证Google Pay弹窗**:
   - 应该显示Google Pay支付界面
   - 显示正确的金额和货币
   - 显示商户名称 "TinyTech"
6. **完成支付测试**:
   - 使用测试卡信息
   - 确认支付
   - 验证返回到成功页面

### 回退测试
如果Google Pay API不可用：
1. **自动回退**: 显示自定义Google Pay按钮
2. **PayPal处理**: 点击后通过PayPal处理Google Pay订单
3. **完整流程**: 跳转PayPal → 完成支付 → 返回成功页面

## 🔍 调试信息

### 浏览器控制台日志
正常流程应该看到：
```
[Google Pay] API loaded successfully
[Google Pay] Official button created
[Google Pay] Starting Google Pay payment
[Google Pay] Payment successful: {paymentData}
```

回退流程应该看到：
```
[Google Pay] API not available, setting up fallback
[Google Pay] Fallback button created
[Google Pay] Using PayPal as fallback for Google Pay
[Google Pay] PayPal order created: 7XX12345XX123456X
```

### 测试卡信息
Google Pay沙盒支持的测试卡：
- **Visa**: 4111111111111111
- **MasterCard**: 5555555555554444
- **到期日**: 任何未来日期
- **CVV**: 任何3位数字

## 🎯 功能特性

### Google Pay官方集成
- ✅ 官方Google Pay按钮样式
- ✅ 标准Google Pay支付流程
- ✅ 沙盒测试环境
- ✅ 多种支付方式支持

### 地址验证
- ✅ 与PayPal相同的验证逻辑
- ✅ 自动滚动到错误字段
- ✅ 友好的错误提示

### 回退机制
- ✅ API不可用时自动回退
- ✅ 通过PayPal处理Google Pay订单
- ✅ 保持完整的支付流程

### 用户体验
- ✅ 无缝的支付体验
- ✅ 清晰的错误处理
- ✅ 一致的界面设计

## ⚠️ 注意事项

1. **沙盒限制**: 仅用于测试，不产生真实费用
2. **浏览器支持**: 需要支持Google Pay的现代浏览器
3. **HTTPS要求**: Google Pay API需要HTTPS环境
4. **回退机制**: 确保在API不可用时有备选方案

## 🚀 生产环境配置

要切换到生产环境：
1. **更新环境**: 将 `environment: 'TEST'` 改为 `'PRODUCTION'`
2. **商户配置**: 使用真实的Google Pay商户ID
3. **网关配置**: 配置真实的支付网关参数
4. **域名验证**: 在Google Pay控制台添加生产域名

现在Google Pay已经完全集成，支持官方API和沙盒测试！