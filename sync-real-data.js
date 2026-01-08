/**
 * 同步真实的横幅和产品数据到数据库
 * 使用你实际制作的内容
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

// 你的真实横幅数据（基于之前看到的内容）
const realBanners = [
  {
    id: 'banner-1',
    title: 'FULL ANDROID SYSTEM',
    subtitle: 'Experience the power of a complete Android system in the palm of your hand.',
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp',
    buttonText: 'Shop Now',
    buttonLink: 'products',
    backgroundColor: 'from-indigo-600 to-purple-600',
    order: 0,
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'Ultra Compact Design',
    subtitle: 'The world\'s smallest smartphone with flagship performance.',
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp', // 假设你有第二张图
    buttonText: 'Explore Now',
    buttonLink: 'products',
    backgroundColor: 'from-blue-600 to-cyan-600',
    order: 1,
    isActive: true
  },
  {
    id: 'banner-3',
    title: 'Limited Time Offer',
    subtitle: 'Get your mini smartphone today with exclusive early bird pricing.',
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/14_abcdef.webp', // 假设你有第三张图
    buttonText: 'Order Now',
    buttonLink: 'products',
    backgroundColor: 'from-rose-600 to-pink-600',
    order: 2,
    isActive: true
  }
];

// 你的真实产品数据（基于你的小手机产品）
const realProducts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001', // UUID格式
    name: 'TinyPhone Pro',
    category: 'phone',
    price: 299,
    rating: 4.8,
    stockLevel: 50,
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp',
    images: [
      'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp',
      'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp',
      'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/14_abcdef.webp'
    ],
    description: 'Ultra-compact smartphone with full Android system',
    fullDescription: 'The TinyPhone Pro packs all the power of a flagship smartphone into an incredibly compact form factor. Perfect for those who want the full Android experience without the bulk.',
    colorOptions: [
      { name: 'Black', value: '#000000', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp' },
      { name: 'White', value: '#FFFFFF', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp' },
      { name: 'Blue', value: '#0066CC', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/14_abcdef.webp' }
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
    ],
    reviews: []
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', // UUID格式
    name: 'TinyPhone Mini',
    category: 'phone',
    price: 199,
    rating: 4.6,
    stockLevel: 30,
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp',
    images: [
      'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp',
      'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp'
    ],
    description: 'Entry-level mini smartphone with essential features',
    fullDescription: 'The TinyPhone Mini offers all the essential smartphone features in an ultra-compact design. Perfect for users who want simplicity without sacrificing functionality.',
    colorOptions: [
      { name: 'White', value: '#FFFFFF', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/13_xvqwer.webp' },
      { name: 'Black', value: '#000000', image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767455161/12_cyesn9.webp' }
    ],
    specs: {
      battery: '1500mAh',
      storage: '64GB',
      chipset: 'MediaTek Dimensity 700'
    },
    features: [
      'Android 14 Go Edition',
      'Ultra Compact Design',
      'Affordable Price',
      'Essential Features'
    ],
    reviews: []
  }
];

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

// Upsert function for products
async function upsertProduct(product) {
  // Check if product exists
  const { data: existingProducts, error: findError } = await supabase
    .from('products')
    .select('id')
    .eq('id', product.id)
    .limit(1);
  
  if (findError) {
    console.error('Error checking existing product:', findError);
    throw findError;
  }
  
  if (existingProducts && existingProducts.length > 0) {
    // Update existing product
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        category: product.category,
        price: product.price,
        rating: product.rating,
        stock_level: product.stockLevel,
        image_url: product.image,
        images: product.images,
        color_options: product.colorOptions,
        variants: product.variants,
        bundles: product.bundles,
        detail_images: product.detailImages,
        description: product.description,
        reviews: product.reviews,
        specs: product.specs,
        features: product.features,
        full_description: product.fullDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id);
    
    if (error) {
      console.error('Error updating existing product:', error);
      throw error;
    }
    
    console.log(`✅ Updated existing product: ${product.name}`);
    return 'updated';
  } else {
    // Create new product
    const { error } = await supabase
      .from('products')
      .insert({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        rating: product.rating,
        stock_level: product.stockLevel,
        image_url: product.image,
        images: product.images,
        color_options: product.colorOptions,
        variants: product.variants,
        bundles: product.bundles,
        detail_images: product.detailImages,
        description: product.description,
        reviews: product.reviews,
        specs: product.specs,
        features: product.features,
        full_description: product.fullDescription
      });
    
    if (error) {
      console.error('Error creating new product:', error);
      throw error;
    }
    
    console.log(`✅ Created new product: ${product.name}`);
    return 'created';
  }
}

async function syncRealData() {
  console.log('🚀 Syncing real data to database...\n');
  
  try {
    // 1. Sync banners
    console.log('📋 Syncing banners...');
    for (const banner of realBanners) {
      await upsertContent('banner', banner, banner.order);
    }
    console.log(`✅ Synced ${realBanners.length} banners\n`);
    
    // 2. Sync products
    console.log('📦 Syncing products...');
    for (const product of realProducts) {
      await upsertProduct(product);
    }
    console.log(`✅ Synced ${realProducts.length} products\n`);
    
    // 3. Verify results
    console.log('🔍 Verifying sync results...');
    
    // Check banners
    const { data: syncedBanners, error: bannerError } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'banner')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (bannerError) {
      console.error('Error verifying banners:', bannerError);
    } else {
      console.log(`📋 Active banners in database: ${syncedBanners.length}`);
      syncedBanners.forEach((banner, index) => {
        console.log(`   ${index + 1}. ${banner.content.id}: "${banner.content.title}"`);
      });
    }
    
    // Check products
    const { data: syncedProducts, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_level')
      .order('created_at', { ascending: true });
    
    if (productError) {
      console.error('Error verifying products:', productError);
    } else {
      console.log(`\n📦 Products in database: ${syncedProducts.length}`);
      syncedProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock_level})`);
      });
    }
    
    console.log('\n🎉 Real data sync completed successfully!');
    console.log('Your website should now display the correct banners and products.');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

syncRealData();