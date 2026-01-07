/**
 * 汇率服务
 * 使用 Frankfurter API (免费，无需API密钥)
 * https://www.frankfurter.app/
 */

// 基础货币
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'BRL' | 'MXN';

// 汇率数据接口
export interface ExchangeRateData {
  base: string;
  date: string;
  rates: Record<CurrencyCode, number>;
}

// 缓存汇率数据（避免频繁请求）
let cachedRates: ExchangeRateData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1小时缓存

// 默认汇率（当API不可用时备用）
const defaultRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.77,
  JPY: 143,
  CNY: 7.1,
  KRW: 1300,
  CAD: 1.32,
  AUD: 1.47,
  CHF: 0.86,
  INR: 83,
  BRL: 4.9,
  MXN: 17.7
};

/**
 * 获取实时汇率
 * @param baseCurrency 基础货币，默认为USD
 * @param forceRefresh 是否强制刷新缓存
 */
export async function getExchangeRates(
  baseCurrency: CurrencyCode = 'USD',
  forceRefresh: boolean = false
): Promise<ExchangeRateData> {
  const now = Date.now();
  
  // 检查缓存
  if (!forceRefresh && cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Frankfurter API 是免费的开源汇率API
    const response = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // 构建返回数据
    const rates: Record<CurrencyCode, number> = {
      USD: data.rates.USD || 1,
      EUR: data.rates.EUR || 0.91,
      GBP: data.rates.GBP || 0.77,
      JPY: data.rates.JPY || 143,
      CNY: data.rates.CNY || 7.1,
      KRW: data.rates.KRW || 1300,
      CAD: data.rates.CAD || 1.32,
      AUD: data.rates.AUD || 1.47,
      CHF: data.rates.CHF || 0.86,
      INR: data.rates.INR || 83,
      BRL: data.rates.BRL || 4.9,
      MXN: data.rates.MXN || 17.7
    };

    const result: ExchangeRateData = {
      base: baseCurrency,
      date: data.date,
      rates
    };

    // 更新缓存
    cachedRates = result;
    lastFetchTime = now;

    return result;
  } catch (error) {
    console.error('Failed to fetch exchange rates, using defaults:', error);
    
    // 返回默认汇率
    return {
      base: baseCurrency,
      date: new Date().toISOString().split('T')[0],
      rates: defaultRates
    };
  }
}

/**
 * 转换货币
 * @param amount 金额
 * @param fromCurrency 源货币
 * @param toCurrency 目标货币
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  const rates = await getExchangeRates(fromCurrency);
  const rate = rates.rates[toCurrency];
  return Number((amount * rate).toFixed(2));
}

/**
 * 货币符号映射
 */
export const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  KRW: '₩',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'Fr',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$'
};

/**
 * 获取所有支持的货币
 */
export function getSupportedCurrencies(): { code: CurrencyCode; name: string; symbol: string }[] {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'KRW', name: 'Korean Won', symbol: '₩' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' }
  ];
}