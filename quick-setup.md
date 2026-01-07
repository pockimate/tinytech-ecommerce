# ⚡ 快速配置 Supabase（5分钟完成）

## 🎯 一键配置流程

### 步骤 1：创建 Supabase 项目（2分钟）
1. 打开 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"**
3. 使用 GitHub 登录（推荐）
4. 点击 **"New Project"**
5. 填写：
   - **Name**: `tinytech-ecommerce`
   - **Password**: 设置强密码
   - **Region**: 选择最近的区域
6. 点击 **"Create new project"**，等待创建完成

### 步骤 2：获取配置信息（30秒）
1. 项目创建完成后，点击 **Settings** → **API**
2. 复制两个值：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ0eXAi...`

### 步骤 3：更新环境变量（30秒）
打开 `.env.local` 文件，替换这两行：
```env
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
```

### 步骤 4：创建数据库表（1分钟）
1. 在 Supabase 项目中，点击 **SQL Editor**
2. 点击 **"New query"**
3. 复制 `database/schema.sql` 的**全部内容**
4. 粘贴到编辑器，点击 **"Run"**

### 步骤 5：执行数据迁移（1分钟）
1. 访问 `http://localhost:3000/#admin`
2. 点击 **"数据库迁移"** 标签
3. 确认显示 **"数据库已连接"**
4. 点击 **"开始完整迁移"**

## ✅ 完成！

🎉 恭喜！您的网站现在已连接到 Supabase 云数据库！

## 🔍 验证配置

在浏览器控制台运行以下代码来测试连接：
```javascript
// 复制 test-database-connection.js 的内容到控制台运行
```

## 🆘 遇到问题？

### 常见错误及解决方案

**❌ "Invalid API key"**
- 检查 `.env.local` 中的 API key 是否正确
- 确保没有多余的空格

**❌ "Failed to fetch"**
- 检查项目 URL 是否正确
- 确认 Supabase 项目状态为 Active

**❌ "relation does not exist"**
- 确认已在 SQL Editor 中执行了 schema.sql
- 检查所有表是否创建成功

**❌ 迁移失败**
- 查看迁移日志中的具体错误
- 可以多次尝试迁移

### 获取帮助
如果仍有问题，请：
1. 截图错误信息
2. 检查浏览器控制台
3. 查看 Supabase 项目日志

---

**预计总时间：5分钟** ⏱️