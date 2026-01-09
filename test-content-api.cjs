// 测试 content API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🔍 测试 content API...\n');
  
  // 获取 why_mini_scene 数据
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('type', 'why_mini_scene')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.log('❌ 错误:', error.message);
    return;
  }
  
  console.log('📄 原始数据库数据:');
  data?.forEach(item => {
    console.log(`  数据库ID: ${item.id}`);
    console.log(`  内容ID: ${item.content.id}`);
    console.log(`  标题: ${item.content.title}`);
    console.log('');
  });
  
  // 模拟 getByType 的返回格式
  const processed = data?.map(item => ({ id: item.id, ...item.content })) || [];
  console.log('📄 处理后的数据 (getByType 返回格式):');
  processed.forEach(item => {
    console.log(`  id: ${item.id}`);
    console.log(`  原内容id变成了: ${item.id}`);  // 这里 id 被覆盖了
    console.log('');
  });
}

test();
