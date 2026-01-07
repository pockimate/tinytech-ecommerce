# PayPal 凭证问题排查

## 当前状态

❌ API返回 `invalid_client: Client Authentication failed`

## 可能的原因

1. **Client ID不正确** - 可能复制了错误的ID
2. **Client Secret不正确** - Secret可能已过期或被重置
3. **应用被删除或暂停**
4. **Secret格式问题** - 复制时可能包含了空格或其他字符

## 解决方案

### 步骤 1: 检查应用是否存在

1. 访问 https://developer.paypal.com
2. 登录后点击左侧 "REST API apps"
3. 确认您的应用列表中有对应的应用
4. 如果应用不存在，需要创建新应用

### 步骤 2: 重新获取凭证

1. 点击应用名称进入详情
2. **Client ID**: 点击复制按钮
3. **Client Secret**: 
   - 点击 "Show" 显示完整Secret
   - 点击复制按钮
   - **注意**: 复制后不要添加任何空格或换行

### 步骤 3: 验证凭证格式

正确的凭证格式：
- **Client ID**: 以 `A...` 开头，80字符
- **Client Secret**: 以 `E...` 开头，80-100字符

### 步骤 4: 更新配置

复制新凭证后，更新以下文件：

**`.env.local`**:
```
VITE_PAYPAL_CLIENT_ID=新的Client_ID
VITE_PAYPAL_CLIENT_SECRET=新的Client_Secret
```

**`test-paypal-sdk.js`**:
```javascript
const clientId = '新的Client_ID';
const clientSecret = '新的Client_Secret';
```

## 如果问题持续

1. 尝试删除应用并创建新的REST API应用
2. 等待几分钟后使用新凭证
3. 检查PayPal账户是否有API访问权限

## 联系支持

如果以上步骤都无效：
- 访问 https://developer.paypal.com/support
- 检查账户状态是否正常