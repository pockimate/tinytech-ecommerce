// 测试数据库插入权限
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🔍 测试数据库写入权限...\n');
  
  // 测试1: 尝试插入产品
  console.log('📦 测试插入产品...');
  const testProduct = {
    name: 'Test Product ' + Date.now(),
    category: 'Test',
    price: 99.99,
    rating: 4.5,
    stock_level: 10,
    image_url: 'https://example.com/test.jpg',
    description: 'Test product description'
  };
  
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert(testProduct)
    .select()
    .single();
  
  if (productError) {
    console.log('❌ 插入产品失败:', productError.message);
    console.log('   错误代码:', productError.code);
    console.log('   详细信息:', productError.details);
    console.log('   提示:', productError.hint);
  } else {
    console.log('✅ 插入产品成功!');
    console.log('   产品ID:', productData.id);
    
    // 清理测试数据
    console.log('\n🧹 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productData.id);
    
    if (deleteError) {
      console.log('❌ 删除测试产品失败:', deleteError.message);
    } else {
      console.log('✅ 测试产品已删除');
    }
  }
  
  // 测试2: 检查 RLS 策略
  console.log('\n📋 检查数据库表结构...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_info')
    .select('*');
  
  if (tablesError) {
    console.log('   (无法获取表信息，这是正常的)');
  }
  
  console.log('\n========================================');
  console.log('测试完成!');
}

testInsert();
