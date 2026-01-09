// 检查 Why Mini 数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWhyMini() {
  console.log('🔍 检查 Why Mini 数据...\n');
  
  // 检查 site_content 表中的 why_mini 相关内容
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .or('type.eq.why_mini_scene,type.eq.why_mini_content,type.eq.whymini');
  
  if (error) {
    console.log('❌ 错误:', error.message);
    return;
  }
  
  console.log('📄 找到的 Why Mini 数据:');
  console.log(JSON.stringify(data, null, 2));
  
  // 也检查所有类型
  console.log('\n📋 所有内容类型:');
  const { data: allTypes } = await supabase
    .from('site_content')
    .select('type')
    .limit(20);
  
  const types = [...new Set(allTypes?.map(t => t.type))];
  console.log(types);
}

checkWhyMini();
