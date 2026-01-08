// Debug Supabase connection and data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('🔍 Debugging Supabase database...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('site_content')
      .select('count');
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      
      // Check if table exists by trying to create it
      console.log('\n2. Checking if tables exist...');
      const { data: createResult, error: createError } = await supabase.rpc('create_table_if_not_exists');
      
      if (createError) {
        console.log('⚠️ Cannot check table existence:', createError.message);
      }
      
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Check all tables
    console.log('\n2. Checking all tables...');
    const tables = ['products', 'orders', 'site_content', 'reviews', 'blog_posts'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table exists`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // Check site_content specifically
    console.log('\n3. Detailed site_content check...');
    const { data: contentData, error: contentError } = await supabase
      .from('site_content')
      .select('*');
    
    if (contentError) {
      console.error('❌ site_content error:', contentError);
    } else {
      console.log('📊 site_content records:', contentData.length);
      if (contentData.length > 0) {
        console.log('Sample record:', contentData[0]);
      }
    }
    
    // Check products
    console.log('\n4. Checking products...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ products error:', productsError);
    } else {
      console.log('📊 products records:', productsData.length);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugDatabase();