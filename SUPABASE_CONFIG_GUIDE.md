# 🚀 Supabase 配置向导

## 第一步：创建 Supabase 项目

### 1.1 注册/登录 Supabase
1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"** 或 **"Sign up"**
3. 推荐使用 **GitHub** 登录（方便后续集成）

### 1.2 创建新项目
1. 点击 **"New Project"**
2. 选择组织（通常是您的个人账户）
3. 填写项目信息：
   ```
   Name: tinytech-ecommerce
   Database Password: [设置一个强密码，请记住]
   Region: Southeast Asia (Singapore) [或选择离您最近的区域]
   ```
4. 点击 **"Create new project"**
5. 等待 1-2 分钟项目创建完成

## 第二步：获取项目配置

### 2.1 获取 API 密钥
1. 在项目仪表板，点击左侧菜单的 **"Settings"**
2. 点击 **"API"**
3. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

### 2.2 更新环境变量
打开项目根目录的 `.env.local` 文件，将以下两行：
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

替换为您的实际信息：
```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## 第三步：创建数据库表

### 3.1 打开 SQL Editor
1. 在 Supabase 项目仪表板，点击左侧菜单的 **"SQL Editor"**
2. 点击 **"New query"**

### 3.2 执行建表 SQL
1. 打开项目中的 `database/schema.sql` 文件
2. 复制**全部内容**
3. 粘贴到 Supabase SQL Editor 中
4. 点击 **"Run"** 执行

### 3.3 验证表创建
1. 点击左侧菜单的 **"Table Editor"**
2. 应该能看到以下表：
   - ✅ `products` - 产品表
   - ✅ `orders` - 订单表
   - ✅ `site_content` - 网站内容表
   - ✅ `reviews` - 评论表
   - ✅ `blog_posts` - 博客文章表

## 第四步：测试数据库连接

### 4.1 启动开发服务器
确保开发服务器正在运行：
```bash
npm run dev
```

### 4.2 访问管理后台
1. 打开浏览器访问：`http://localhost:3000/#admin`
2. 点击 **"数据库迁移"** 标签页
3. 查看连接状态：
   - ✅ 绿色圆点 = 数据库已连接
   - ❌ 红色圆点 = 连接失败

### 4.3 如果连接失败
检查以下项目：
- [ ] `.env.local` 中的 URL 和密钥是否正确
- [ ] Supabase 项目状态是否为 "Active"
- [ ] 网络连接是否正常
- [ ] 浏览器控制台是否有错误信息

## 第五步：执行数据迁移

### 5.1 开始迁移
1. 在 **"数据库迁移"** 标签页中
2. 确认看到 **"数据库已连接"** 状态
3. 点击 **"开始完整迁移"** 按钮

### 5.2 监控迁移进度
迁移过程包括：
- 🔄 产品数据迁移
- 🔄 网站内容迁移  
- 🔄 评论数据迁移

### 5.3 验证迁移结果
1. 在 Supabase **"Table Editor"** 中检查数据
2. `products` 表应该包含您的产品数据
3. 其他表也应该有相应的数据

## 🎉 配置完成！

恭喜！您已成功配置 Supabase 数据库。现在您的网站具备：

- ✅ 云数据库存储
- ✅ 实时数据同步
- ✅ 自动备份
- ✅ 全球 CDN 加速
- ✅ 企业级安全

## 🔧 故障排除

### 常见问题

**Q: 连接失败怎么办？**
A: 检查环境变量格式，确保没有多余空格，URL 以 `https://` 开头

**Q: 迁移失败怎么办？**
A: 查看迁移日志，通常是数据格式问题，可以重新执行迁移

**Q: 如何重置数据？**
A: 在 Supabase SQL Editor 中执行 `DROP TABLE` 语句，然后重新运行 schema.sql

### 获取帮助
- 📖 查看 `SUPABASE_SETUP.md` 详细文档
- 🌐 访问 [Supabase 官方文档](https://supabase.com/docs)
- 💬 加入 [Supabase Discord](https://discord.supabase.com)

---

**需要帮助？** 如果遇到任何问题，请提供错误信息，我会帮您解决！