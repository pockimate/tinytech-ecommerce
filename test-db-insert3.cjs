// 测试正确的分类值
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🔍 测试使用正确的分类值...\n');
  
  // 先查看现有产品的分类
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id, name, category');
  
  console.log('📦 现有产品分类:');
  existingProducts?.forEach(p => {
    console.log(`   ${p.name}: "${p.category}"`);
  });
  
  // 尝试使用现有的分类值
  const categories = ['Phones', 'phones', 'Phone', 'phone', 'Electronics', 'electronics'];
  
  for (const category of categories) {
    console.log(`\n📦 尝试分类: "${category}"...`);
    
    const testProduct = {
      name: 'Test Product ' + Date.now(),
      category: category,
      price: 99.99,
      rating: 4.5,
      stock_level: 10,
      image_url: 'https://example.com/test.jpg',
      description: 'Test product description'
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (error) {
      console.log(`   ❌ 失败: ${error.message.substring(0, 60)}...`);
    } else {
      console.log(`   ✅ 成功! 产品ID: ${data.id}`);
      
      // 清理
      await supabase.from('products').delete().eq('id', data.id);
      console.log('   ✅ 测试数据已清理');
      console.log('\n========================================');
      console.log(`✅ 正确的分类值是: "${category}"`);
      return;
    }
  }
  
  console.log('\n========================================');
  console.log('❌ 所有常见分类都失败了，需要检查数据库约束');
}

testInsert().catch(console.error);
