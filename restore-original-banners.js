/**
 * 恢复原始横幅数据，删除测试横幅
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreOriginalBanners() {
  console.log('🔄 Restoring original banner data...\n');
  
  try {
    // 1. 删除测试横幅 (banner-4)
    console.log('🗑️  Deleting test banner (banner-4)...');
    const { error: deleteError } = await supabase
      .from('site_content')
      .update({ is_active: false })
      .eq('type', 'banner')
      .eq('content->>id', 'banner-4');
    
    if (deleteError) {
      console.error('Error deleting test banner:', deleteError);
    } else {
      console.log('✅ Test banner deleted');
    }
    
    // 2. 恢复banner-2的原始内容
    console.log('🔄 Restoring banner-2 to original content...');
    const originalBanner2 = {
      id: 'banner-2',
      title: 'ZenWatch Ultra',
      subtitle: 'The complete smartwatch that replaces your phone. Integrated 4G LTE.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400',
      buttonText: 'Explore Now',
      buttonLink: 'products',
      backgroundColor: 'from-blue-600 to-cyan-600',
      order: 1,
      isActive: true
    };
    
    // 找到banner-2的数据库记录
    const { data: banner2Records, error: findError } = await supabase
      .from('site_content')
      .select('id')
      .eq('type', 'banner')
      .eq('content->>id', 'banner-2')
      .limit(1);
    
    if (findError) {
      console.error('Error finding banner-2:', findError);
    } else if (banner2Records && banner2Records.length > 0) {
      const dbRecordId = banner2Records[0].id;
      
      const { error: updateError } = await supabase
        .from('site_content')
        .update({
          content: originalBanner2,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbRecordId);
      
      if (updateError) {
        console.error('Error restoring banner-2:', updateError);
      } else {
        console.log('✅ Banner-2 restored to original content');
      }
    }
    
    // 3. 添加banner-1的标题（如果缺失）
    console.log('🔄 Updating banner-1 with proper title...');
    const updatedBanner1 = {
      id: 'banner-1',
      title: 'FULL ANDROID SYSTEM',
      subtitle: 'Experience the power of a complete Android system in the palm of your hand.',
      image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp',
      buttonText: 'Shop Now',
      buttonLink: 'products',
      backgroundColor: 'from-indigo-600 to-purple-600',
      order: 0,
      isActive: true
    };
    
    // 找到banner-1的数据库记录
    const { data: banner1Records, error: find1Error } = await supabase
      .from('site_content')
      .select('id')
      .eq('type', 'banner')
      .eq('content->>id', 'banner-1')
      .limit(1);
    
    if (find1Error) {
      console.error('Error finding banner-1:', find1Error);
    } else if (banner1Records && banner1Records.length > 0) {
      const dbRecordId = banner1Records[0].id;
      
      const { error: update1Error } = await supabase
        .from('site_content')
        .update({
          content: updatedBanner1,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbRecordId);
      
      if (update1Error) {
        console.error('Error updating banner-1:', update1Error);
      } else {
        console.log('✅ Banner-1 updated with proper title');
      }
    }
    
    // 4. 验证最终结果
    console.log('\n🔍 Verifying final banner state...');
    const { data: finalBanners, error: verifyError } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'banner')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (verifyError) {
      console.error('Error verifying banners:', verifyError);
    } else {
      console.log(`✅ Final active banners: ${finalBanners.length}`);
      finalBanners.forEach((banner, index) => {
        console.log(`   ${index + 1}. ${banner.content.id}: "${banner.content.title}"`);
      });
    }
    
    console.log('\n🎉 Banner restoration completed!');
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
  }
}

restoreOriginalBanners();