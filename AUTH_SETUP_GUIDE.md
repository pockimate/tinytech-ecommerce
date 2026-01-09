# 用户认证配置指南

本指南将帮助你为 TinyTech 网站配置用户认证功能。

## 1. Supabase 邮箱认证（已默认启用）

邮箱/密码认证开箱即用。用户可以：
- 使用邮箱和密码注册
- 使用已有账号登录
- 密码至少需要6个字符

### 测试方法：
1. 打开你的网站
2. 点击导航栏的用户图标
3. 点击 "Sign Up" 创建新账号
4. 输入邮箱和密码
5. 检查邮箱中的确认链接（如果启用了邮箱确认）

---

## 2. Google OAuth 配置

### 第一步：创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击 "选择项目" → "新建项目"
3. 输入项目名称（如 "TinyTech Auth"）并创建

### 第二步：配置 OAuth 同意屏幕
1. 进入 **API和服务** → **OAuth 同意屏幕**
2. 选择 "外部" 用户类型
3. 填写信息：
   - 应用名称：`TinyTech`
   - 用户支持邮箱：你的邮箱
   - 开发者联系信息：你的邮箱
4. 点击 "保存并继续"
5. 跳过范围设置，点击 "保存并继续"
6. 如需要可添加测试用户，点击 "保存并继续"

### 第三步：创建 OAuth 凭证
1. 进入 **API和服务** → **凭据**
2. 点击 **+ 创建凭据** → **OAuth 客户端 ID**
3. 应用类型：**Web 应用**
4. 名称：`TinyTech Web`
5. 添加 **已授权的重定向 URI**：
   ```
   https://aidtulrpkxvlyjbvqxhd.supabase.co/auth/v1/callback
   ```
6. 点击 "创建"
7. 复制 **客户端 ID** 和 **客户端密钥**

### 第四步：在 Supabase 中配置
1. 访问 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **Google** 并点击展开
5. 开启 **Enable Sign in with Google**
6. 粘贴你的 **Client ID** 和 **Client Secret**
7. 点击 **Save**

---

## 3. Facebook OAuth 配置

### 第一步：创建 Facebook 应用
1. 访问 [Facebook 开发者平台](https://developers.facebook.com/)
2. 点击 **我的应用** → **创建应用**
3. 选择 **消费者** 或 **无** 类型
4. 输入应用名称：`TinyTech`
5. 点击 "创建应用"

### 第二步：添加 Facebook 登录
1. 在应用控制台中，找到 **添加产品**
2. 在 **Facebook 登录** 上点击 **设置**
3. 选择 **Web**
4. 输入你的网站 URL（如 `https://your-domain.com`）
5. 点击 "保存"

### 第三步：配置 OAuth 设置
1. 进入 **Facebook 登录** → **设置**
2. 添加 **有效的 OAuth 重定向 URI**：
   ```
   https://aidtulrpkxvlyjbvqxhd.supabase.co/auth/v1/callback
   ```
3. 点击 "保存更改"

### 第四步：获取应用凭证
1. 进入 **设置** → **基本**
2. 复制 **应用编号** 和 **应用密钥**

### 第五步：在 Supabase 中配置
1. 访问 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **Facebook** 并点击展开
5. 开启 **Enable Sign in with Facebook**
6. 粘贴你的 **App ID** 和 **App Secret**
7. 点击 **Save**

---

## 4. 配置重定向 URL

### 在 Supabase 中：
1. 进入 **Authentication** → **URL Configuration**
2. 设置 **Site URL**：`https://你的正式域名.com`
3. 添加 **Redirect URLs**：
   - `https://你的正式域名.com`
   - `http://localhost:3001`（用于本地开发）

---

## 5. 邮件模板（可选）

在 Supabase 中自定义邮件模板：
1. 进入 **Authentication** → **Email Templates**
2. 可自定义：
   - 注册确认邮件
   - 重置密码邮件
   - 魔法链接邮件

---

## 常见问题排查

### "Invalid login credentials"（登录凭证无效）
- 检查邮箱和密码是否正确
- 确保用户已确认邮箱（如果启用了邮箱确认）

### Google/Facebook 登录不工作
- 确认重定向 URI 完全匹配
- 检查 Client ID/Secret 是否正确
- 确保 OAuth 同意屏幕已配置

### "Email not confirmed"（邮箱未确认）
如需禁用邮箱确认（用于测试）：
1. 进入 **Authentication** → **Providers** → **Email**
2. 关闭 "Confirm email"

---

## 安全注意事项

- 永远不要在前端代码中暴露 Supabase service role key
- `.env.local` 中的 anon key 可以安全地用于前端
- 在数据库表上启用行级安全策略（RLS）
- 生产环境必须使用 HTTPS

---

## 快速测试清单

- [ ] 邮箱注册功能正常
- [ ] 邮箱登录功能正常
- [ ] Google 登录功能正常（配置后）
- [ ] Facebook 登录功能正常（配置后）
- [ ] 刷新页面后用户保持登录状态
- [ ] 退出登录功能正常
