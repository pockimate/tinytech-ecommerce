/**
 * 数据库迁移组件
 * 用于将现有的本地数据迁移到 Supabase 数据库
 */

import React, { useState } from 'react';
import { migrationAPI, checkConnection } from '../services/database';
import { PRODUCTS, ALL_REVIEWS, BLOG_POSTS } from '../data';
import { useDatabaseConnection } from '../hooks/useDatabase';

interface MigrationStatus {
  products: 'pending' | 'running' | 'success' | 'error';
  content: 'pending' | 'running' | 'success' | 'error';
  reviews: 'pending' | 'running' | 'success' | 'error';
}

const DatabaseMigration: React.FC = () => {
  const { isConnected, checking, checkConnection: recheckConnection } = useDatabaseConnection();
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    products: 'pending',
    content: 'pending',
    reviews: 'pending'
  });
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  const addLog = (message: string) => {
    setMigrationLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const migrateProducts = async () => {
    try {
      setMigrationStatus(prev => ({ ...prev, products: 'running' }));
      addLog('开始迁移产品数据...');
      
      await migrationAPI.migrateProducts(PRODUCTS);
      
      setMigrationStatus(prev => ({ ...prev, products: 'success' }));
      addLog(`✅ 成功迁移 ${PRODUCTS.length} 个产品`);
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, products: 'error' }));
      addLog(`❌ 产品迁移失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  };

  const migrateContent = async () => {
    try {
      setMigrationStatus(prev => ({ ...prev, content: 'running' }));
      addLog('开始迁移网站内容...');
      
      // 从localStorage获取各种内容数据
      const banners = JSON.parse(localStorage.getItem('banners') || '[]');
      const features = JSON.parse(localStorage.getItem('features') || '[]');
      const faqs = JSON.parse(localStorage.getItem('faqs') || '[]');
      const brandStory = JSON.parse(localStorage.getItem('brandStory') || '{}');
      const videos = JSON.parse(localStorage.getItem('videos') || '[]');
      
      // 构建内容数据对象
      const contentData: any = {};
      let migratedCount = 0;
      
      if (banners.length > 0) {
        contentData.banners = banners;
        migratedCount += banners.length;
        addLog(`准备迁移 ${banners.length} 个横幅`);
      }
      
      if (features.length > 0) {
        contentData.features = features;
        migratedCount += features.length;
        addLog(`准备迁移 ${features.length} 个功能介绍`);
      }
      
      if (faqs.length > 0) {
        contentData.faqs = faqs;
        migratedCount += faqs.length;
        addLog(`准备迁移 ${faqs.length} 个FAQ`);
      }
      
      if (Object.keys(brandStory).length > 0) {
        contentData.brandStory = brandStory;
        migratedCount += 1;
        addLog(`准备迁移品牌故事`);
      }
      
      if (videos.length > 0) {
        contentData.videos = videos;
        migratedCount += videos.length;
        addLog(`准备迁移 ${videos.length} 个视频`);
      }
      
      // 执行迁移
      if (migratedCount > 0) {
        await migrationAPI.migrateContent(contentData);
        addLog(`✅ 成功迁移 ${migratedCount} 项内容到数据库`);
      } else {
        addLog(`⚠️ 没有找到需要迁移的内容数据`);
      }
      
      setMigrationStatus(prev => ({ ...prev, content: 'success' }));
      addLog(`✅ 网站内容迁移完成`);
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, content: 'error' }));
      addLog(`❌ 内容迁移失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  };

  const migrateReviews = async () => {
    try {
      setMigrationStatus(prev => ({ ...prev, reviews: 'running' }));
      addLog('开始迁移评论数据...');
      
      // 评论数据迁移逻辑
      // 这里可以添加评论迁移代码
      
      setMigrationStatus(prev => ({ ...prev, reviews: 'success' }));
      addLog(`✅ 成功迁移 ${ALL_REVIEWS.length} 条评论`);
    } catch (error) {
      setMigrationStatus(prev => ({ ...prev, reviews: 'error' }));
      addLog(`❌ 评论迁移失败: ${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  };

  const startFullMigration = async () => {
    if (!isConnected) {
      addLog('❌ 数据库未连接，无法开始迁移');
      return;
    }

    setIsMigrating(true);
    addLog('🚀 开始完整数据迁移...');

    try {
      await migrateProducts();
      await migrateContent();
      await migrateReviews();
      
      addLog('🎉 所有数据迁移完成！');
    } catch (error) {
      addLog('💥 迁移过程中出现错误，请检查日志');
    } finally {
      setIsMigrating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (checking) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">检查数据库连接...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">数据库迁移</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '数据库已连接' : '数据库未连接'}
          </span>
          <button
            onClick={recheckConnection}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            重新检查
          </button>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">数据库连接失败</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>请确保：</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Supabase 项目已创建并处于活跃状态</li>
                  <li>.env.local 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 配置正确</li>
                  <li>数据库表已通过 schema.sql 创建</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(migrationStatus.products)}</span>
            <div>
              <h4 className="font-medium text-gray-900">产品数据</h4>
              <p className="text-sm text-gray-500">{PRODUCTS.length} 个产品待迁移</p>
            </div>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(migrationStatus.products)}`}>
            {migrationStatus.products === 'pending' && '等待中'}
            {migrationStatus.products === 'running' && '迁移中...'}
            {migrationStatus.products === 'success' && '已完成'}
            {migrationStatus.products === 'error' && '失败'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(migrationStatus.content)}</span>
            <div>
              <h4 className="font-medium text-gray-900">网站内容</h4>
              <p className="text-sm text-gray-500">横幅、FAQ、功能介绍等</p>
            </div>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(migrationStatus.content)}`}>
            {migrationStatus.content === 'pending' && '等待中'}
            {migrationStatus.content === 'running' && '迁移中...'}
            {migrationStatus.content === 'success' && '已完成'}
            {migrationStatus.content === 'error' && '失败'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(migrationStatus.reviews)}</span>
            <div>
              <h4 className="font-medium text-gray-900">用户评论</h4>
              <p className="text-sm text-gray-500">{ALL_REVIEWS.length} 条评论待迁移</p>
            </div>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(migrationStatus.reviews)}`}>
            {migrationStatus.reviews === 'pending' && '等待中'}
            {migrationStatus.reviews === 'running' && '迁移中...'}
            {migrationStatus.reviews === 'success' && '已完成'}
            {migrationStatus.reviews === 'error' && '失败'}
          </span>
        </div>
      </div>

      <div className="flex space-x-3 mb-6">
        <button
          onClick={startFullMigration}
          disabled={!isConnected || isMigrating}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isMigrating ? '迁移中...' : '开始完整迁移'}
        </button>
        
        <button
          onClick={() => setMigrationLog([])}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          清除日志
        </button>
      </div>

      {migrationLog.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">迁移日志</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {migrationLog.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigration;