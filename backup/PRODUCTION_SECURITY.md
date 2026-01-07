# 生产环境安全配置指南

## 1. 环境变量配置

### .env 文件示例
```env
# Gemini AI API密钥
GEMINI_API_KEY=your_api_key_here

# 生产环境设置
VITE_ENV=production
VITE_API_URL=https://api.yourdomain.com

# 安全设置
VITE_MAX_REQUEST_PER_MINUTE=60
VITE_ENABLE_RATE_LIMITING=true
```

### 不要提交到Git
确保 `.env` 在 `.gitignore` 中：
```gitignore
.env
.env.local
.env.production
```

## 2. Nginx配置（生产服务器）

### 添加安全头部
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 内容安全策略
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://kit.fontawesome.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; img-src 'self' https://images.unsplash.com data:; font-src 'self' https://ka-f.fontawesome.com https://fonts.gstatic.com;" always;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        root /var/www/tinytech;
        try_files $uri $uri/ /index.html;
    }

    # API代理（隐藏API密钥）
    location /api/ {
        proxy_pass https://api.gemini.com/;
        proxy_set_header Authorization "Bearer ${GEMINI_API_KEY}";
        proxy_hide_header Authorization;
        
        # 速率限制
        limit_req zone=api_limit burst=20 nodelay;
    }
}

# 速率限制配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

## 3. 后端API代理（推荐）

### Express.js示例
```javascript
// server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "https://images.unsplash.com", "data:"],
    },
  },
}));

// 速率限制
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 限制60个请求
  message: '请求过于频繁，请稍后再试'
});

// AI API代理
app.post('/api/chat', apiLimiter, async (req, res) => {
  try {
    const response = await fetch('https://api.gemini.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.listen(3001, () => {
  console.log('API服务器运行在端口 3001');
});
```

## 4. 客户端安全增强

### 修改 gemini.ts 使用后端API
```typescript
// services/gemini.ts
export async function sendMessage(message: string): Promise<string> {
  try {
    // 使用后端代理而不是直接调用
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const data = await response.json();
    return data.text || '抱歉，我现在无法回答。';
  } catch (error) {
    console.error('Gemini API error:', error);
    return '连接失败，请稍后重试。';
  }
}
```

### 实施请求节流
```typescript
// utils/throttle.ts
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecuted = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted;

    if (timeSinceLastExecution >= delay) {
      func(...args);
      lastExecuted = now;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecuted = Date.now();
      }, delay - timeSinceLastExecution);
    }
  };
}

// 使用示例
import { throttle } from './utils/throttle';

const throttledSendMessage = throttle(sendMessage, 2000); // 2秒节流
```

## 5. localStorage安全增强

### 添加加密层（可选）
```typescript
// utils/secureStorage.ts
import { AES, enc } from 'crypto-js';

const SECRET_KEY = 'your-secret-key-from-env'; // 应从环境变量获取

export function setSecureItem(key: string, value: any): void {
  try {
    const jsonString = JSON.stringify(value);
    const encrypted = AES.encrypt(jsonString, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Failed to save secure item:', error);
  }
}

export function getSecureItem<T>(key: string, defaultValue: T): T {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;

    const decrypted = AES.decrypt(encrypted, SECRET_KEY);
    const jsonString = decrypted.toString(enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to retrieve secure item:', error);
    return defaultValue;
  }
}
```

## 6. HTTPS配置（必须）

### Let's Encrypt免费SSL证书
```bash
# 安装certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 7. 监控和日志

### 添加错误监控
```typescript
// utils/errorTracking.ts
export function trackError(error: Error, context?: any): void {
  // 发送到错误监控服务（如Sentry）
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });

  // 生产环境中发送到监控服务
  if (import.meta.env.PROD) {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack
        },
        context
      })
    });
  }
}
```

## 8. 部署检查清单

### 生产环境发布前检查

- [ ] 所有环境变量已配置
- [ ] `.env` 文件未提交到Git
- [ ] HTTPS已启用
- [ ] 安全头部已配置
- [ ] CSP策略已设置
- [ ] API密钥通过后端代理
- [ ] 速率限制已实施
- [ ] 错误监控已启用
- [ ] 所有依赖项已更新
- [ ] 安全审计已完成
- [ ] 备份策略已制定

## 9. 定期安全维护

### 每月任务
- 更新npm依赖：`npm audit fix`
- 检查安全漏洞：`npm audit`
- 审查访问日志
- 测试备份恢复

### 每季度任务
- 全面安全审计
- 渗透测试
- SSL证书检查
- 性能优化

## 10. 紧急响应计划

### 发现安全漏洞时

1. **立即行动**
   - 隔离受影响系统
   - 备份当前状态
   - 评估影响范围

2. **修复**
   - 应用安全补丁
   - 更新受影响代码
   - 测试修复效果

3. **通知**
   - 通知受影响用户
   - 发布安全公告
   - 更新文档

4. **预防**
   - 分析根本原因
   - 改进安全流程
   - 培训团队成员

---

## 联系支持

如有安全问题，请联系：security@yourdomain.com

*最后更新：2026年1月*
