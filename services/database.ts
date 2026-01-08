/**
 * Supabase 数据库服务
 * 提供产品、订单、内容管理的 API 接口
 */

import { createClient } from '@supabase/supabase-js';
import { Product, Order, Banner, Feature, BrandStoryContent, VideoContent, NewsletterContent, SizeComparisonContent, FAQItem, Review, BlogPost, WhyMiniScene, WhyMiniContent, LogoSettings, CartItem } from '../types';

// Database Order interface for database operations
interface DatabaseOrderInput {
  userEmail?: string;
  items: CartItem[];
  total: number;
  status?: 'Processing' | 'Shipped' | 'Delivered';
  address?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paypalOrderId?: string;
}

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// 数据库表名常量
export const TABLES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SITE_CONTENT: 'site_content',
  REVIEWS: 'reviews',
  BLOG_POSTS: 'blog_posts'
} as const;

// 产品 API
export const productAPI = {
  // 获取所有产品
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return (data || []).map(this.mapDatabaseToProduct);
  },

  // 根据 ID 获取产品
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data ? this.mapDatabaseToProduct(data) : null;
  },

  // 创建产品
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .insert({
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
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    return this.mapDatabaseToProduct(data);
  },

  // 更新产品
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .update({
        name: updates.name,
        category: updates.category,
        price: updates.price,
        rating: updates.rating,
        stock_level: updates.stockLevel,
        image_url: updates.image,
        images: updates.images,
        color_options: updates.colorOptions,
        variants: updates.variants,
        bundles: updates.bundles,
        detail_images: updates.detailImages,
        description: updates.description,
        reviews: updates.reviews,
        specs: updates.specs,
        features: updates.features,
        full_description: updates.fullDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    return this.mapDatabaseToProduct(data);
  },

  // 删除产品
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.PRODUCTS)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // 数据库字段映射到 Product 类型
  mapDatabaseToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      category: dbProduct.category,
      price: dbProduct.price,
      rating: dbProduct.rating,
      stockLevel: dbProduct.stock_level,
      image: dbProduct.image_url,
      images: dbProduct.images || [],
      colorOptions: dbProduct.color_options || [],
      variants: dbProduct.variants || [],
      bundles: dbProduct.bundles || [],
      detailImages: dbProduct.detail_images || [],
      description: dbProduct.description || '',
      fullDescription: dbProduct.full_description || '',
      specs: dbProduct.specs || { battery: '', storage: '', chipset: '' },
      features: dbProduct.features || [],
      reviews: dbProduct.reviews || []
    };
  }
};

// 订单 API
export const orderAPI = {
  // 创建订单
  async create(order: DatabaseOrderInput): Promise<Order> {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .insert({
        user_email: order.userEmail || null,
        items: order.items,
        total: order.total,
        status: order.status || 'Processing',
        shipping_address: order.address || null,
        paypal_order_id: order.paypalOrderId || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    return this.mapDatabaseToOrder(data);
  },

  // 更新订单状态
  async updateStatus(id: string, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }
    
    return this.mapDatabaseToOrder(data);
  },

  // 根据 ID 获取订单
  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }
    
    return this.mapDatabaseToOrder(data);
  },

  // 获取所有订单
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    
    return data?.map(this.mapDatabaseToOrder) || [];
  },

  // 数据库字段映射到 Order 类型
  mapDatabaseToOrder(dbOrder: any): Order {
    return {
      id: dbOrder.id,
      date: new Date(dbOrder.created_at).toLocaleDateString(),
      items: dbOrder.items,
      total: dbOrder.total,
      status: dbOrder.status,
      address: dbOrder.shipping_address 
        ? `${dbOrder.shipping_address.address}, ${dbOrder.shipping_address.city}` 
        : 'No address provided'
    };
  }
};

