// 详细数据库内容检查
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetails() {
  console.log('📊 数据库详细内容检查\n');
  console.log('========================================\n');
  
  // 产品详情
  console.log('📦 产品列表:');
  const { data: products } = await supabase.from('products').select('*');
  if (products && products.length > 0) {
    products.forEach(p => {
      console.log(`   ID: ${p.id}`);
      console.log(`   名称: ${p.name}`);
      console.log(`   价格: $${p.price}`);
      console.log(`   库存: ${p.stock_level}`);
      console.log('');
    });
  } else {
    console.log('   (无产品数据)');
  }
  
  // 网站内容类型统计
  console.log('\n📄 网站内容统计:');
  const { data: content } = await supabase.from('site_content').select('type, is_active');
  if (content && content.length > 0) {
    const typeCount = {};
    content.forEach(c => {
      typeCount[c.type] = (typeCount[c.type] || 0) + 1;
    });
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} 条`);
    });
  } else {
    console.log('   (无内容数据)');
  }
  
  // 订单统计
  console.log('\n📋 订单统计:');
  const { data: orders } = await supabase.from('orders').select('status');
  if (orders && orders.length > 0) {
    const statusCount = {};
    orders.forEach(o => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} 个`);
    });
  } else {
    console.log('   (无订单数据)');
  }
  
  console.log('\n========================================');
  console.log('✅ 检查完成!');
}

checkDetails();
