# 🚀 GitHub 推送指令

## 第一步：创建 GitHub 仓库
1. 访问：https://github.com/new
2. 仓库名称：`tinytech-ecommerce`
3. 描述：`TinyTech E-commerce - Modern mini electronics store`
4. 设为公开
5. 点击 "Create repository"

## 第二步：推送代码
创建仓库后，在命令行执行：

```bash
# 设置远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tinytech-ecommerce.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第三步：部署到 Vercel
1. 访问：https://vercel.com
2. 使用 GitHub 登录
3. 点击 "New Project"
4. 选择 "tinytech-ecommerce" 仓库
5. 添加环境变量：
   ```
   VITE_SUPABASE_URL = https://aidtulrpkxvlyjbvqxhd.supabase.co
   VITE_SUPABASE_ANON_KEY = sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo
   VITE_PAYPAL_CLIENT_ID = AdYd8c4-8sqDdUh4F4rpGyixCVDGnuMLT_BxF8bcTX6mEErfUq__BPnQgS-67gIJdruYnRBwEOrXvAs1
   VITE_PAYPAL_CLIENT_SECRET = EK1lg9k4iWum67J4o8V50xD0uljyAsX0SJyOPzg5ocJ8MplVRtx_YtMvoqGKcCVNCkqpbZ1Nr7raQf7v
   VITE_PAYPAL_API_BASE = https://api-m.sandbox.paypal.com
   ```
6. 点击 "Deploy"

## 🎉 完成！
部署成功后，您将获得一个 `.vercel.app` 域名，网站即可在线访问！