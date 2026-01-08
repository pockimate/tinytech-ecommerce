/**
 * Clean up duplicate banner entries in Supabase database
 * Keep only unique banners based on content.id
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicateBanners() {
  console.log('🧹 Cleaning duplicate banner entries...');
  
  try {
    // Get all banner data
    const { data: allBanners, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'banner')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching banners:', error);
      return;
    }
    
    console.log(`📊 Found ${allBanners.length} total banner records`);
    
    // Group banners by content.id to find duplicates
    const bannerGroups = {};
    allBanners.forEach(banner => {
      const contentId = banner.content?.id || 'no-id';
      if (!bannerGroups[contentId]) {
        bannerGroups[contentId] = [];
      }
      bannerGroups[contentId].push(banner);
    });
    
    console.log(`📋 Found ${Object.keys(bannerGroups).length} unique banner IDs`);
    
    // Identify duplicates and keep only the first (oldest) entry for each content.id
    const bannersToDelete = [];
    const bannersToKeep = [];
    
    Object.entries(bannerGroups).forEach(([contentId, banners]) => {
      if (banners.length > 1) {
        console.log(`🔍 Found ${banners.length} duplicates for banner ID: ${contentId}`);
        // Keep the first (oldest) banner
        bannersToKeep.push(banners[0]);
        // Mark the rest for deletion
        bannersToDelete.push(...banners.slice(1));
      } else {
        bannersToKeep.push(banners[0]);
      }
    });
    
    console.log(`✅ Keeping ${bannersToKeep.length} unique banners`);
    console.log(`🗑️  Deleting ${bannersToDelete.length} duplicate banners`);
    
    if (bannersToDelete.length === 0) {
      console.log('✨ No duplicates found! Database is already clean.');
      return;
    }
    
    // Ask for confirmation
    console.log('\n⚠️  This will permanently delete duplicate banner entries.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Delete duplicates in batches
    const batchSize = 50;
    let deletedCount = 0;
    
    for (let i = 0; i < bannersToDelete.length; i += batchSize) {
      const batch = bannersToDelete.slice(i, i + batchSize);
      const idsToDelete = batch.map(b => b.id);
      
      const { error: deleteError } = await supabase
        .from('site_content')
        .delete()
        .in('id', idsToDelete);
      
      if (deleteError) {
        console.error(`❌ Error deleting batch ${Math.floor(i/batchSize) + 1}:`, deleteError);
      } else {
        deletedCount += batch.length;
        console.log(`✅ Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} records (Total: ${deletedCount}/${bannersToDelete.length})`);
      }
    }
    
    console.log(`\n🎉 Cleanup complete!`);
    console.log(`   Deleted: ${deletedCount} duplicate banners`);
    console.log(`   Remaining: ${bannersToKeep.length} unique banners`);
    
    // Verify the cleanup
    const { data: remainingBanners, error: verifyError } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'banner');
    
    if (!verifyError) {
      console.log(`✅ Verification: ${remainingBanners.length} banners remain in database`);
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

cleanDuplicateBanners();