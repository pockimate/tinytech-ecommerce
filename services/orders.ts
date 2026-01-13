/**
 * 订单服务 - 与 Supabase 集成
 */

import { supabase } from './database';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  color?: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
}

/**
 * 创建订单
 */
export async function createOrder(
  items: OrderItem[],
  total: number,
  shippingAddress: ShippingAddress,
  paymentMethod: string = 'paypal'
): Promise<{ orderId: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('create_order', {
      p_items: items,
      p_total: total,
      p_shipping_address: shippingAddress,
      p_user_email: shippingAddress.email,
      p_payment_method: paymentMethod
    });

    if (error) {
      console.error('[Orders] Create order error:', error);
      return { orderId: null, error: error.message };
    }

    return { orderId: data, error: null };
  } catch (err: any) {
    console.error('[Orders] Create order exception:', err);
    return { orderId: null, error: err.message || '创建订单失败' };
  }
}

/**
 * 更新订单支付状态
 */
export async function updateOrderPayment(
  orderId: string,
  paypalOrderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('update_order_payment', {
      p_order_id: orderId,
      p_paypal_order_id: paypalOrderId,
      p_payment_status: paymentStatus
    });

    if (error) {
      console.error('[Orders] Update payment error:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('[Orders] Update payment exception:', err);
    return false;
  }
}

/**
 * 获取用户订单历史
 */
export async function getUserOrders(limit: number = 10): Promise<Order[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_orders', {
      p_limit: limit
    });

    if (error) {
      console.error('[Orders] Get orders error:', error);
      return [];
    }

    return (data || []).map((order: any) => ({
      id: order.id,
      items: order.items,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      createdAt: order.created_at
    }));
  } catch (err) {
    console.error('[Orders] Get orders exception:', err);
    return [];
  }
}

/**
 * 合并游客订单到用户账户
 * 在用户登录后调用
 */
export async function mergeGuestOrders(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { data, error } = await supabase.rpc('merge_guest_orders', {
      p_user_id: user.id,
      p_email: user.email
    });

    if (error) {
      console.error('[Orders] Merge orders error:', error);
      return 0;
    }

    const mergedCount = data || 0;
    if (mergedCount > 0) {
      console.log(`[Orders] Merged ${mergedCount} guest orders`);
    }

    return mergedCount;
  } catch (err) {
    console.error('[Orders] Merge orders exception:', err);
    return 0;
  }
}

/**
 * 通过 ID 获取订单详情
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('[Orders] Get order error:', error);
      return null;
    }

    return {
      id: data.id,
      items: data.items,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      shippingAddress: data.shipping_address,
      trackingNumber: data.tracking_number,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('[Orders] Get order exception:', err);
    return null;
  }
}

/**
 * 通过追踪号查询订单
 */
export async function getOrderByTracking(trackingNumber: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) {
      console.error('[Orders] Get order by tracking error:', error);
      return null;
    }

    return {
      id: data.id,
      items: data.items,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      shippingAddress: data.shipping_address,
      trackingNumber: data.tracking_number,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('[Orders] Get order by tracking exception:', err);
    return null;
  }
}

export default {
  createOrder,
  updateOrderPayment,
  getUserOrders,
  mergeGuestOrders,
  getOrderById,
  getOrderByTracking
};
