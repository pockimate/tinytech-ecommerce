// 测试更新 content
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  console.log('🔍 测试更新 content...\n');
  
  const contentId = 'scene-1';
  
  // 1. 查找记录
  console.log(`📝 查找 content ID: ${contentId}...`);
  const { data: existingRecords, error: findError } = await supabase
    .from('site_content')
    .select('id, content')
    .eq('content->>id', contentId)
    .limit(1);
  
  if (findError) {
    console.log('❌ 查找失败:', findError.message);
    return;
  }
  
  if (!existingRecords || existingRecords.length === 0) {
    console.log('❌ 未找到记录');
    return;
  }
  
  console.log('✅ 找到记录:');
  console.log('   数据库ID:', existingRecords[0].id);
  console.log('   当前图片:', existingRecords[0].content.image);
  
  // 2. 更新记录
  const newContent = {
    ...existingRecords[0].content,
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767870370/boke4_vkn3gk.webp'
  };
  
  console.log('\n📝 更新图片...');
  const { error: updateError } = await supabase
    .from('site_content')
    .update({
      content: newContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingRecords[0].id);
  
  if (updateError) {
    console.log('❌ 更新失败:', updateError.message);
    console.log('   错误代码:', updateError.code);
    console.log('   详情:', updateError.details);
  } else {
    console.log('✅ 更新成功!');
  }
}

testUpdate();
