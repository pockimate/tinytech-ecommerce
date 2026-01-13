-- ============================================
-- Supabase RLS 策略 + 订单系统
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- ============================================
-- 1. 用户表（关联 Supabase Auth）
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  default_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：新用户注册时创建 profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. 更新订单表结构（关联用户）
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- 3. RLS 策略 - 用户表
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的 profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 系统可以插入新用户（通过触发器）
CREATE POLICY "System can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. RLS 策略 - 订单表（重要！）
-- ============================================
-- 先删除旧策略
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON orders;

-- 任何人都可以创建订单（游客也可以下单）
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- 登录用户只能查看自己的订单
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id 
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 管理员可以查看所有订单（需要设置 admin 角色）
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 管理员可以更新订单
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 5. 订单合并函数（游客订单 → 用户订单）
-- ============================================
CREATE OR REPLACE FUNCTION merge_guest_orders(p_user_id UUID, p_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  merged_count INTEGER;
BEGIN
  -- 将该邮箱的游客订单关联到用户
  UPDATE orders
  SET user_id = p_user_id
  WHERE user_email = p_email
    AND user_id IS NULL;
  
  GET DIAGNOSTICS merged_count = ROW_COUNT;
  
  RETURN merged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. 用户登录时自动合并订单
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- 合并该用户邮箱的游客订单
  PERFORM merge_guest_orders(NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注意：Supabase Auth 没有登录触发器，需要在前端调用 merge_guest_orders

-- ============================================
-- 7. 创建订单的存储过程
-- ============================================
CREATE OR REPLACE FUNCTION create_order(
  p_items JSONB,
  p_total DECIMAL,
  p_shipping_address JSONB,
  p_user_email TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'paypal'
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  current_user_id UUID;
BEGIN
  -- 获取当前登录用户 ID（如果有）
  current_user_id := auth.uid();
  
  -- 创建订单
  INSERT INTO orders (
    user_id,
    user_email,
    items,
    total,
    shipping_address,
    payment_method,
    status,
    payment_status
  ) VALUES (
    current_user_id,
    COALESCE(p_user_email, (SELECT email FROM auth.users WHERE id = current_user_id)),
    p_items,
    p_total,
    p_shipping_address,
    p_payment_method,
    'pending',
    'pending'
  )
  RETURNING id INTO new_order_id;
  
  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. 更新订单支付状态
-- ============================================
CREATE OR REPLACE FUNCTION update_order_payment(
  p_order_id UUID,
  p_paypal_order_id TEXT,
  p_payment_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE orders
  SET 
    paypal_order_id = p_paypal_order_id,
    payment_status = p_payment_status,
    status = CASE 
      WHEN p_payment_status = 'paid' THEN 'processing'
      WHEN p_payment_status = 'failed' THEN 'cancelled'
      ELSE status
    END
  WHERE id = p_order_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 获取用户订单历史
-- ============================================
CREATE OR REPLACE FUNCTION get_user_orders(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  items JSONB,
  total DECIMAL,
  status TEXT,
  payment_status TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.items,
    o.total,
    o.status,
    o.payment_status,
    o.shipping_address,
    o.tracking_number,
    o.created_at
  FROM orders o
  WHERE o.user_id = auth.uid()
     OR o.user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ORDER BY o.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. 设置管理员用户
-- ============================================
-- 运行此函数将用户设置为管理员
CREATE OR REPLACE FUNCTION set_user_as_admin(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
  WHERE email = p_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 示例：设置管理员
-- SELECT set_user_as_admin('your-admin@email.com');

-- ============================================
-- 11. 产品表 RLS（更新）
-- ============================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- 只有管理员可以修改产品
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- 12. 网站内容表 RLS（更新）
-- ============================================
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON site_content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON site_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON site_content;

-- 只有管理员可以修改网站内容
CREATE POLICY "Admins can insert site_content"
  ON site_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update site_content"
  ON site_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete site_content"
  ON site_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
