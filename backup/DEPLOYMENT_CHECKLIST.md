# 网站上线检查清单

## 1. 环境配置

### PayPal支付
- [ ] 将沙盒API切换到生产环境
- [ ] 在PayPal开发者平台创建生产应用
- [ ] 更新 `.env.production` 中的 `VITE_PAYPAL_CLIENT_ID` 和 `VITE_PAYPAL_CLIENT_SECRET`
- [ ] 将 `VITE_PAYPAL_API_BASE` 改为 `https://api-m.paypal.com`

### API密钥
- [ ] 确保所有API密钥正确配置在环境变量中
- [ ] 创建 `.env.production` 文件（不要提交到Git）

## 2. 安全措施

### 高优先级
- [ ] **后端API代理** - 创建Node.js后端保护API密钥（参考 `PRODUCTION_SECURITY.md`）
- [ ] **Admin表单输入验证** - 完善所有 `formData.get()` 调用
- [ ] **LocalStorage写入验证** - 添加数据验证

### 中优先级
- [ ] **API速率限制** - 防止滥用
- [ ] **CSRF保护** - 添加token机制
- [ ] **CDN SRI验证** - 为tailwindcss和fontawesome添加integrity哈希

### 低优先级
- [ ] **CSP内容安全策略** - 添加安全头部
- [ ] **敏感数据加密** - localStorage加密

## 3. SEO优化

### 立即执行
- [ ] 提交sitemap.xml到Google Search Console
- [ ] 为所有图片添加alt属性
- [ ] 创建社交分享图片og:image (1200×630px)

### 本周执行
- [ ] 添加产品结构化数据（JSON-LD）
- [ ] 添加面包屑导航
- [ ] 安装Google Analytics

### 考虑迁移SSR
- [ ] 评估是否迁移到Next.js（更好的SEO）
- [ ] 或使用预渲染插件

## 4. 性能优化

### 图片优化
- [ ] 使用WebP格式
- [ ] 实施图片懒加载
- [ ] 优化图片大小

### 代码优化
- [ ] 启用Gzip/Brotli压缩
- [ ] 优化bundle大小
- [ ] 检查Core Web Vitals指标

## 5. 部署准备

### 托管选择
**选项A: Vercel（推荐）**
```bash
npm i -g vercel
vercel deploy --prod
```

**选项B: Netlify**
```bash
npm run build
将dist文件夹拖拽到Netlify
```

**选项C: 自建服务器**
```bash
npm run build
将dist部署到Nginx
```

### 域名和SSL
- [ ] 购买域名
- [ ] 配置DNS解析
- [ ] 安装SSL证书（Let's Encrypt免费）
- [ ] 强制HTTPS重定向

### Nginx配置
参考 `PRODUCTION_SECURITY.md` 中的配置：
- 安全头部
- 速率限制
- 缓存策略

## 6. 测试清单

### 功能测试
- [ ] 支付流程完整测试
- [ ] 用户表单提交
- [ ] 响应式设计测试
- [ ] 多语言切换

### 安全测试
- [ ] XSS漏洞扫描
- [ ] API密钥泄露检查
- [ ] 输入验证测试

### 性能测试
- [ ] Lighthouse性能评分
- [ ] 移动端加载速度
- [ ] 并发用户测试

## 7. 上线后维护

### 每周
- [ ] 监控错误日志
- [ ] 检查网站速度
- [ ] 查看分析数据

### 每月
- [ ] npm安全审计：`npm audit`
- [ ] 更新依赖包
- [ ] 分析流量数据

### 每季度
- [ ] 全面安全审计
- [ ] SEO表现评估
- [ ] 性能优化

---

## 快速启动命令

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local .env.production
# 编辑.env.production

# 3. 构建生产版本
npm run build

# 4. 预览构建结果
npm run preview

# 5. 部署
# 根据选择的托管平台执行部署命令
```

## 相关文档

- [安全配置指南](PRODUCTION_SECURITY.md)
- [SEO优化指南](SEO_GUIDE.md)
- [安全审计报告](SECURITY.md)
- [PayPal沙盒设置](PAYPAL_SANDBOX_SETUP.md)

---

**预计上线时间**：1-2周（完成高优先级项目）

**最后更新**：2026年1月7日