// 网站内容 API
export const contentAPI = {
  // 获取指定类型的内容
  async getByType(type: string): Promise<any[]> {
    const { data, error } = await supabase
      .from(TABLES.SITE_CONTENT)
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${type} content:`, error);
      return [];
    }
    
    return data?.map(item => ({ id: item.id, ...item.content })) || [];
  },

  // 更新内容（通过内容ID查找数据库记录）
  async update(contentId: string, content: any): Promise<void> {
    // 首先通过内容ID找到数据库记录
    const { data: existingRecords, error: findError } = await supabase
      .from(TABLES.SITE_CONTENT)
      .select('id')
      .eq('content->>id', contentId)
      .limit(1);
    
    if (findError) {
      console.error('Error finding content record:', findError);
      throw findError;
    }
    
    if (!existingRecords || existingRecords.length === 0) {
      throw new Error(`Content with ID ${contentId} not found`);
    }
    
    const dbRecordId = existingRecords[0].id;
    
    const { error } = await supabase
      .from(TABLES.SITE_CONTENT)
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbRecordId);
    
    if (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  },

  // 创建或更新内容（upsert功能）
  async upsert(type: string, content: any, orderIndex: number = 0): Promise<void> {
    const contentId = content.id;
    
    if (!contentId) {
      throw new Error('Content must have an id field');
    }
    
    // 检查是否已存在
    const { data: existingRecords, error: findError } = await supabase
      .from(TABLES.SITE_CONTENT)
      .select('id')
      .eq('type', type)
      .eq('content->>id', contentId)
      .limit(1);
    
    if (findError) {
      console.error('Error checking existing content:', findError);
      throw findError;
    }
    
    if (existingRecords && existingRecords.length > 0) {
      // 更新现有记录
      const dbRecordId = existingRecords[0].id;
      const { error } = await supabase
        .from(TABLES.SITE_CONTENT)
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
    } else {
      // 创建新记录
      const { error } = await supabase
        .from(TABLES.SITE_CONTENT)
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
    }
  },

  // 创建内容（保留原方法用于向后兼容）
  async create(type: string, content: any, orderIndex: number = 0): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SITE_CONTENT)
      .insert({
        type,
        content,
        order_index: orderIndex,
        is_active: true
      });
    
    if (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  // 删除内容（通过内容ID）
  async delete(contentId: string): Promise<void> {
    // 首先通过内容ID找到数据库记录
    const { data: existingRecords, error: findError } = await supabase
      .from(TABLES.SITE_CONTENT)
      .select('id')
      .eq('content->>id', contentId)
      .limit(1);
    
    if (findError) {
      console.error('Error finding content record:', findError);
      throw findError;
    }
    
    if (!existingRecords || existingRecords.length === 0) {
      throw new Error(`Content with ID ${contentId} not found`);
    }
    
    const dbRecordId = existingRecords[0].id;
    
    // 软删除：标记为不活跃
    const { error } = await supabase
      .from(TABLES.SITE_CONTENT)
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbRecordId);
    
    if (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }
};

// 数据迁移工具
export const migrationAPI = {
  // 从本地数据迁移产品到数据库
  async migrateProducts(products: Product[]): Promise<void> {
    console.log('开始迁移产品数据...');
    
    for (const product of products) {
      try {
        await productAPI.create(product);
        console.log(`✅ 产品 "${product.name}" 迁移成功`);
      } catch (error) {
        console.error(`❌ 产品 "${product.name}" 迁移失败:`, error);
      }
    }
    
    console.log('产品数据迁移完成！');
  },

  // 迁移网站内容
  async migrateContent(contentData: {
    banners?: Banner[];
    features?: Feature[];
    brandStory?: BrandStoryContent;
    videos?: VideoContent[];
    newsletter?: NewsletterContent;
    sizeComparison?: SizeComparisonContent;
    faqs?: FAQItem[];
    reviews?: Review[];
    blogPosts?: BlogPost[];
    whyMiniScenes?: WhyMiniScene[];
    whyMiniContent?: WhyMiniContent;
    logoSettings?: LogoSettings;
  }): Promise<void> {
    console.log('开始迁移网站内容...');
    
    // 迁移各种内容类型
    if (contentData.banners) {
      for (const banner of contentData.banners) {
        await contentAPI.create('banner', banner, banner.order);
      }
      console.log('✅ Banner 数据迁移完成');
    }
    
    if (contentData.features) {
      for (const feature of contentData.features) {
        await contentAPI.create('feature', feature, feature.order);
      }
      console.log('✅ Features 数据迁移完成');
    }
    
    if (contentData.brandStory) {
      await contentAPI.create('brand_story', contentData.brandStory);
      console.log('✅ Brand Story 数据迁移完成');
    }
    
    if (contentData.faqs) {
      for (const faq of contentData.faqs) {
        await contentAPI.create('faq', faq, faq.order);
      }
      console.log('✅ FAQ 数据迁移完成');
    }
    
    console.log('网站内容迁移完成！');
  }
};

// 连接状态检查
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('数据库连接失败:', error);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接检查失败:', error);
    return false;
  }
};