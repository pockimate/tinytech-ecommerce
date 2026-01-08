/**
 * 简单的产品添加脚本
 * 添加你的真实产品到数据库
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addProducts() {
  console.log('📦 Adding products to database...\n');
  
  try {
    // 先清空现有产品
    console.log('🗑️  Clearing existing products...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有产品
    
    if (deleteError) {
      console.log('Note: No existing products to delete or delete failed:', deleteError.message);
    } else {
      console.log('✅ Existing products cleared');
    }
    
    // 添加你的真实产品
    const products = [
      {
        name: 'TinyPhone Pro',
        category: 'phone',
        price: 299,
        rating: 4.8,
        stock_level: 50,
        image_url: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp',
        images: [
          'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp'
        ],
        description: 'Ultra-compact smartphone with full Android system',
        full_description: 'The TinyPhone Pro packs all the power of a flagship smartphone into an incredibly compact form factor. Perfect for those who want the full Android experience without the bulk.',
        color_options: [
          { name: 'Black', value: '#000000', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp' }
        ],
        specs: {
          battery: '2000mAh',
          storage: '128GB',
          chipset: 'Snapdragon 8 Gen 2'
        },
        features: [
          'Full Android 14 System',
          'Ultra Compact Design',
          'Premium Build Quality',
          'Long Battery Life'
        ]
      }
    ];
    
    console.log('➕ Adding new products...');
    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();
      
      if (error) {
        console.error(`❌ Failed to add ${product.name}:`, error);
      } else {
        console.log(`✅ Added product: ${product.name} (ID: ${data[0].id})`);
      }
    }
    
    // 验证结果
    console.log('\n🔍 Verifying products...');
    const { data: allProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, price, stock_level');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log(`✅ Total products in database: ${allProducts.length}`);
      allProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock_level})`);
      });
    }
    
    console.log('\n🎉 Product sync completed!');
    
  } catch (error) {
    console.error('❌ Failed to add products:', error);
  }
}

addProducts();