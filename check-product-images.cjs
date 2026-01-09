// 检查产品图片 URL
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  console.log('🔍 检查产品图片 URL...\n');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, images');
  
  if (error) {
    console.log('❌ 错误:', error.message);
    return;
  }
  
  products?.forEach(p => {
    console.log(`📦 ${p.name}`);
    console.log(`   主图: ${p.image_url || '(空)'}`);
    console.log(`   图片数组: ${JSON.stringify(p.images) || '(空)'}`);
    console.log('');
  });
}

checkImages();
