/**
 * 信用卡验证工具
 * 使用 Luhn 算法验证信用卡号的有效性
 */

/**
 * Luhn 算法验证信用卡号
 * @param cardNumber 信用卡号（可以包含空格）
 * @returns 是否有效
 */
export function validateCardNumberLuhn(cardNumber: string): boolean {
  // 移除所有空格和非数字字符
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // 检查长度（13-19位）
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // 拒绝全零或全相同数字
  if (/^0+$/.test(cleaned) || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }
  
  // Luhn 算法
  let sum = 0;
  let isEven = false;
  
  // 从右到左遍历
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * 检测信用卡类型
 * @param cardNumber 信用卡号
 * @returns 卡类型
 */
export function detectCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa: 以 4 开头
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard: 51-55 或 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cleaned)) {
    return 'mastercard';
  }
  
  // American Express: 34 或 37
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^6011|^622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5])|^64[4-9]|^65/.test(cleaned)) {
    return 'discover';
  }
  
  // JCB: 3528-3589
  if (/^35(2[89]|[3-8][0-9])/.test(cleaned)) {
    return 'jcb';
  }
  
  // Diners Club: 300-305, 36, 38
  if (/^3(0[0-5]|[68])/.test(cleaned)) {
    return 'diners';
  }
  
  return 'unknown';
}

/**
 * 检查是否是测试卡号
 * @param cardNumber 信用卡号
 * @returns 是否是测试卡
 */
export function isTestCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // 常见的测试卡号
  const testCards = [
    '4242424242424242', // Stripe test card
    '4111111111111111', // Generic test card
    '5555555555554444', // Mastercard test
    '378282246310005',  // Amex test
    '6011111111111117', // Discover test
    '3530111333300000', // JCB test
    '5105105105105100', // Mastercard test
    '4012888888881881', // Visa test
    '4000056655665556', // Visa debit test
  ];
  
  return testCards.includes(cleaned);
}

/**
 * 验证过期日期
 * @param expiryDate 格式 MM/YY
 * @returns 是否有效
 */
export function validateExpiryDate(expiryDate: string): boolean {
  const match = expiryDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt('20' + match[2], 10);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // 检查是否过期
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  // 检查是否太远（超过20年）
  if (year > currentYear + 20) return false;
  
  return true;
}

/**
 * 验证 CVV
 * @param cvv CVV 码
 * @param cardType 卡类型
 * @returns 是否有效
 */
export function validateCVV(cvv: string, cardType: string = 'unknown'): boolean {
  // American Express 是 4 位，其他是 3 位
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}

/**
 * 格式化信用卡号（添加空格）
 * @param cardNumber 信用卡号
 * @returns 格式化后的卡号
 */
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
}

/**
 * 完整的信用卡验证
 * @param cardNumber 信用卡号
 * @param expiryDate 过期日期 MM/YY
 * @param cvv CVV
 * @param cardholderName 持卡人姓名
 * @returns 验证结果
 */
export function validateCreditCard(
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  cardholderName: string
): {
  valid: boolean;
  errors: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
  cardType?: string;
  isTestCard?: boolean;
} {
  const errors: any = {};
  
  // 验证卡号
  const cleaned = cardNumber.replace(/\D/g, '');
  if (!cleaned) {
    errors.cardNumber = 'Card number is required';
  } else if (cleaned.length < 13 || cleaned.length > 19) {
    errors.cardNumber = 'Card number must be 13-19 digits';
  } else if (!validateCardNumberLuhn(cardNumber)) {
    errors.cardNumber = 'Invalid card number (failed Luhn check)';
  }
  
  // 检测卡类型
  const cardType = detectCardType(cardNumber);
  const testCard = isTestCard(cardNumber);
  
  // 在生产环境拒绝测试卡
  if (testCard && import.meta.env.PROD) {
    errors.cardNumber = 'Test cards are not accepted in production';
  }
  
  // 验证过期日期
  if (!validateExpiryDate(expiryDate)) {
    errors.expiryDate = 'Invalid or expired date';
  }
  
  // 验证 CVV
  if (!validateCVV(cvv, cardType)) {
    errors.cvv = cardType === 'amex' ? 'CVV must be 4 digits' : 'CVV must be 3 digits';
  }
  
  // 验证持卡人姓名
  if (!cardholderName.trim()) {
    errors.cardholderName = 'Cardholder name is required';
  } else if (cardholderName.trim().length < 3) {
    errors.cardholderName = 'Name is too short';
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(cardholderName)) {
    errors.cardholderName = 'Invalid characters in name';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    cardType,
    isTestCard: testCard
  };
}

export default {
  validateCardNumberLuhn,
  detectCardType,
  isTestCard,
  validateExpiryDate,
  validateCVV,
  formatCardNumber,
  validateCreditCard
};
