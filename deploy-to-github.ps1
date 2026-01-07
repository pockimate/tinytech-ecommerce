# GitHub 部署脚本
Write-Host "🚀 准备部署到 GitHub..." -ForegroundColor Green

# 检查 Git 状态
if (-not (Test-Path ".git")) {
    Write-Host "初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 创建 .gitignore（如果不存在）
if (-not (Test-Path ".gitignore")) {
    Write-Host "创建 .gitignore 文件..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
.pnpm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# 添加所有文件
Write-Host "添加文件到 Git..." -ForegroundColor Yellow
git add .

# 提交
Write-Host "提交代码..." -ForegroundColor Yellow
git commit -m "🚀 Ready for deployment - TinyTech E-commerce with Supabase integration"

Write-Host ""
Write-Host "✅ 代码已准备好推送到 GitHub！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 在 GitHub 创建新仓库：https://github.com/new" -ForegroundColor White
Write-Host "2. 仓库名称建议：tinytech-ecommerce" -ForegroundColor White
Write-Host "3. 执行以下命令推送代码：" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/tinytech-ecommerce.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 然后访问 vercel.com 部署网站！" -ForegroundColor Green