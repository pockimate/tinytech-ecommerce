/**
 * Security utility functions
 * 用于输入验证、数据清理和XSS防护
 */

/**
 * HTML内容清理，防止XSS攻击
 */
export const sanitizeHTML = (str: string): string => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

/**
 * 验证URL格式
 */
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // 只允许http和https协议
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 清理字符串，移除潜在的脚本标签
 */
export const cleanString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * 验证localStorage数据结构
 */
export const validateLocalStorageData = <T>(
  data: string,
  validator?: (obj: any) => boolean
): T | null => {
  try {
    const parsed = JSON.parse(data);
    if (!validator || validator(parsed)) {
      return parsed as T;
    }
  } catch (error) {
    console.error('Invalid localStorage data:', error);
  }
  return null;
};

/**
 * 安全的localStorage读取
 */
export const safeGetLocalStorage = <T>(
  key: string,
  defaultValue: T,
  validator?: (obj: any) => boolean
): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;

    if (validator) {
      const validated = validateLocalStorageData<T>(saved, validator);
      return validated || defaultValue;
    }

    return JSON.parse(saved) as T;
  } catch (error) {
    console.error(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * 验证产品数组数据结构
 */
export const isValidProductArray = (data: any): boolean => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number'
    )
  );
};

/**
 * 验证订单数据结构
 */
export const isValidOrder = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.total === 'number' &&
    Array.isArray(data.items)
  );
};

/**
 * 限制字符串长度，防止DoS攻击
 */
export const limitStringLength = (str: string, maxLength: number = 1000): string => {
  return str.slice(0, maxLength);
};

/**
 * 验证并清理用户输入
 */
export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  return limitStringLength(cleanString(input.trim()), maxLength);
};
