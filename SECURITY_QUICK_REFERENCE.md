# 🛡️ 安全快速参考

## 常用安全函数（utils/security.ts）

### 输入验证
```typescript
import { sanitizeUserInput, isValidEmail, isValidURL } from './utils/security';

// 清理用户输入（移除危险字符 + 限制长度）
const cleanName = sanitizeUserInput(userInput, 200);

// 验证邮箱
if (!isValidEmail(email)) {
  alert('无效的邮箱地址');
}

// 验证URL
if (!isValidURL(imageUrl)) {
  alert('无效的URL');
}
```

### localStorage安全读取
```typescript
import { safeGetLocalStorage, isValidProductArray } from './utils/security';

// 安全读取（带错误处理 + 可选验证）
const products = safeGetLocalStorage(
  'products', 
  [], // 默认值
  isValidProductArray // 可选：验证函数
);
```

### HTML清理
```typescript
import { sanitizeHTML, cleanString } from './utils/security';

// 清理HTML（通过textContent）
const safeHTML = sanitizeHTML(userHtml);

// 移除危险标签
const cleanText = cleanString(userInput);
```

---

## Admin表单最佳实践

### 表单处理模板
```typescript
// 在AdminDashboard中
import { sanitizeUserInput, isValidURL } from '../utils/security';

// 使用辅助函数
const getFormValue = (formData: FormData, key: string, maxLength: number = 10000): string => {
  const value = formData.get(key) as string;
  return value ? sanitizeUserInput(value, maxLength) : '';
};

const getFormURL = (formData: FormData, key: string): string => {
  const url = formData.get(key) as string;
  if (url && !isValidURL(url)) {
    console.warn(`Invalid URL for ${key}`);
    return '';
  }
  return url || '';
};

// 表单提交
<form onSubmit={(e) => {
  const formData = new FormData(e.currentTarget);
  
  // 验证URL
  const imageUrl = getFormURL(formData, 'image');
  if (!imageUrl) {
    e.preventDefault();
    alert('请输入有效的图片URL');
    return;
  }
  
  // 清理文本输入
  const data = {
    name: getFormValue(formData, 'name', 200),
    description: getFormValue(formData, 'description', 500),
    image: imageUrl
  };
  
  handleSubmit(data);
}}>
```

---

## 字段长度建议

| 字段类型 | 推荐最大长度 | 示例 |
|---------|-------------|------|
| 名称/标题 | 200字符 | 产品名称、标题 |
| 简短描述 | 500字符 | 产品描述 |
| 完整描述 | 10,000字符 | 详细说明、博客内容 |
| Badge/标签 | 50字符 | 促销标签 |
| URL | 2000字符 | 图片URL |
| 邮箱 | 254字符 | 用户邮箱 |

---

## 常见安全检查

### ✅ 使用前检查
```typescript
// ❌ 不安全
const data = JSON.parse(localStorage.getItem('key'));
const name = formData.get('name') as string;
const url = userInput;

// ✅ 安全
const data = safeGetLocalStorage('key', defaultValue);
const name = getFormValue(formData, 'name', 200);
const url = isValidURL(userInput) ? userInput : '';
```

### ⚠️ 避免的模式
```typescript
// 永远不要使用
eval(userInput);                    // ❌ 代码注入
element.innerHTML = userInput;      // ❌ XSS攻击
<div dangerouslySetInnerHTML={...}> // ❌ XSS攻击
new Function(userInput)();          // ❌ 代码注入
```

---

## 快速测试命令

```bash
# 检查XSS漏洞
grep -r "dangerouslySetInnerHTML" src/
grep -r "innerHTML" src/

# 检查代码注入
grep -r "eval(" src/
grep -r "Function(" src/

# 检查API密钥
grep -r "apiKey\|API_KEY" src/

# NPM安全审计
npm audit
npm audit fix
```

---

## 紧急联系

- **安全问题**: 查阅 [SECURITY.md](./SECURITY.md)
- **生产部署**: 查阅 [PRODUCTION_SECURITY.md](./PRODUCTION_SECURITY.md)
- **完成报告**: 查阅 [SECURITY_COMPLETION.md](./SECURITY_COMPLETION.md)

---

*保持安全！定期审计！*
