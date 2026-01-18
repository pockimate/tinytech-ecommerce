/**
 * 信用卡验证测试
 * 运行: node test-card-validation.cjs
 */

// Luhn 算法验证
function validateCardNumberLuhn(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
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

console.log('\n🧪 信用卡验证测试\n');

// 测试用例
const testCases = [
  { number: '4242 4242 4242 4242', name: 'Stripe Test Card', shouldPass: true },
  { number: '4111 1111 1111 1111', name: 'Generic Test Card', shouldPass: true },
  { number: '5555 5555 5555 4444', name: 'Mastercard Test', shouldPass: true },
  { number: '3782 822463 10005', name: 'Amex Test', shouldPass: true },
  { number: '1234 5678 9012 3456', name: 'Invalid Card', shouldPass: false },
  { number: '0000 0000 0000 0000', name: 'All Zeros', shouldPass: false },
  { number: '1111 1111 1111 1111', name: 'All Ones', shouldPass: false },
  { number: '4532 0151 1416 6978', name: 'Valid Visa', shouldPass: true },
  { number: '5425 2334 3010 9903', name: 'Valid Mastercard', shouldPass: true },
];

console.log('测试结果:\n');

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const result = validateCardNumberLuhn(test.number);
  const status = result === test.shouldPass ? '✅ PASS' : '❌ FAIL';
  
  if (result === test.shouldPass) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} | ${test.name}`);
  console.log(`       卡号: ${test.number}`);
  console.log(`       预期: ${test.shouldPass ? '有效' : '无效'}, 实际: ${result ? '有效' : '无效'}\n`);
});

console.log('═══════════════════════════════════════');
console.log(`总计: ${testCases.length} 个测试`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log('═══════════════════════════════════════\n');

if (failed === 0) {
  console.log('🎉 所有测试通过！信用卡验证工作正常。\n');
} else {
  console.log('⚠️  有测试失败，请检查验证逻辑。\n');
  process.exit(1);
}
