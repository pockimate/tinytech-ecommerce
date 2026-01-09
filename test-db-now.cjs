// 数据库连接测试脚本
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

console.log('🔍 测试 Supabase 数据库连接...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '未配置');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // 测试1: 检查产品表
    console.log('📦 测试产品表连接...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (productsError) {
      console.log('❌ 产品表错误:', productsError.message);
    } else {
      console.log(`✅ 产品表连接成功! 找到 ${products?.length || 0} 个产品`);
      if (products && products.length > 0) {
        products.forEach(p => console.log(`   - ${p.name}`));
      }
    }
    
    // 测试2: 检查订单表
    console.log('\n📋 测试订单表连接...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ 订单表错误:', ordersError.message);
    } else {
      console.log(`✅ 订单表连接成功! 找到 ${orders?.length || 0} 个订单`);
    }
    
    // 测试3: 检查网站内容表
    console.log('\n📄 测试网站内容表连接...');
    const { data: content, error: contentError } = await supabase
      .from('site_content')
      .select('id, type')
      .limit(5);
    
    if (contentError) {
      console.log('❌ 网站内容表错误:', contentError.message);
    } else {
      console.log(`✅ 网站内容表连接成功! 找到 ${content?.length || 0} 条内容`);
    }
    
    console.log('\n========================================');
    console.log('🎉 数据库连接测试完成!');
    
  } catch (error) {
    console.error('\n❌ 连接测试失败:', error.message);
  }
}

testConnection();
