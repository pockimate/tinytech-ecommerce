# 网站备份信息

## 备份详情
- **备份时间**: 2026-01-07 18:40:20
- **备份类型**: 完整备份（Astro 迁移前）
- **备份版本**: pre-astro-migration-2026-01-07
- **备份目的**: 为渐进式迁移到 Astro 做准备

## 系统信息
- **操作系统**: Windows
- **平台**: win32
- **Shell**: cmd

## 备份范围
- ✅ 源代码文件
- ✅ 配置文件
- ✅ 文档和说明
- ✅ 静态资源
- ✅ 构建产物
- ✅ 依赖信息
- ✅ 应用数据

## 恢复说明
1. 解压备份文件到目标目录
2. 运行 `npm install` 安装依赖
3. 复制环境配置文件
4. 运行 `npm run build` 构建项目
5. 运行 `npm run dev` 启动开发服务器

## 重要文件清单
- package.json - 项目依赖配置
- vite.config.ts - 构建配置
- tailwind.config.js - 样式配置
- App.tsx - 主应用组件
- components/ - React 组件
- services/paypal.ts - PayPal 集成
- context/TranslationContext.tsx - 翻译系统

## 验证检查清单
- [ ] 项目可以成功构建
- [ ] 开发服务器可以启动
- [ ] PayPal 集成功能正常
- [ ] 翻译系统工作正常
- [ ] 所有页面可以正常访问