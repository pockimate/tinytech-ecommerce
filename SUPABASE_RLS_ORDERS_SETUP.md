# Supabase RLS + 订单系统配置指南

## 概述

本指南配置：
1. **Row Level Security (RLS)** - 数据行级安全策略
2. **订单系统** - 支持游客下单、用户订单、订单合并
3. **管理员权限** - 只有管理员可以修改产品和内容

## 配置步骤

### 第一步：执行 SQL

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `database/rls-and-orders.sql` 的内容
5. 点击 **Run** 执行

### 第二步：设置管理员

在 SQL Editor 中执行：

```sql
SELECT set_user_as_admin('你的管理员邮箱@example.com');
```

### 第三步：验证 RLS 策略

在 Supabase 控制台 > Authentication > Policies 中检查：

| 表 | 策略 |
|---|------|
| `products` | 所有人可读，管理员可写 |
| `orders` | 用户只能看自己的订单，管理员可看全部 |
| `site_content` | 所有人可读活跃内容，管理员可写 |
| `user_profiles` | 用户只能看/改自己的资料 |

## 功能说明

### 1. 游客下单

游客可以下单，订单通过 `user_email` 关联：

```typescript
import { createOrder } from './services/orders';

const { orderId, error } = await createOrder(
  cartItems,
  total,
  {
    name: '张三',
    email: 'guest@example.com',
    address: '...',
    // ...
  }
);
```

### 2. 用户登录后合并订单

用户登录后，自动将该邮箱的游客订单合并到账户：

```typescript
import { mergeGuestOrders } from './services/orders';
import { onAuthStateChange } from './services/auth';

// 监听登录状态
onAuthStateChange(async (user) => {
  if (user) {
    // 用户登录，合并游客订单
    const mergedCount = await mergeGuestOrders();
    if (mergedCount > 0) {
      console.log(`已合并 ${mergedCount} 个历史订单`);
    }
  }
});
```

### 3. 获取用户订单

```typescript
import { getUserOrders } from './services/orders';

const orders = await getUserOrders(10); // 最近 10 个订单
```

### 4. 更新支付状态

PayPal 支付完成后：

```typescript
import { updateOrderPayment } from './services/orders';

await updateOrderPayment(
  orderId,
  paypalOrderId,
  'paid'
);
```

## RLS 策略详解

### 订单表 (orders)

```sql
-- 任何人可以创建订单（游客也可以）
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- 用户只能查看自己的订单
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 管理员可以查看所有订单
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### 产品表 (products)

```sql
-- 所有人可以读取产品
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- 只有管理员可以修改
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## 前端集成示例

### 在 App.tsx 中集成订单合并

```typescript
import { useEffect } from 'react';
import { onAuthStateChange } from './services/auth';
import { mergeGuestOrders } from './services/orders';

function App() {
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        // 用户登录，合并游客订单
        await mergeGuestOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ...
}
```

### 结账流程

```typescript
import { createOrder, updateOrderPayment } from './services/orders';
import { createPayPalOrder, capturePayPalOrder } from './services/paypal';

async function checkout(cart, shippingAddress) {
  // 1. 创建订单
  const { orderId, error } = await createOrder(
    cart.items,
    cart.total,
    shippingAddress
  );

  if (error) {
    alert('创建订单失败: ' + error);
    return;
  }

  // 2. 创建 PayPal 支付
  const paypal = await createPayPalOrder(cart.total, 'USD');
  
  if (paypal) {
    // 3. 跳转到 PayPal 支付
    window.location.href = paypal.approvalUrl;
    
    // 保存订单 ID 到 localStorage，支付返回后使用
    localStorage.setItem('pending_order_id', orderId);
  }
}

// PayPal 支付返回后
async function handlePayPalReturn(paypalOrderId) {
  const orderId = localStorage.getItem('pending_order_id');
  
  // 捕获支付
  const result = await capturePayPalOrder(paypalOrderId);
  
  if (result.success) {
    // 更新订单状态
    await updateOrderPayment(orderId, paypalOrderId, 'paid');
    localStorage.removeItem('pending_order_id');
    
    // 显示成功页面
    navigate('order-success');
  }
}
```

## 安全注意事项

1. **RLS 必须启用** - 确保所有表都启用了 RLS
2. **管理员权限** - 只给信任的用户设置 admin 角色
3. **敏感数据** - 用户只能访问自己的数据
4. **API 密钥** - 使用 `anon` key，不要暴露 `service_role` key

## 故障排除

### 用户看不到自己的订单

1. 检查 RLS 策略是否正确创建
2. 确认 `user_id` 或 `user_email` 已正确设置
3. 在 Supabase 控制台查看 Policies

### 管理员无法修改数据

1. 确认已执行 `set_user_as_admin('email')`
2. 检查用户的 `raw_user_meta_data` 是否包含 `role: admin`
3. 用户需要重新登录以刷新 token

### 订单合并不工作

1. 确认 `merge_guest_orders` 函数已创建
2. 检查游客订单的 `user_email` 是否与用户邮箱匹配
3. 查看 Supabase 日志
