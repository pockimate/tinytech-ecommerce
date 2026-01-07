/**
 * 数据库操作 Hook
 * 提供产品、订单、内容的 CRUD 操作
 */

import { useState, useEffect, useCallback } from 'react';
import { productAPI, orderAPI, contentAPI, checkConnection } from '../services/database';
import { Product, Order } from '../types';

// 产品管理 Hook
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载所有产品
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载产品失败');
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建产品
  const createProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productAPI.create(product);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建产品失败');
      throw err;
    }
  }, []);

  // 更新产品
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await productAPI.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新产品失败');
      throw err;
    }
  }, []);

  // 删除产品
  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除产品失败');
      throw err;
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

// 订单管理 Hook
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载所有订单
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载订单失败');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建订单
  const createOrder = useCallback(async (order: Omit<Order, 'id'>) => {
    try {
      const newOrder = await orderAPI.create(order);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败');
      throw err;
    }
  }, []);

  // 更新订单状态
  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedOrder = await orderAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新订单状态失败');
      throw err;
    }
  }, []);

  // 根据 ID 获取订单
  const getOrderById = useCallback(async (id: string) => {
    try {
      return await orderAPI.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取订单失败');
      throw err;
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    loadOrders,
    createOrder,
    updateOrderStatus,
    getOrderById
  };
}

// 网站内容管理 Hook
export function useContent(contentType: string) {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载指定类型的内容
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentAPI.getByType(contentType);
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `加载${contentType}内容失败`);
      console.error(`Failed to load ${contentType} content:`, err);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  // 更新内容
  const updateContent = useCallback(async (id: string, newContent: any) => {
    try {
      await contentAPI.update(id, newContent);
      await loadContent(); // 重新加载内容
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新内容失败');
      throw err;
    }
  }, [loadContent]);

  // 创建内容
  const createContent = useCallback(async (newContent: any, orderIndex: number = 0) => {
    try {
      await contentAPI.create(contentType, newContent, orderIndex);
      await loadContent(); // 重新加载内容
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建内容失败');
      throw err;
    }
  }, [contentType, loadContent]);

  // 初始加载
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    loadContent,
    updateContent,
    createContent
  };
}

// 数据库连接状态 Hook
export function useDatabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const checkDatabaseConnection = useCallback(async () => {
    try {
      setChecking(true);
      const connected = await checkConnection();
      setIsConnected(connected);
    } catch (err) {
      console.error('Database connection check failed:', err);
      setIsConnected(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkDatabaseConnection();
  }, [checkDatabaseConnection]);

  return {
    isConnected,
    checking,
    checkConnection: checkDatabaseConnection
  };
}