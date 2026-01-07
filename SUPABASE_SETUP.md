# Supabase 数据库设置指南

## 🚀 快速开始

### 第一步：创建 Supabase 项目

1. **访问 Supabase**
   - 打开 [https://supabase.com](https://supabase.com)
   - 点击 "Start your project" 或 "Sign up"

2. **注册/登录账户**
   - 使用 GitHub、Google 或邮箱注册
   - 推荐使用 GitHub 登录，方便后续集成

3. **创建新项目**
   - 点击 "New Project"
   - 选择组织（个人账户）
   - 填写项目信息：
     - **Name**: `tinytech-ecommerce`
     - **Database Password**: 设置一个强密码（记住这个密码）
     - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
   - 点击 "Create new project"

4. **等待项目创建**
   - 通常需要 1-2 分钟
   - 创建完成后会自动跳转到项目仪表板

### 第二步：获取项目配置信息

1. **获取 API 密钥**
   - 在项目仪表板，点击左侧菜单的 "Settings"
   - 点击 "API"
   - 复制以下信息：
     - **Project URL**: `https://your-project-id.supabase.co`
     - **anon public key**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

2. **更新环境变量**
   - 复制 `backup/.env.local.template` 为 `.env.local`
   - 填入 Supabase 配置：
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

### 第三步：创建数据库表

1. **打开 SQL Editor**
   - 在 Supabase 项目仪表板，点击左侧菜单的 "SQL Editor"
   - 点击 "New query"

2. **执行建表 SQL**
   - 复制 `database/schema.sql` 文件的全部内容
   - 粘贴到 SQL Editor 中
   - 点击 "Run" 执行

3. **验证表创建**
   - 点击左侧菜单的 "Table Editor"
   - 应该能看到以下表：
     - `products` - 产品表
     - `orders` - 订单表
     - `site_content` - 网站内容表
     - `reviews` - 评论表
     - `blog_posts` - 博客文章表

### 第四步：测试数据库连接

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **检查控制台**
   - 打开浏览器开发者工具
   - 查看控制台是否显示 "✅ 数据库连接成功"

3. **如果连接失败**
   - 检查 `.env.local` 文件中的 URL 和密钥是否正确
   - 确保 Supabase 项目状态为 "Active"
   - 检查网络连接

## 📊 数据迁移

### 自动迁移现有数据

1. **打开管理后台**
   - 访问 `http://localhost:3000/#admin`
   - 在管理后台中会看到数据库迁移选项

2. **执行迁移**
   - 点击 "迁移数据到数据库" 按钮
   - 等待迁移完成
   - 检查 Supabase Table Editor 确认数据已导入

### 手动迁移（可选）

如果需要手动迁移，可以在浏览器控制台执行：

```javascript
// 迁移产品数据
import { migrationAPI } from './services/database';
import { PRODUCTS } from './data';

await migrationAPI.migrateProducts(PRODUCTS);
```

## 🔧 配置说明

### 环境变量

```env
# Supabase 项目 URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase 匿名密钥（公开密钥，可以在前端使用）
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 安全设置

1. **行级安全策略 (RLS)**
   - 已启用 RLS 保护数据安全
   - 公开数据（产品、内容）允许所有人读取
   - 敏感操作需要认证

2. **API 密钥权限**
   - `anon` 密钥：用于公开访问，权限受 RLS 限制
   - `service_role` 密钥：管理员权限，不要在前端使用

## 📈 使用数据库

### 在组件中使用

```typescript
import { useProducts } from '../hooks/useDatabase';

function ProductList() {
  const { products, loading, error, updateProduct } = useProducts();
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 直接使用 API

```typescript
import { productAPI } from '../services/database';

// 获取所有产品
const products = await productAPI.getAll();

// 创建新产品
const newProduct = await productAPI.create({
  name: 'New Product',
  category: 'phone',
  price: 299,
  // ...
});
```

## 🚀 部署到生产环境

### Vercel 部署

1. **连接 GitHub**
   - 将代码推送到 GitHub
   - 在 Vercel 中导入项目

2. **设置环境变量**
   - 在 Vercel 项目设置中添加环境变量
   - 复制 Supabase 的 URL 和密钥

3. **部署**
   - Vercel 会自动构建和部署
   - 数据库连接会自动工作

### 其他平台

- **Netlify**: 同样支持环境变量配置
- **Railway**: 可以同时部署应用和数据库
- **自定义服务器**: 确保环境变量正确设置

## 🔍 故障排除

### 常见问题

1. **连接失败**
   - 检查 URL 格式是否正确
   - 确认密钥没有多余的空格
   - 验证 Supabase 项目状态

2. **权限错误**
   - 检查 RLS 策略设置
   - 确认使用正确的 API 密钥

3. **数据不同步**
   - 检查网络连接
   - 查看浏览器控制台错误信息
   - 验证数据格式是否正确

### 获取帮助

- **Supabase 文档**: [https://supabase.com/docs](https://supabase.com/docs)
- **社区支持**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [https://discord.supabase.com](https://discord.supabase.com)

## ✅ 完成检查清单

- [ ] Supabase 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库表已创建
- [ ] 数据库连接测试通过
- [ ] 现有数据已迁移
- [ ] 管理后台可以正常操作数据库
- [ ] 前端页面显示数据库中的数据

完成以上步骤后，你的网站就成功集成了 Supabase 数据库！🎉