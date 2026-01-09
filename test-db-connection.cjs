const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aidtulrpkxvlyjbvqxhd.supabase.co',
  'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo'
);

async function test() {
  console.log('=== Supabase 数据库连接测试 ===\n');

  // 1. 测试连接
  console.log('1. 测试基本连接...');
  const { data: conn, error: connErr } = await supabase
    .from('products')
    .select('count', { count: 'exact', head: true });
  
  if (connErr) {
    console.log('   连接失败:', connErr.message);
  } else {
    console.log('   ✅ 连接成功');
  }

  // 2. 检查所有表
  console.log('\n2. 检查所有表...');
  const tables = ['products', 'orders', 'site_content', 'reviews', 'blog_posts'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: 存在 (${count || 0} 条记录)`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }

  // 3. 查看产品示例
  console.log('\n3. 产品示例数据...');
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, price')
    .limit(3);
  
  if (pError) {
    console.log('   获取产品失败:', pError.message);
  } else if (products && products.length > 0) {
    console.log('   ✅ 找到', products.length, '个产品');
    products.forEach((p, i) => console.log(`   ${i+1}. ${p.name} - €${p.price}`));
  } else {
    console.log('   ⚠️ 数据库中没有产品数据');
  }

  console.log('\n=== 测试完成 ===');
}

test().catch(e => {
  console.error('测试出错:', e.message);
  process.exit(1);
});