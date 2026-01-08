// Clean test data from Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTestData() {
  console.log('🧹 Cleaning all site_content data to prepare for fresh migration...');
  
  try {
    // Delete all site_content data
    const { error } = await supabase
      .from('site_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) {
      console.error('❌ Failed to clean data:', error);
    } else {
      console.log('✅ All site_content data cleaned successfully');
      
      // Also clean products if needed
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (productError) {
        console.error('❌ Failed to clean products:', productError);
      } else {
        console.log('✅ All products data cleaned successfully');
      }
      
      // Verify cleanup
      const { data: contentData } = await supabase.from('site_content').select('*');
      const { data: productData } = await supabase.from('products').select('*');
      
      console.log('📊 Remaining site_content records:', contentData?.length || 0);
      console.log('📊 Remaining products records:', productData?.length || 0);
      console.log('🎯 Database is now ready for fresh migration!');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanTestData();