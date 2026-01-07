# PayPal地址信息集成指南

## 概述

PayPal支付完成后，系统会自动获取用户的地址信息并推送给你。这包括收货地址和付款人信息。

## 地址信息获取流程

### 1. 用户完成PayPal支付
- 用户在PayPal页面完成支付
- PayPal重定向回你的网站
- 系统自动捕获支付并获取订单详情

### 2. 自动提取地址信息
系统会提取以下信息：

#### 收货地址 (Shipping Address)
```javascript
{
  shipping: {
    name: "收件人姓名",
    address_line_1: "地址第一行",
    address_line_2: "地址第二行（可选）",
    admin_area_1: "州/省",
    admin_area_2: "城市",
    postal_code: "邮政编码",
    country_code: "国家代码（如US, IT, CN）"
  }
}
```

#### 付款人信息 (Payer Information)
```javascript
{
  payer: {
    name: "付款人姓名",
    email: "付款人邮箱",
    phone: "付款人电话（如果提供）"
  }
}
```

### 3. 地址信息推送

#### 当前实现
地址信息会在控制台中打印，你可以看到完整的地址数据：

```javascript
console.log('[PayPal] Extracted address info:', addressInfo);
```

#### 发送到服务器（需要你实现）
在 `App.tsx` 的 `handlePayPalReturn` 函数中，有一个注释的示例：

```javascript
// 你可以在这里将地址信息发送到你的服务器
// await sendAddressToServer(token, addressInfo);
```

## 实现服务器集成

### 1. 创建API端点
在你的后端创建一个接收地址信息的API端点：

```javascript
// 示例：Node.js/Express
app.post('/api/orders/paypal-address', async (req, res) => {
  const { orderId, addressInfo } = req.body;
  
  try {
    // 保存地址信息到数据库
    await saveOrderAddress(orderId, addressInfo);
    
    // 可以发送确认邮件给客户
    await sendOrderConfirmation(addressInfo.payer.email, orderId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
});
```

### 2. 前端发送地址信息
在 `App.tsx` 中实现 `sendAddressToServer` 函数：

```javascript
const sendAddressToServer = async (orderId, addressInfo) => {
  try {
    const response = await fetch('/api/orders/paypal-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        addressInfo,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send address to server');
    }
    
    console.log('[PayPal] Address sent to server successfully');
  } catch (error) {
    console.error('[PayPal] Error sending address to server:', error);
  }
};
```

然后在 `handlePayPalReturn` 函数中调用它：

```javascript
// 将地址信息发送到服务器
await sendAddressToServer(token, addressInfo);
```

## 地址信息字段说明

### PayPal地址字段映射
- `address_line_1`: 主要地址（街道地址）
- `address_line_2`: 补充地址（公寓号、楼层等）
- `admin_area_1`: 州/省/地区
- `admin_area_2`: 城市
- `postal_code`: 邮政编码/ZIP码
- `country_code`: ISO 3166-1 alpha-2 国家代码

### 不同国家的地址格式
- **美国**: admin_area_1 = 州, admin_area_2 = 城市
- **中国**: admin_area_1 = 省, admin_area_2 = 城市
- **意大利**: admin_area_1 = 地区, admin_area_2 = 城市

## 测试地址信息

### 沙盒测试
1. 使用PayPal沙盒账户完成支付
2. 在PayPal支付页面填写测试地址
3. 完成支付后检查控制台输出
4. 验证地址信息是否正确提取

### 示例测试地址
```
地址第一行: Via Roma 123
城市: Milano
邮政编码: 20100
国家: Italy
```

## 注意事项

1. **地址验证**: PayPal会验证地址格式，但建议在你的系统中也进行验证
2. **隐私保护**: 地址信息包含敏感数据，确保安全传输和存储
3. **错误处理**: 实现适当的错误处理机制
4. **日志记录**: 记录地址信息的接收和处理过程，便于调试

## 快捷支付 vs 常规支付

### 快捷支付（Express Checkout）
- 用户无需在你的网站填写地址
- PayPal收集并提供完整的地址信息
- 适合想要快速结账的用户

### 常规支付（Regular Payment）
- 用户在你的网站填写地址
- PayPal支付完成后，你同时拥有网站地址和PayPal地址
- 可以对比两个地址确保一致性

## 总结

PayPal支付完成后，系统会自动：
1. ✅ 捕获支付
2. ✅ 获取订单详情
3. ✅ 提取地址信息
4. ✅ 在控制台显示地址数据
5. 🔄 发送到你的服务器（需要你实现API端点）

地址信息包括完整的收货地址和付款人信息，可以直接用于订单处理和物流配送。