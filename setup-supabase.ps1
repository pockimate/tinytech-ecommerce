# Supabase 自动配置脚本
# 运行此脚本前，请先完成 Supabase 项目创建

Write-Host "🚀 TinyTech Supabase 配置向导" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 检查是否已安装必要的工具
Write-Host "📋 检查环境..." -ForegroundColor Yellow

# 提示用户输入 Supabase 项目信息
Write-Host ""
Write-Host "请按照以下步骤操作：" -ForegroundColor Cyan
Write-Host "1. 访问 https://supabase.com" -ForegroundColor White
Write-Host "2. 点击 'Start your project' 或 'Sign up'" -ForegroundColor White
Write-Host "3. 使用 GitHub、Google 或邮箱注册/登录" -ForegroundColor White
Write-Host "4. 创建新项目：" -ForegroundColor White
Write-Host "   - Name: tinytech-ecommerce" -ForegroundColor Gray
Write-Host "   - Database Password: 设置一个强密码" -ForegroundColor Gray
Write-Host "   - Region: 选择离您最近的区域" -ForegroundColor Gray
Write-Host "5. 等待项目创建完成（1-2分钟）" -ForegroundColor White
Write-Host ""

# 获取用户输入
$projectUrl = Read-Host "请输入您的 Supabase 项目 URL (格式: https://your-project-id.supabase.co)"
$anonKey = Read-Host "请输入您的 Supabase Anon Key (在 Settings > API 中找到)"

# 验证输入
if (-not $projectUrl -or -not $anonKey) {
    Write-Host "❌ 错误：项目 URL 和 API Key 不能为空" -ForegroundColor Red
    exit 1
}

if (-not $projectUrl.StartsWith("https://") -or -not $projectUrl.EndsWith(".supabase.co")) {
    Write-Host "❌ 错误：项目 URL 格式不正确" -ForegroundColor Red
    Write-Host "正确格式：https://your-project-id.supabase.co" -ForegroundColor Yellow
    exit 1
}

# 更新 .env.local 文件
Write-Host ""
Write-Host "📝 更新环境变量..." -ForegroundColor Yellow

$envContent = Get-Content ".env.local" -Raw
$envContent = $envContent -replace "VITE_SUPABASE_URL=your-project-url.supabase.co", "VITE_SUPABASE_URL=$projectUrl"
$envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=your-anon-key-here", "VITE_SUPABASE_ANON_KEY=$anonKey"

Set-Content ".env.local" $envContent

Write-Host "✅ 环境变量已更新" -ForegroundColor Green

# 提示下一步操作
Write-Host ""
Write-Host "🎯 下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 Supabase 项目中打开 SQL Editor" -ForegroundColor White
Write-Host "2. 复制 database/schema.sql 的内容" -ForegroundColor White
Write-Host "3. 粘贴到 SQL Editor 并点击 Run" -ForegroundColor White
Write-Host "4. 访问 http://localhost:3000/#admin" -ForegroundColor White
Write-Host "5. 点击 '数据库迁移' 标签页" -ForegroundColor White
Write-Host "6. 点击 '开始完整迁移'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 配置完成！" -ForegroundColor Green