/**
 * 同步本地localStorage数据到Supabase数据库
 * 包括横幅和产品数据
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

// 模拟localStorage数据（从浏览器中获取）
// 你需要在浏览器控制台中运行以下命令来获取数据：
// console.log('Banners:', JSON.stringify(JSON.parse(localStorage.getItem('tinytech_banners')), null, 2));
// console.log('Products:', JSON.stringify(JSON.parse(localStorage.getItem('tinytech_products')), null, 2));

async function syncLocalToDatabase() {
  console.log('🔄 Syncing local data to database...\n');
  
  try {
    // 首先，我们需要获取本地数据
    console.log('📋 Please provide your local data:');
    console.log('1. Open your website in browser');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Run these commands:');
    console.log('   console.log("Banners:", JSON.stringify(JSON.parse(localStorage.getItem("tinytech_banners")), null, 2));');
    console.log('   console.log("Products:", JSON.stringify(JSON.parse(localStorage.getItem("tinytech_products")), null, 2));');
    console.log('5. Copy the output and update this script\n');
    
    // 示例：如果你有本地数据，可以在这里添加
    // const localBanners = [...]; // 从localStorage获取的横幅数据
    // const localProducts = [...]; // 从localStorage获取的产品数据
    
    console.log('⚠️  This script needs to be updated with your actual local data.');
    console.log('Please follow the instructions above to get your local data.');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Upsert function for content
async function upsertContent(type, content, orderIndex = 0) {
  const contentId = content.id;
  
  if (!contentId) {
    throw new Error('Content must have an id field');
  }
  
  // Check if exists
  const { data: existingRecords, error: findError } = await supabase
    .from('site_content')
    .select('id')
    .eq('type', type)
    .eq('content->>id', contentId)
    .limit(1);
  
  if (findError) {
    console.error('Error checking existing content:', findError);
    throw findError;
  }
  
  if (existingRecords && existingRecords.length > 0) {
    // Update existing record
    const dbRecordId = existingRecords[0].id;
    const { error } = await supabase
      .from('site_content')
      .update({
        content,
        order_index: orderIndex,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbRecordId);
    
    if (error) {
      console.error('Error updating existing content:', error);
      throw error;
    }
    
    console.log(`✅ Updated existing ${type} content: ${contentId}`);
    return 'updated';
  } else {
    // Create new record
    const { error } = await supabase
      .from('site_content')
      .insert({
        type,
        content,
        order_index: orderIndex,
        is_active: true
      });
    
    if (error) {
      console.error('Error creating new content:', error);
      throw error;
    }
    
    console.log(`✅ Created new ${type} content: ${contentId}`);
    return 'created';
  }
}

syncLocalToDatabase();