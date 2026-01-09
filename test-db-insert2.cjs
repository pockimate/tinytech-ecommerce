// 测试数据库插入权限 - 增加超时
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
});

async function testInsert() {
  console.log('🔍 测试数据库写入权限...\n');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  // 先测试读取
  console.log('📖 测试读取...');
  const { data: readData, error: readError } = await supabase
    .from('products')
    .select('id, name')
    .limit(1);
  
  if (readError) {
    console.log('❌ 读取失败:', readError.message);
    console.log('   代码:', readError.code);
    return;
  }
  console.log('✅ 读取成功:', readData);
  
  // 测试插入
  console.log('\n📦 测试插入产品...');
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
    console.log('❌ 插入产品失败!');
    console.log('   错误信息:', productError.message);
    console.log('   错误代码:', productError.code);
    console.log('   详细信息:', productError.details);
    console.log('   提示:', productError.hint);
    
    if (productError.code === '42501') {
      console.log('\n⚠️  这是 RLS (Row Level Security) 权限问题!');
      console.log('   需要在 Supabase 后台配置 products 表的 INSERT 策略');
    }
  } else {
    console.log('✅ 插入产品成功!');
    console.log('   产品ID:', productData.id);
    
    // 清理测试数据
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productData.id);
    
    if (!deleteError) {
      console.log('✅ 测试产品已清理');
    }
  }
}

testInsert().catch(console.error);
