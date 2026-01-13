import React, { useState } from 'react';
import { Product, Order, User, Banner, Feature, BrandStoryContent, VideoContent, NewsletterContent, SizeComparisonContent, FAQItem, Review, BlogPost, WhyMiniScene, WhyMiniContent, LogoSettings } from '../types';
import { sanitizeUserInput, isValidURL, limitStringLength } from '../utils/security';
import LogoEditor from './LogoEditor';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  users: User[];
  banners?: Banner[];
  features?: Feature[];
  brandStory?: BrandStoryContent;
  videos?: VideoContent[];
  newsletter?: NewsletterContent;
  sizeComparison?: SizeComparisonContent;
  faqs?: FAQItem[];
  homepageReviews?: Review[];
  blogPosts?: BlogPost[];
  whyMiniScenes?: WhyMiniScene[];
  whyMiniContent?: WhyMiniContent;
  logoSettings?: LogoSettings;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdateBanner?: (banner: Banner) => void;
  onDeleteBanner?: (id: string) => void;
  onAddBanner?: (banner: Banner) => void;
  onUpdateFeature?: (feature: Feature) => void;
  onDeleteFeature?: (id: string) => void;
  onAddFeature?: (feature: Feature) => void;
  onUpdateBrandStory?: (content: BrandStoryContent) => void;
  onUpdateVideo?: (video: VideoContent) => void;
  onDeleteVideo?: (id: string) => void;
  onAddVideo?: (video: VideoContent) => void;
  onUpdateNewsletter?: (content: NewsletterContent) => void;
  onUpdateSizeComparison?: (content: SizeComparisonContent) => void;
  onUpdateFAQ?: (faq: FAQItem) => void;
  onDeleteFAQ?: (id: string) => void;
  onAddFAQ?: (faq: FAQItem) => void;
  onUpdateReview?: (review: Review) => void;
  onDeleteReview?: (id: string) => void;
  onAddReview?: (review: Review) => void;
  onUpdateBlogPost?: (post: BlogPost) => void;
  onDeleteBlogPost?: (id: string) => void;
  onAddBlogPost?: (post: BlogPost) => void;
  onUpdateWhyMiniScene?: (scene: WhyMiniScene) => void;
  onDeleteWhyMiniScene?: (id: string) => void;
  onAddWhyMiniScene?: (scene: WhyMiniScene) => void;
  onUpdateWhyMiniContent?: (content: WhyMiniContent) => void;
  onUpdateLogoSettings?: (settings: LogoSettings) => void;
  onNavigate: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  users,
  banners = [],
  features = [],
  brandStory,
  videos = [],
  newsletter,
  sizeComparison,
  faqs = [],
  homepageReviews = [],
  blogPosts = [],
  whyMiniScenes = [],
  whyMiniContent,
  logoSettings = {
    headerLogo: { image: '', text: 'TinyTech', width: 40, height: 40 },
    footerLogo: { image: '', text: 'TinyTech', width: 40, height: 40 }
  },
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onUpdateOrder,
  onUpdateBanner,
  onDeleteBanner,
  onAddBanner,
  onUpdateFeature,
  onDeleteFeature,
  onAddFeature,
  onUpdateBrandStory,
  onUpdateVideo,
  onDeleteVideo,
  onAddVideo,
  onUpdateNewsletter,
  onUpdateSizeComparison,
  onUpdateFAQ,
  onDeleteFAQ,
  onAddFAQ,
  onUpdateReview,
  onDeleteReview,
  onAddReview,
  onUpdateBlogPost,
  onDeleteBlogPost,
  onAddBlogPost,
  onUpdateWhyMiniScene,
  onDeleteWhyMiniScene,
  onAddWhyMiniScene,
  onUpdateWhyMiniContent,
  onUpdateLogoSettings,
  onNavigate
}) => {
  // Helper function to safely get and sanitize form data
  const getFormValue = (formData: FormData, key: string, maxLength: number = 10000): string => {
    const value = formData.get(key) as string;
    return value ? sanitizeUserInput(value, maxLength) : '';
  };

  const getFormValueOptional = (formData: FormData, key: string, maxLength: number = 10000): string | undefined => {
    const value = formData.get(key) as string;
    return value ? sanitizeUserInput(value, maxLength) : undefined;
  };

  const getFormURL = (formData: FormData, key: string): string => {
    const url = formData.get(key) as string;
    if (url && !isValidURL(url)) {
      console.warn(`Invalid URL for ${key}: ${url}`);
      return '';
    }
    return url || '';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'homepage' | 'products' | 'orders' | 'users' | 'reviews' | 'blog' | 'whyMini' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [editingBrandStory, setEditingBrandStory] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoContent | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState(false);
  const [editingSizeComparison, setEditingSizeComparison] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingProductReview, setEditingProductReview] = useState<Review | null>(null);
  const [showAddProductReview, setShowAddProductReview] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [showAddBlogPost, setShowAddBlogPost] = useState(false);
  const [editingWhyMiniScene, setEditingWhyMiniScene] = useState<WhyMiniScene | null>(null);
  const [showAddWhyMiniScene, setShowAddWhyMiniScene] = useState(false);
  const [editingWhyMiniContent, setEditingWhyMiniContent] = useState(false);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [productColors, setProductColors] = useState<any[]>([]);
  const [productBundles, setProductBundles] = useState<any[]>([]);

  // Initialize product reviews, variants, colors and bundles when editing a product
  React.useEffect(() => {
    if (editingProduct) {
      setProductReviews(editingProduct.reviews || []);
      setProductVariants(editingProduct.variants || []);
      setProductColors(editingProduct.colorOptions || []);
      setProductBundles(editingProduct.bundles || []);
    }
  }, [editingProduct]);

  // Stats calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;
  const pendingOrders = orders.filter(o => o.status === 'Processing').length;

  const tabs = [
    { id: 'overview', label: '数据概览', icon: 'fa-chart-line' },
    { id: 'homepage', label: '首页管理', icon: 'fa-home' },
    { id: 'products', label: '商品管理', icon: 'fa-box' },
    { id: 'blog', label: '博客管理', icon: 'fa-blog' },
    { id: 'whymini', label: 'Why Mini', icon: 'fa-lightbulb' },
    { id: 'orders', label: '订单管理', icon: 'fa-shopping-cart' },
    { id: 'users', label: '用户管理', icon: 'fa-users' },
    { id: 'reviews', label: '评价管理', icon: 'fa-star' },
    { id: 'settings', label: '系统设置', icon: 'fa-cog' }
  ];

  const handleProductSubmit = (e: React.FormEvent, product: Partial<Product>) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...product, reviews: productReviews, variants: productVariants, colorOptions: productColors, bundles: productBundles } as Product);
      setEditingProduct(null);
      setProductReviews([]);
      setProductVariants([]);
      setProductColors([]);
      setProductBundles([]);
    } else {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: product.name || '',
        price: product.price || 0,
        image: product.image || '',
        rating: 4.8,
        Review: productReviews,
        variants: productVariants,
        colorOptions: productColors,
        bundles: productBundles,
        stockLevel: product.stockLevel || 10,
        description: product.description
      } as any;
      onAddProduct(newProduct);
      setShowAddProduct(false);
      setProductReviews([]);
      setProductVariants([]);
      setProductColors([]);
      setProductBundles([]);
    }
  };

  const handleBannerSubmit = (e: React.FormEvent, banner: Partial<Banner>) => {
    e.preventDefault();
    if (editingBanner && onUpdateBanner) {
      onUpdateBanner({ ...editingBanner, ...banner } as Banner);
      setEditingBanner(null);
    } else if (onAddBanner) {
      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        buttonText: banner.buttonText || 'Buy Now',
        buttonLink: banner.buttonLink || 'Product',
        backgroundColor: banner.backgroundColor || 'from-indigo-600 to-purple-600',
        order: banner.order || banners.length,
        isActive: banner.isActive ?? true
      };
      onAddBanner(newBanner);
      setShowAddBanner(false);
    }
  };

  const handleFeatureSubmit = (e: React.FormEvent, feature: Partial<Feature>) => {
    e.preventDefault();
    if (editingFeature && onUpdateFeature) {
      onUpdateFeature({ ...editingFeature, ...feature } as Feature);
      setEditingFeature(null);
    } else if (onAddFeature) {
      const newFeature: Feature = {
        id: `feature-${Date.now()}`,
        icon: feature.icon || 'fa-star',
        title: feature.title || '',
        description: feature.description || '',
        order: feature.order || features.length,
        isActive: feature.isActive ?? true
      };
      onAddFeature(newFeature);
      setShowAddFeature(false);
    }
  };

  const handleVideoSubmit = (e: React.FormEvent, video: Partial<VideoContent>) => {
    e.preventDefault();
    if (editingVideo && onUpdateVideo) {
      onUpdateVideo({ ...editingVideo, ...video } as VideoContent);
      setEditingVideo(null);
    } else if (onAddVideo) {
      const newVideo: VideoContent = {
        id: `video-${Date.now()}`,
        title: video.title || '',
        thumbnail: video.thumbnail || '',
        productTag: video.productTag || '',
        views: video.views || '0',
        videoUrl: video.videoUrl,
        order: video.order || videos.length,
        isActive: video.isActive ?? true
      };
      onAddVideo(newVideo);
      setShowAddVideo(false);
    }
  };

  const handleFAQSubmit = (e: React.FormEvent, faq: Partial<FAQItem>) => {
    e.preventDefault();
    if (editingFAQ && onUpdateFAQ) {
      onUpdateFAQ({ ...editingFAQ, ...faq } as FAQItem);
      setEditingFAQ(null);
    } else if (onAddFAQ) {
      const newFAQ: FAQItem = {
        id: `faq-${Date.now()}`,
        icon: faq.icon || 'fa-question-circle',
        question: faq.question || '',
        answer: faq.answer || '',
        order: faq.order || faqs.length,
        isActive: faq.isActive ?? true
      };
      onAddFAQ(newFAQ);
      setShowAddFAQ(false);
    }
  };

  const handleBlogPostSubmit = (e: React.FormEvent, post: Partial<BlogPost>) => {
    e.preventDefault();
    if (editingBlogPost && onUpdateBlogPost) {
      onUpdateBlogPost({ ...editingBlogPost, ...post } as BlogPost);
      setEditingBlogPost(null);
    } else if (onAddBlogPost) {
      const newBlogPost: BlogPost = {
        id: `blog-${Date.now()}`,
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || 'Lifestyle',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        image: post.image || ''
      };
      onAddBlogPost(newBlogPost);
      setShowAddBlogPost(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent, review: Partial<Review>) => {
    e.preventDefault();
    if (editingReview && onUpdateReview) {
      onUpdateReview({ ...editingReview, ...review } as Review);
      setEditingReview(null);
    } else if (onAddReview) {
      const newReview: Review = {
        id: `review-${Date.now()}`,
        user: review.user || '',
        rating: review.rating || 5,
        comment: review.comment || '',
        date: review.date || 'Just now',
        reviewImages: review.reviewImages || []
      };
      onAddReview(newReview);
      setShowAddReview(false);
    }
  };

  const handleWhyMiniSceneSubmit = (e: React.FormEvent, scene: Partial<WhyMiniScene>) => {
    e.preventDefault();
    if (editingWhyMiniScene && onUpdateWhyMiniScene) {
      onUpdateWhyMiniScene({ ...editingWhyMiniScene, ...scene } as WhyMiniScene);
      setEditingWhyMiniScene(null);
    } else if (onAddWhyMiniScene) {
      const newScene: WhyMiniScene = {
        id: `scene-${Date.now()}`,
        tag: scene.tag || '',
        tagColor: scene.tagColor || 'indigo',
        title: scene.title || '',
        description: scene.description || '',
        image: scene.image || '',
        benefits: scene.benefits || ['', '', ''],
        order: scene.order || whyMiniScenes.length,
        isActive: scene.isActive ?? true
      };
      onAddWhyMiniScene(newScene);
      setShowAddWhyMiniScene(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">管理后台</h1>
              <p className="text-gray-500 font-medium mt-2">Manage Your E-commerce Platform</p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="hidden sm:inline">返回网站</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-euro-sign text-green-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-bold text-green-600">+12%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">${totalRevenue.toFixed(0)}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">总收入</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-shopping-cart text-blue-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-bold text-blue-600">+8%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{totalOrders}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">总订单</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-User text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-bold text-purple-600">+15%</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{totalUsers}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">注册用户</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-clock text-orange-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-bold text-orange-600">{pendingOrders}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900">{totalProducts}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">在售商品</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">最近订单</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">订单号</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">客户</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Total</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={ order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 font-bold text-sm text-gray-900">{ order.id}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{ (order.address || '').split(',')[0]}</td>
                        <td className="py-3 px-2 font-black text-sm text-gray-900">${ order.total.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            { order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Homepage Management Tab */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Homepage Section Management</h2>
            </div>

            {/* Banner Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">轮播图管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Recommended size: <span className="font-bold text-indigo-600">1400×600px</span> or higher resolution, ratio <span className="font-bold text-indigo-600">7:3</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBanner(true)}
                  className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Banner
                </button>
              </div>

              <div className="space-y-4">
                {[...banners].sort((a, b) => a.order - b.order).map((banner, index) => (
                  <div key={banner.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-600 transition-all">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Banner Preview */}
                      <div className="lg:w-1/3">
                        <div className={`aspect-[7/3] rounded-xl overflow-hidden bg-gradient-to-r ${banner.backgroundColor || 'from-gray-400 to-gray-600'}`}>
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {banner.isActive ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            order: {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Banner Info */}
                      <div className="lg:w-2/3 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-black text-gray-900 mb-2">{banner.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                              <i className="fa-solid fa-link"></i>
                              <span>Button: {banner.buttonText}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <i className="fa-solid fa-arrow-pointer"></i>
                              <span>Link: {banner.buttonLink}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <i className="fa-solid fa-palette"></i>
                              <span>Background: {(banner.backgroundColor || '').split(' ')[0].replace('from-', '')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <i className="fa-solid fa-image"></i>
                              <span>image: {(banner.image || '').length > 40 ? (banner.image || '').substring(0, 40) + '...' : (banner.image || '')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => {
                              if (onUpdateBanner) {
                                onUpdateBanner({ ...banner, isActive: !banner.isActive });
                              }
                            }}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                              banner.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <i className={`fa-solid ${banner.isActive ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                            {banner.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => {
                              if (index > 0 && onUpdateBanner) {
                                const prevBanner = banners[index - 1];
                                onUpdateBanner({ ...banner, order: prevBanner.order });
                                onUpdateBanner({ ...prevBanner, order: banner.order });
                              }
                            }}
                            disabled={index === 0}
                            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all opacity-50 cursor-not-allowed"
                          >
                            <i className="fa-solid fa-arrow-up mr-1"></i>
                            Move Up
                          </button>
                          <button
                            onClick={() => {
                              if (index < banners.length - 1 && onUpdateBanner) {
                                const nextBanner = banners[index + 1];
                                onUpdateBanner({ ...banner, order: nextBanner.order });
                                onUpdateBanner({ ...nextBanner, order: banner.order });
                              }
                            }}
                            disabled={index === banners.length - 1}
                            className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all opacity-50 cursor-not-allowed"
                          >
                            <i className="fa-solid fa-arrow-down mr-1"></i>
                            Move Down
                          </button>
                          <button
                            onClick={() => setEditingBanner(banner)}
                            className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-all"
                          >
                            <i className="fa-solid fa-edit mr-1"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteBanner && confirm('Are you sure you want to delete this banner?')) {
                                onDeleteBanner(banner.id);
                              }
                            }}
                            className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-all"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {banners.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fa-solid fa-image text-4xl mb-4 opacity-50"></i>
                    <p className="font-bold">No banners yet</p>
                    <p className="text-sm">Click the "Add Banner" button above to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Other Homepage Sections */}
            
            {/* Features Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Features Management</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    These features will be displayed at the top
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFeature(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add Feature
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...features].sort((a, b) => a.order - b.order).map((feature, index) => (
                  <div key={feature.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-600 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        feature.isActive ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        <i className={`fa-solid ${feature.icon} text-xl ${
                          feature.isActive ? 'text-indigo-600' : 'text-gray-400'
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            feature.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {feature.isActive ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            order: {index + 1}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (onUpdateFeature) {
                                onUpdateFeature({ ...feature, isActive: !feature.isActive });
                              }
                            }}
                            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              feature.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {feature.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setEditingFeature(feature)}
                            className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteFeature && confirm('Are you sure you want to delete this?')) {
                                onDeleteFeature(feature.id);
                              }
                            }}
                            className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Story Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Brand Story Management</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Recommended size: <span className="font-bold text-indigo-600">3:4 ratio 600×800px</span>, <span className="font-bold text-indigo-600">square 600×600px</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingBrandStory(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-edit"></i>
                  Edit Content
                </button>
              </div>

              {brandStory && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Current Content</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Subtitle：</strong>{brandStory.subtitle}</p>
                      <p><strong>Title:</strong>{(brandStory.title || '').replace('\n', ' ')}</p>
                      <p><strong>Description:</strong>{(brandStory.description || '').substring(0, 80)}...</p>
                      <p><strong>Badge：</strong>{brandStory.badgeText1} / {brandStory.badgeText2}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">Product Images Preview</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <img src={brandStory.image1} alt="Product 1" className="w-full h-24 object-cover rounded-lg border-2 border-indigo-200" />
                      <img src={brandStory.image3} alt="Product 3" className="w-full h-24 object-cover rounded-lg border-2 border-indigo-200" />
                      <img src={brandStory.image2} alt="Product 2" className="w-full h-20 object-cover rounded-lg border-2 border-indigo-200" />
                      <img src={brandStory.image4} alt="Product 4" className="w-full h-20 object-cover rounded-lg border-2 border-indigo-200" />
                    </div>
                    <h4 className="font-bold text-gray-700 mb-2">Statistics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-black text-indigo-600">{brandStory.stat1Value}</div>
                        <div className="text-xs text-gray-600">{brandStory.stat1Label}</div>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-black text-indigo-600">{brandStory.stat2Value}</div>
                        <div className="text-xs text-gray-600">{brandStory.stat2Label}</div>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="text-xl font-black text-indigo-600">{brandStory.stat3Value}</div>
                        <div className="text-xs text-gray-600">{brandStory.stat3Label}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Showcase Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">视频展示管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Recommended thumbnail size：<span className="font-bold text-indigo-600">600×800px</span>, ratio <span className="font-bold text-indigo-600">3:4</span>(竖屏视频)
                  </p>
                </div>
                <button
                  onClick={() => setShowAddVideo(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  添加视频
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...videos].sort((a, b) => a.order - b.order).map((video, index) => (
                  <div key={video.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-600 transition-all">
                    <div className="aspect-[9/16] bg-gray-100 relative">
                      <img src={video.thumbnail} className="w-full h-full object-cover" alt={video.title} />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          video.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {video.isActive ? '启用' : '禁用'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-1">
                          {video.productTag}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">{video.title}</h4>
                      <p className="text-xs text-gray-500 mb-3">
                        <i className="fa-solid fa-eye mr-1"></i>{video.views} views
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (onUpdateVideo) {
                              onUpdateVideo({ ...video, isActive: !video.isActive });
                            }
                          }}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            video.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {video.isActive ? '禁用' : '启用'}
                        </button>
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteVideo && confirm('确定要删除吗 this?')) {
                              onDeleteVideo(video.id);
                            }
                          }}
                          className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Newsletter 订阅区管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Customize Newsletter subscription area
                  </p>
                </div>
                <button
                  onClick={() => setEditingNewsletter(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-edit"></i>
                  编辑内容
                </button>
              </div>

              {newsletter && (
                <div className={`p-6 rounded-xl bg-gradient-to-br ${newsletter.backgroundColor} text-white`}>
                  <div className="text-center">
                    <i className={`fa-solid ${newsletter.icon} text-4xl mb-4 opacity-80`}></i>
                    <h4 className="text-2xl font-black mb-2">{newsletter.title}</h4>
                    <p className="text-white/90 mb-4">
                      {newsletter.description.replace('{discount}', newsletter.discountText)}
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <input
                        type="邮箱"
                        placeholder={newsletter.placeholderText}
                        className="flex-1 px-4 py-2 rounded-lg text-gray-900"
                        已禁用
                      />
                      <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold whitespace-nowrap">
                        {newsletter.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Size Comparison Management Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">尺寸对比区管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Show product comparison
                  </p>
                </div>
                <button
                  onClick={() => setEditingSizeComparison(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-edit"></i>
                  编辑内容
                </button>
              </div>

              {sizeComparison && (
                <div className={`p-6 rounded-xl ${sizeComparison.backgroundColor} text-white`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-2xl font-black mb-3">{sizeComparison.title}</h4>
                      <p className="text-white/80 mb-4">{sizeComparison.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            <i className={`fa-solid ${sizeComparison.feature1Icon}`}></i>
                          </div>
                          <div>
                            <div className="font-bold">{sizeComparison.feature1Title}</div>
                            <div className="text-sm text-white/70">{sizeComparison.feature1描述}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            <i className={`fa-solid ${sizeComparison.feature2Icon}`}></i>
                          </div>
                          <div>
                            <div className="font-bold">{sizeComparison.feature2Title}</div>
                            <div className="text-sm text-white/70">{sizeComparison.feature2描述}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <i className="fa-solid fa-mobile-screen text-6xl mb-3 opacity-50"></i>
                        <p className="text-sm text-white/60">Size comparison visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 常见问题管理 Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">常见问题管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    Manage FAQs displayed on homepage
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFAQ(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  添加问题
                </button>
              </div>

              <div className="space-y-3">
                {[...faqs].sort((a, b) => a.order - b.order).map((faq, index) => (
                  <div key={faq.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-600 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        faq.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <i className={`fa-solid ${faq.icon}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{faq.question}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {faq.isActive ? '启用' : '禁用'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (onUpdateFAQ) {
                                onUpdateFAQ({ ...faq, isActive: !faq.isActive });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                              faq.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {faq.isActive ? '禁用' : '启用'}
                          </button>
                          <button
                            onClick={() => {
                              if (index > 0 && onUpdateFAQ) {
                                const prevFAQ = faqs[index - 1];
                                onUpdateFAQ({ ...faq, order: prevFAQ.order });
                                onUpdateFAQ({ ...prevFAQ, order: faq.order });
                              }
                            }}
                            disabled={index === 0}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-200 transition-all opacity-50 cursor-not-allowed"
                          >
                            <i className="fa-solid fa-arrow-up"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (index < faqs.length - 1 && onUpdateFAQ) {
                                const nextFAQ = faqs[index + 1];
                                onUpdateFAQ({ ...faq, order: nextFAQ.order });
                                onUpdateFAQ({ ...nextFAQ, order: faq.order });
                              }
                            }}
                            disabled={index === faqs.length - 1}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-200 transition-all opacity-50 cursor-not-allowed"
                          >
                            <i className="fa-solid fa-arrow-down"></i>
                          </button>
                          <button
                            onClick={() => setEditingFAQ(faq)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              if (onDeleteFAQ && confirm('确定要删除吗 this?')) {
                                onDeleteFAQ(faq.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">产品管理</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                添加Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-50 mb-4">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <h3 className="font-black text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-black text-gray-900">${product.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.stockLevel > 10 ? 'bg-green-100 text-green-700' :
                      product.stockLevel > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Stock: {product.stockLevel}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 bg-gray-100 text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                      <i className="fa-solid fa-edit mr-1"></i>
                      编辑
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-all"
                    >
                      <i className="fa-solid fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">订单管理</h2>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={ order.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-600 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="font-black text-gray-900">{ order.id}</p>
                        <p className="text-sm text-gray-500">{ order.date}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrder({ ...order, status: e.target.value as any })}
                        className="px-4 py-2 rounded-lg border-2 border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      >
                        <option value="Processing">处理中</option>
                        <option value="Shipped">已发货</option>
                        <option value="Delivered">已送达</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      { order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">{item.name}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-black">${item.price}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="font-black text-lg">Totale: ${ order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{ order.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">用户管理</h2>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">name</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">邮箱</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Number of Orders</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">总消费</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.邮箱} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 font-bold text-sm text-gray-900">{user.name}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{user.邮箱}</td>
                        <td className="py-3 px-2 font-bold text-sm text-gray-900">{user.orders.length}</td>
                        <td className="py-3 px-2 font-black text-sm text-gray-900">
                          ${user.orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">首页评价管理</h2>
              <button
                onClick={() => setShowAddReview(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                添加评价
              </button>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-6">
                <i className="fa-solid fa-info-circle mr-1"></i>
                RecommendedReviewImageSize：<span className="font-bold text-indigo-600">600×800px</span>, ratio <span className="font-bold text-indigo-600">3:4</span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homepageReviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-600 transition-all">
                    {review.reviewImages && review.reviewImages[0] && (
                      <div className="aspect-[3/4] bg-gray-100">
                        <img 
                          src={review.reviewImages[0]} 
                          className="w-full h-full object-cover" 
                          alt={review.user}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900">{review.user}</h4>
                          <div className="flex gap-0.5 text-yellow-400 text-xs">
                            {[...Array(review.rating)].map((_, i) => (
                              <i key={i} className="fa-solid fa-star"></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-3">{review.comment}</p>
                      <p className="text-xs text-gray-400 mb-3">{review.date}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingReview(review)}
                          className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteReview && confirm('确定要删除吗 this review?')) {
                              onDeleteReview(review.id);
                            }
                          }}
                          className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Blog管理</h2>
              <button
                onClick={() => setShowAddBlogPost(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                添加Blog文章
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-indigo-600 transition-all">
                  <div className="aspect-video bg-gray-100 relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {post.date}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingBlogPost(post)}
                        className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          if (onDeleteBlogPost && confirm('确定要删除这篇文章吗?')) {
                            onDeleteBlogPost(post.id);
                          }
                        }}
                        className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Mini Tab */}
        {activeTab === 'whymini' && (
          <div className="space-y-6">
            {/* Page Content Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">页面内容设置</h2>
                <button
                  onClick={() => setEditingWhyMiniContent(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-edit"></i>
                  编辑页面内容
                </button>
              </div>
              {whyMiniContent && (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-bold text-gray-700">页面标题：</span>
                    <span className="text-gray-600">{whyMiniContent.pageTitle}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">页面副标题：</span>
                    <span className="text-gray-600">{whyMiniContent.pageSubtitle}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">CTA标题：</span>
                    <span className="text-gray-600">{whyMiniContent.ctaTitle}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">CTA描述：</span>
                    <span className="text-gray-600">{whyMiniContent.ctaDescription}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">CTA按钮文字：</span>
                    <span className="text-gray-600">{whyMiniContent.ctaButtonText}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scenes Management */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">使用场景管理</h2>
              <button
                onClick={() => setShowAddWhyMiniScene(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                添加场景
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...whyMiniScenes]
                .sort((a, b) => a.order - b.order)
                .map(scene => (
                  <div key={scene.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:border-indigo-600 transition-all">
                    <div className="aspect-video bg-gray-100 relative">
                      <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          scene.tagColor === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                          scene.tagColor === 'purple' ? 'bg-purple-100 text-purple-600' :
                          scene.tagColor === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {scene.tag}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          scene.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {scene.isActive ? '已启用' : '已禁用'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">排序: {scene.order}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{scene.title}</h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{scene.description}</p>
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-700 mb-1">优势特点：</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {scene.benefits.map((benefit, i) => (
                            <li key={i} className="line-clamp-1">• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingWhyMiniScene(scene)}
                          className="flex-1 bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-200 transition-all"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteWhyMiniScene && confirm('确定要删除这个场景吗?')) {
                              onDeleteWhyMiniScene(scene.id);
                            }
                          }}
                          className="flex-1 bg-red-100 text-red-700 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 transition-all"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900">系统设置</h2>
            <LogoEditor logoSettings={logoSettings} onUpdate={onUpdateLogoSettings || ((settings: LogoSettings) => { console.warn('onUpdateLogoSettings not provided'); })} />
          </div>
        )}
      </div>

      {/* Product Edit/Add Modal */}
      {(editingProduct || showAddProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingProduct ? '编辑Product' : '添加Product'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddProduct(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              const imagesStr = getFormValueOptional(formData, 'images', 5000);
              const detailImagesStr = getFormValueOptional(formData, 'detailImages', 5000);
              
              // Validate URLs
              const mainImage = getFormURL(formData, '图片');
              if (!mainImage) {
                e.preventDefault();
                alert('请输入有效的主图片URL');
                return;
              }

              handleProductSubmit(e, {
                name: getFormValue(formData, 'name', 200),
                price: Number(formData.get('price')),
                originalprice: formData.get('originalprice') ? Number(formData.get('originalprice')) : undefined,
                image: mainImage,
                images: imagesStr ? imagesStr.split('\n').filter(url => url.trim() && isValidURL(url.trim())) : undefined,
                detailImages: detailImagesStr ? detailImagesStr.split('\n').filter(url => url.trim() && isValidURL(url.trim())) : undefined,
                stockLevel: Number(formData.get('stockLevel')),
                description: getFormValueOptional(formData, '描述', 500),
                fulldescription: getFormValueOptional(formData, 'full描述', 10000),
                badge: getFormValueOptional(formData, 'badge', 50)
              } as any);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingProduct?.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Main Cover 图片 URL
                    <span className="text-xs text-gray-500 ml-2">(Recommended 600×750px 或 800×1000px, ratio 4:5)</span>
                  </label>
                  <input
                    name="图片"
                    type="text"
                    defaultValue={editingProduct?.image}
                    placeholder="https://example.com/图片.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  {editingProduct?.image && (
                    <div className="mt-2 aspect-[4/5] w-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={editingProduct.image} className="w-full h-full object-cover" alt="预览" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Display Images URLs
                    <span className="text-xs text-gray-500 ml-2">(One URL per line, for product detail page carousel)</span>
                  </label>
                  <textarea
                    name="images"
                    defaultValue={editingProduct?.images?.join('\n') || ''}
                    rows={4}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">📐 推荐尺寸: 800×800px (square), 推荐添加 3-6 张不同角度的产品图</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Detail Images URLs
                    <span className="text-xs text-gray-500 ml-2">(One URL per line, for detailed 描述 display)</span>
                  </label>
                  <textarea
                    name="detailImages"
                    defaultValue={editingProduct?.detailImages?.join('\n') || ''}
                    rows={6}
                    placeholder="https://example.com/detail1.jpg&#10;https://example.com/detail2.jpg&#10;https://example.com/detail3.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">📐 推荐尺寸: 1200×800px (ratio 3:2), 这些Image将在Product描述中展示, recommended包含功能说明、使用场景etc</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current price ($)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Original price ($) <span className="text-xs text-gray-500">Optional</span></label>
                    <input
                      name="originalprice"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.originalprice}
                      placeholder="For displaying discounts"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">库存数量</label>
                    <input
                      name="stockLevel"
                      type="number"
                      defaultValue={editingProduct?.stockLevel || 10}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Badge Label <span className="text-xs text-gray-500">Optional</span></label>
                    <input
                      name="badge"
                      type="text"
                      defaultValue={editingProduct?.badge}
                      placeholder="e.g., HOT, NEW, 限时优惠"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Short 描述</label>
                  <textarea
                    name="描述"
                    defaultValue={editingProduct?.description}
                    rows={2}
                    placeholder="Product卖点简述, 显示在Product卡片..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full 描述</label>
                  <textarea
                    name="full描述"
                    defaultValue={editingProduct?.full描述}
                    rows={5}
                    placeholder="Product详细介绍, 支持换行描述Product特性、使用场景etc..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                {/* Color Options Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Color Options Management</h4>
                      <p className="text-sm text-gray-500 mt-1">Add 不同颜色，每个颜色需要一张图片</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newColor = {
                          name: '新颜色',
                          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=100'
                        };
                        setProductColors(prev => [...prev, newColor]);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      添加颜色
                    </button>
                  </div>

                  {productColors.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <i className="fa-solid fa-palette text-gray-400 text-3xl mb-2"></i>
                      <p className="text-gray-500 text-sm">No颜色选项, Click the按钮 to add</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {productColors.map((color, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                              <img src={color.image} className="w-full h-full object-cover" alt={color.name} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={color.name}
                                onChange={(e) => {
                                  const newColors = [...productColors];
                                  newColors[index].name = e.target.value;
                                  setProductColors(newColors);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                                placeholder="Color name"
                              />
                              <input
                                type="text"
                                value={color.image}
                                onChange={(e) => {
                                  const newColors = [...productColors];
                                  newColors[index].image = e.target.value;
                                  setProductColors(newColors);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-xs"
                                placeholder="ImageURL"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setProductColors(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            <i className="fa-solid fa-info-circle mr-1"></i>
                            推荐尺寸: 100×100px(square)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Variants Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Product Variant Management</h4>
                      <p className="text-sm text-gray-500 mt-1">add不同规格选项(e.g.capacity、Size、颜色etc)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVariant = {
                          type: 'storage',
                          label: 'Storage Capacity',
                          options: [
                            { id: `opt-${Date.now()}-1`, name: '64GB', price: 0, inStock: true }
                          ]
                        };
                        setProductVariants(prev => [...prev, newVariant]);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      addVariant Type
                    </button>
                  </div>

                  {productVariants.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <i className="fa-solid fa-boxes-stacked text-gray-400 text-3xl mb-2"></i>
                      <p className="text-gray-500 text-sm">暂无变体, 点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productVariants.map((variant, vIndex) => (
                        <div key={vIndex} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Variant Type</label>
                              <select
                                value={variant.type}
                                onChange={(e) => {
                                  const newVariants = [...productVariants];
                                  newVariants[vIndex].type = e.target.value;
                                  const labels: any = {
                                    storage: 'Storage Capacity',
                                    memory: 'Memory',
                                    size: 'Size',
                                    band: 'Band',
                                    custom: 'Custom'
                                  };
                                  newVariants[vIndex].label = labels[e.target.value] || e.target.value;
                                  setProductVariants(newVariants);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="storage">Storage Capacity</option>
                                <option value="memory">Memory</option>
                                <option value="size">Size</option>
                                <option value="band">Band</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Display name</label>
                              <input
                                type="text"
                                value={variant.label}
                                onChange={(e) => {
                                  const newVariants = [...productVariants];
                                  newVariants[vIndex].label = e.target.value;
                                  setProductVariants(newVariants);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., Storage Capacity"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setProductVariants(prev => prev.filter((_, i) => i !== vIndex))}
                              className="self-end text-red-600 hover:text-red-700 px-3 py-2"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-700">Options List</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newVariants = [...productVariants];
                                  newVariants[vIndex].options.push({
                                    id: `opt-${Date.now()}`,
                                    name: 'New Option',
                                    price: 0,
                                    inStock: true
                                  });
                                  setProductVariants(newVariants);
                                }}
                                className="text-purple-600 hover:text-purple-700 text-xs font-bold"
                              >
                                <i className="fa-solid fa-plus mr-1"></i>添加选项
                              </button>
                            </div>
                            {variant.options.map((option: any, oIndex: number) => (
                              <div key={oIndex} className="bg-white rounded-lg p-3 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option.name}
                                  onChange={(e) => {
                                    const newVariants = [...productVariants];
                                    newVariants[vIndex].options[oIndex].name = e.target.value;
                                    setProductVariants(newVariants);
                                  }}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-purple-500"
                                  placeholder="Option name"
                                />
                                <input
                                  type="number"
                                  value={option.price}
                                  onChange={(e) => {
                                    const newVariants = [...productVariants];
                                    newVariants[vIndex].options[oIndex].price = Number(e.target.value);
                                    setProductVariants(newVariants);
                                  }}
                                  className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-purple-500"
                                  placeholder="Additional price"
                                />
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={option.inStock}
                                    onChange={(e) => {
                                      const newVariants = [...productVariants];
                                      newVariants[vIndex].options[oIndex].inStock = e.target.checked;
                                      setProductVariants(newVariants);
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-gray-600">In Stock</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVariants = [...productVariants];
                                    newVariants[vIndex].options = newVariants[vIndex].options.filter((_: any, i: number) => i !== oIndex);
                                    setProductVariants(newVariants);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <i className="fa-solid fa-times"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bundle Packages Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Promotional 套餐管理</h4>
                      <p className="text-sm text-gray-500 mt-1">设置不同Quantityof优惠套餐(e.g., single、double packetc)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProductBundles(prev => [...prev, {
                          id: `bundle-${Date.now()}`,
                          name: 'New Bundle',
                          count: 1,
                          price: 0,
                          originalprice: 0,
                          savingsLabel: 'Save 0%',
                          isPopular: false
                        }]);
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      添加套餐
                    </button>
                  </div>

                  {productBundles.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <i className="fa-solid fa-gift text-gray-400 text-3xl mb-2"></i>
                      <p className="text-gray-500 text-sm">暂无套餐, 点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productBundles.map((bundle, index) => (
                        <div key={bundle.id || index} className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-4 border-2 border-orange-200">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Bundle name</label>
                              <input
                                type="text"
                                value={bundle.name}
                                onChange={(e) => {
                                  const newBundles = [...productBundles];
                                  newBundles[index].name = e.target.value;
                                  setProductBundles(newBundles);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 text-sm"
                                placeholder="e.g., Single, Duo"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={bundle.count}
                                onChange={(e) => {
                                  const newBundles = [...productBundles];
                                  newBundles[index].count = Number(e.target.value);
                                  setProductBundles(newBundles);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 text-sm"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Current price ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={bundle.price}
                                onChange={(e) => {
                                  const newBundles = [...productBundles];
                                  newBundles[index].price = Number(e.target.value);
                                  // Auto calculate savings label
                                  const price = Number(e.target.value);
                                  const original = bundle.originalprice;
                                  if (original > 0 && price < original) {
                                    const percentage = Math.round(((original - price) / original) * 100);
                                    newBundles[index].savingsLabel = `Save ${percentage}%`;
                                  }
                                  setProductBundles(newBundles);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Original price ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={bundle.originalprice}
                                onChange={(e) => {
                                  const newBundles = [...productBundles];
                                  newBundles[index].originalprice = Number(e.target.value);
                                  // Auto calculate savings label
                                  const price = bundle.price;
                                  const original = Number(e.target.value);
                                  if (original > 0 && price < original) {
                                    const percentage = Math.round(((original - price) / original) * 100);
                                    newBundles[index].savingsLabel = `Save ${percentage}%`;
                                  }
                                  setProductBundles(newBundles);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">保存</label>
                              <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm font-bold text-green-700">
                                {(() => {
                                  const price = bundle.price;
                                  const original = bundle.originalprice;
                                  if (original > 0 && price < original) {
                                    const percentage = Math.round(((original - price) / original) * 100);
                                    return `${percentage}% ($${(original - price).toFixed(2)})`;
                                  }
                                  return '0%';
                                })()}
                              </div>
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bundle.isPopular}
                                  onChange={(e) => {
                                    const newBundles = [...productBundles];
                                    newBundles[index].isPopular = e.target.checked;
                                    setProductBundles(newBundles);
                                  }}
                                  className="rounded w-4 h-4"
                                />
                                <span className="text-orange-700">🔥 Most Popular</span>
                              </label>
                            </div>
                          </div>
                          
                          {/* Includes Section */}
                          <div className="mt-3 border-t pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-gray-700">Bundle Includes (one item per line)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newBundles = [...productBundles];
                                  if (!newBundles[index].includes) {
                                    newBundles[index].includes = [];
                                  }
                                  newBundles[index].includes.push('New Item');
                                  setProductBundles(newBundles);
                                }}
                                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold"
                              >
                                <i className="fa-solid fa-plus mr-1"></i>添加物品
                              </button>
                            </div>
                            {bundle.includes && bundle.includes.length > 0 ? (
                              <div className="space-y-2">
                                {bundle.includes.map((item: string, iIndex: number) => (
                                  <div key={iIndex} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newBundles = [...productBundles];
                                        newBundles[index].includes[iIndex] = e.target.value;
                                        setProductBundles(newBundles);
                                      }}
                                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                      placeholder="e.g., Custodia in Silicone ($19)"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newBundles = [...productBundles];
                                        newBundles[index].includes = newBundles[index].includes.filter((_: string, i: number) => i !== iIndex);
                                        setProductBundles(newBundles);
                                      }}
                                      className="text-red-600 hover:text-red-700 p-2"
                                    >
                                      <i className="fa-solid fa-times"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No items yet, 点击上方按钮添加</p>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('确定要删除吗 this bundle?')) {
                                  setProductBundles(prev => prev.filter((_, i) => i !== index));
                                }
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-bold"
                            >
                              <i className="fa-solid fa-trash mr-1"></i>Delete Bundle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Review Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Product Review Management</h4>
                      <p className="text-sm text-gray-500 mt-1">Manage user Review for this product</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddProductReview(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-plus"></i>
                      添加Review
                    </button>
                  </div>

                  {productReviews.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <i className="fa-solid fa-comment-slash text-gray-400 text-3xl mb-2"></i>
                      <p className="text-gray-500 text-sm">暂无Review, 点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {productReviews.map((review, index) => (
                        <div key={review.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0">
                              {review.user.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-bold text-gray-900">{review.user}</h5>
                                <div className="flex gap-0.5 text-yellow-400 text-sm">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <i key={i} className="fa-solid fa-star"></i>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{review.date}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingProductReview(review)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-bold"
                                  >
                                    <i className="fa-solid fa-edit mr-1"></i>编辑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('确定要删除吗 this review?')) {
                                        setProductReviews(prev => prev.filter(r => r.id !== review.id));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 text-xs font-bold"
                                  >
                                    <i className="fa-solid fa-trash mr-1"></i>Delete
                                  </button>
                                </div>
                              </div>
                              {review.reviewImages && review.reviewImages.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {review.reviewImages.slice(0, 3).map((img, i) => (
                                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                                      <img src={img} className="w-full h-full object-cover" alt="Review 图片" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowAddProduct(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingProduct ? '保存修改' : '添加Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Edit/Add Modal */}
      {(editingBanner || showAddBanner) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingBanner ? '编辑轮播图' : '添加轮播图'}
              </h3>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setShowAddBanner(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            {/* 图片 Size Recommendation */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-lightbulb text-white"></i>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">图片 Size Recommendations</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li><i className="fa-solid fa-check mr-2"></i><strong>推荐尺寸: </strong>1400×600px or higher(e.g. 2800×1200px)</li>
                    <li><i className="fa-solid fa-check mr-2"></i><strong>Aspect ratio：</strong>7:3(width more than double the height)</li>
                    <li><i className="fa-solid fa-check mr-2"></i><strong>File format：</strong>JPG 或 PNG, recommended JPG for smaller file size</li>
                    <li><i className="fa-solid fa-check mr-2"></i><strong>File size：</strong>Recommended under 500KB, for fast loading</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              handleBannerSubmit(e, {
                title: formData.get('标题') as string,
                subtitle: formData.get('subtitle') as string,
                image: formData.get('图片') as string,
                buttonText: formData.get('按钮Text') as string,
                buttonLink: formData.get('按钮跳转') as string,
                backgroundColor: formData.get('backgroundColor') as string,
                order: Number(formData.get('Order')),
                isActive: formData.get('isActive') === 'true'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Banner 标题</label>
                  <input
                    name="标题"
                    type="text"
                    defaultValue={editingBanner?.title}
                    placeholder="e.g.,, TinyTalk Pro S1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle描述</label>
                  <textarea
                    name="subtitle"
                    defaultValue={editingBanner?.subtitle}
                    placeholder="e.g.,, Il più piccolo smartphone flagship al mondo..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    图片 URL
                    <span className="text-xs text-indigo-600 ml-2 font-semibold">📐 Recommended 1920×960px 或 1400×700px (ratio 2:1 horizontal)</span>
                  </label>
                  <input
                    name="图片"
                    type="text"
                    defaultValue={editingBanner?.image}
                    placeholder="https://images.unsplash.com/photo-xxxxx?auto=format&fit=crop&q=80&w=1400"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  {editingBanner?.image && (
                    <div className="mt-3 aspect-[7/3] rounded-xl overflow-hidden border border-gray-200">
                      <img src={editingBanner.image} className="w-full h-full object-cover" alt="预览" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    <i className="fa-solid fa-info-circle mr-1"></i>
                    You can use Unsplash、自己上传ofImage或其他Image链接
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">按钮文字</label>
                    <input
                      name="按钮Text"
                      type="text"
                      defaultValue={editingBanner?.buttonText || '立即购买'}
                      placeholder="立即购买"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">跳转链接</label>
                    <input
                      name="按钮跳转"
                      type="text"
                      defaultValue={editingBanner?.buttonLink || 'Product'}
                      placeholder="Product"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">背景渐变色</label>
                  <select
                    name="背景色Color"
                    defaultValue={editingBanner?.backgroundColor || 'from-indigo-600 to-purple-600'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="from-indigo-600 to-purple-600">靛紫渐变 (Indigo → Purple)</option>
                    <option value="from-blue-600 to-cyan-600">蓝青渐变 (Blue → Cyan)</option>
                    <option value="from-rose-600 to-pink-600">玫瑰渐变 (Rose → Pink)</option>
                    <option value="from-green-600 to-emerald-600">绿翠渐变 (Green → Emerald)</option>
                    <option value="from-orange-600 to-red-600">橙红渐变 (Orange → Red)</option>
                    <option value="from-purple-600 to-pink-600">紫粉渐变 (Purple → Pink)</option>
                    <option value="from-gray-900 to-gray-700">深灰渐变 (Dark Gray)</option>
                  </select>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {[
                      'from-indigo-600 to-purple-600',
                      'from-blue-600 to-cyan-600',
                      'from-rose-600 to-pink-600',
                      'from-green-600 to-emerald-600',
                      'from-orange-600 to-red-600',
                      'from-purple-600 to-pink-600',
                      'from-gray-900 to-gray-700'
                    ].map(color => (
                      <div
                        key={color}
                        className={`h-8 rounded-lg bg-gradient-to-r ${color} cursor-pointer border-2 ${
                          editingBanner?.backgroundColor === color ? 'border-gray-900' : 'border-transparent'
                        }`}
                        onClick={() => {
                          const select = document.querySelector('select[name="背景色Color"]') as HTMLSelectElement;
                          if (select) select.value = color;
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Order顺序</label>
                    <input
                      name="Order"
                      type="number"
                      min="0"
                      defaultValue={editingBanner?.order ?? banners.length}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">状态</label>
                    <select
                      name="isActive"
                      defaultValue={String(editingBanner?.isActive ?? true)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
                    setShowAddBanner(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingBanner ? '保存修改' : '添加轮播图'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature Edit/Add Modal */}
      {(editingFeature || showAddFeature) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingFeature ? '编辑特性' : '添加特性'}
              </h3>
              <button
                onClick={() => {
                  setEditingFeature(null);
                  setShowAddFeature(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              handleFeatureSubmit(e, {
                icon: formData.get('icon') as string,
                title: formData.get('标题') as string,
                description: formData.get('描述') as string,
                order: Number(formData.get('Order')),
                isActive: formData.get('isActive') === 'true'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Icon class name
                    <span className="text-xs text-gray-500 ml-2">(Font Awesome icon)</span>
                  </label>
                  <input
                    name="icon"
                    type="text"
                    defaultValue={editingFeature?.icon}
                    placeholder="fa-truck-fast"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    访问 <a href="https://fontawesome.com/icons" target="_blank" className="text-indigo-600 hover:underline">fontawesome.com</a> findicon
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                  <input
                    name="标题"
                    type="text"
                    defaultValue={editingFeature?.title}
                    placeholder="e.g.,, Free Shipping"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">描述</label>
                  <textarea
                    name="描述"
                    defaultValue={editingFeature?.description}
                    placeholder="Describe the advantages of this feature in detail..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">排序</label>
                    <input
                      name="Order"
                      type="number"
                      min="0"
                      defaultValue={editingFeature?.order ?? features.length}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">状态</label>
                    <select
                      name="isActive"
                      defaultValue={String(editingFeature?.isActive ?? true)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFeature(null);
                    setShowAddFeature(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingFeature ? '保存修改' : '添加特性'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Story Edit Modal */}
      {editingBrandStory && brandStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">编辑品牌故事</h3>
              <button
                onClick={() => setEditingBrandStory(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (onUpdateBrandStory) {
                onUpdateBrandStory({
                  ...brandStory,
                  subtitle: formData.get('subtitle') as string,
                  title: formData.get('标题') as string,
                  description: formData.get('描述') as string,
                  seconddescription: formData.get('second描述') as string,
                  image1: formData.get('image1') as string,
                  image2: formData.get('image2') as string,
                  image3: formData.get('image3') as string,
                  image4: formData.get('image4') as string,
                  badgeText1: formData.get('badgeText1') as string,
                  badgeText2: formData.get('badgeText2') as string,
                  stat1Value: formData.get('stat1Value') as string,
                  stat1Label: formData.get('stat1Label') as string,
                  stat2Value: formData.get('stat2Value') as string,
                  stat2Label: formData.get('stat2Label') as string,
                  stat3Value: formData.get('stat3Value') as string,
                  stat3Label: formData.get('stat3Label') as string,
                  按钮1Text: formData.get('按钮1Text') as string,
                  按钮1跳转: formData.get('按钮1跳转') as string,
                  按钮2Text: formData.get('按钮2Text') as string,
                  按钮2跳转: formData.get('按钮2跳转') as string
                });
              }
              setEditingBrandStory(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">副标题</label>
                    <input
                      name="subtitle"
                      type="text"
                      defaultValue={brandStory.subtitle}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                    <input
                      name="标题"
                      type="text"
                      defaultValue={brandStory.title}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First paragraph 描述</label>
                  <textarea
                    name="描述"
                    defaultValue={brandStory.description}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Second paragraph 描述</label>
                  <textarea
                    name="second描述"
                    defaultValue={brandStory.second描述}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-4">Product 图片</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        图片 1 URL <span className="text-indigo-600">(top left, 3:4 ratio)</span>
                        <span className="text-xs text-gray-500 block mt-1">Recommended 600×800px</span>
                      </label>
                      <input
                        name="image1"
                        type="text"
                        defaultValue={brandStory.image1}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        图片 2 URL <span className="text-indigo-600">(bottom left, square)</span>
                        <span className="text-xs text-gray-500 block mt-1">Recommended 600×600px</span>
                      </label>
                      <input
                        name="image2"
                        type="text"
                        defaultValue={brandStory.image2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        图片 3 URL <span className="text-indigo-600">(top right, square)</span>
                        <span className="text-xs text-gray-500 block mt-1">Recommended 600×600px</span>
                      </label>
                      <input
                        name="image3"
                        type="text"
                        defaultValue={brandStory.image3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        图片 4 URL <span className="text-indigo-600">(bottom right, 3:4 ratio)</span>
                        <span className="text-xs text-gray-500 block mt-1">Recommended 600×800px</span>
                      </label>
                      <input
                        name="image4"
                        type="text"
                        defaultValue={brandStory.image4}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-4">Floating Badge Text</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Badge Text 1 (top)</label>
                      <input
                        name="badgeText1"
                        type="text"
                        defaultValue={brandStory.badgeText1}
                        placeholder="e.g.,, 3.0''"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Badge Text 2 (bottom)</label>
                      <input
                        name="badgeText2"
                        type="text"
                        defaultValue={brandStory.badgeText2}
                        placeholder="e.g.,, Il più piccolo al mondo"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-4">Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Statistic1 - Value</label>
                      <input name="stat1Value" type="text" defaultValue={brandStory.stat1Value} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">Statistic1 - Label</label>
                      <input name="stat1Label" type="text" defaultValue={brandStory.stat1Label} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Statistic2 - Value</label>
                      <input name="stat2Value" type="text" defaultValue={brandStory.stat2Value} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">Statistic2 - Label</label>
                      <input name="stat2Label" type="text" defaultValue={brandStory.stat2Label} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Statistic3 - Value</label>
                      <input name="stat3Value" type="text" defaultValue={brandStory.stat3Value} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">Statistic3 - Label</label>
                      <input name="stat3Label" type="text" defaultValue={brandStory.stat3Label} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-4">按钮设置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">按钮1 - 文字</label>
                      <input name="按钮1Text" type="text" defaultValue={brandStory.按钮1Text} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">按钮1 - 链接</label>
                      <input name="按钮1跳转" type="text" defaultValue={brandStory.按钮1跳转} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">按钮2 - 文字</label>
                      <input name="按钮2Text" type="text" defaultValue={brandStory.按钮2Text} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">按钮2 - 链接</label>
                      <input name="按钮2跳转" type="text" defaultValue={brandStory.按钮2跳转} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingBrandStory(false)}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Edit/Add Modal */}
      {(editingVideo || showAddVideo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingVideo ? '编辑视频' : '添加视频'}
              </h3>
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setShowAddVideo(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-lightbulb text-white"></i>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">视频封面Sizerecommended</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li><i className="fa-solid fa-check mr-2"></i><strong>推荐尺寸: </strong>600×800px(竖屏视频ratio 3:4)</li>
                    <li><i className="fa-solid fa-check mr-2"></i><strong>File format：</strong>JPG 或 PNG</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              handleVideoSubmit(e, {
                title: formData.get('标题') as string,
                thumbnail: formData.get('thumbnail') as string,
                productTag: formData.get('productTag') as string,
                views: formData.get('views') as string,
                videoUrl: formData.get('videoUrl') as string || undefined,
                order: Number(formData.get('Order')),
                isActive: formData.get('isActive') === 'true'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video 标题</label>
                  <input
                    name="标题"
                    type="text"
                    defaultValue={editingVideo?.title}
                    placeholder="e.g.,, Unboxing S1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    封面图 URL
                    <span className="text-xs text-indigo-600 ml-2 font-semibold">📐 Recommended 600×800px (ratio 3:4 vertical)</span>
                  </label>
                  <input
                    name="thumbnail"
                    type="text"
                    defaultValue={editingVideo?.thumbnail}
                    placeholder="https://images.unsplash.com/photo-xxxxx?w=600"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  {editingVideo?.thumbnail && (
                    <div className="mt-3 aspect-[3/4] w-40 rounded-xl overflow-hidden border border-gray-200">
                      <img src={editingVideo.thumbnail} className="w-full h-full object-cover" alt="预览" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ProductLabel</label>
                    <input
                      name="productTag"
                      type="text"
                      defaultValue={editingVideo?.productTag}
                      placeholder="TinyTalk Pro S1"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">观看次数</label>
                    <input
                      name="views"
                      type="text"
                      defaultValue={editingVideo?.views}
                      placeholder="1.2M"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    视频 URL
                    <span className="text-xs text-gray-500 ml-2">(Optional, e.g. YouTube 链接)</span>
                  </label>
                  <input
                    name="videoUrl"
                    type="text"
                    defaultValue={editingVideo?.videoUrl}
                    placeholder="https://youtube.com/watch?v=xxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">排序</label>
                    <input
                      name="Order"
                      type="number"
                      min="0"
                      defaultValue={editingVideo?.order ?? videos.length}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">状态</label>
                    <select
                      name="isActive"
                      defaultValue={String(editingVideo?.isActive ?? true)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVideo(null);
                    setShowAddVideo(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingVideo ? '保存修改' : '添加视频'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Newsletter Edit Modal */}
      {editingNewsletter && newsletter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">编辑 Newsletter 订阅区</h3>
              <button
                onClick={() => setEditingNewsletter(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (onUpdateNewsletter) {
                onUpdateNewsletter({
                  ...newsletter,
                  icon: formData.get('icon') as string,
                  title: formData.get('标题') as string,
                  description: formData.get('描述') as string,
                  discountText: formData.get('discountText') as string,
                  placeholderText: formData.get('placeholderText') as string,
                  buttonText: formData.get('按钮Text') as string,
                  privacyText: formData.get('privacyText') as string,
                  badge1Text: formData.get('badge1Text') as string,
                  badge2Text: formData.get('badge2Text') as string,
                  badge3Text: formData.get('badge3Text') as string,
                  backgroundColor: formData.get('backgroundColor') as string
                });
              }
              setEditingNewsletter(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Icon class name</label>
                  <input
                    name="icon"
                    type="text"
                    defaultValue={newsletter.icon}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                  <input
                    name="标题"
                    type="text"
                    defaultValue={newsletter.title}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    描述文字
                    <span className="text-xs text-gray-500 ml-2">(使用 {'{discount}'} 作为折扣占位符)</span>
                  </label>
                  <textarea
                    name="描述"
                    defaultValue={newsletter.description}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">折扣文字</label>
                    <input
                      name="discountText"
                      type="text"
                      defaultValue={newsletter.discountText}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">输入框占位符</label>
                    <input
                      name="placeholderText"
                      type="text"
                      defaultValue={newsletter.placeholderText}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">按钮文字</label>
                  <input
                    name="按钮Text"
                    type="text"
                    defaultValue={newsletter.buttonText}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">隐私提示文字</label>
                  <input
                    name="privacyText"
                    type="text"
                    defaultValue={newsletter.privacyText}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">背景渐变色</label>
                  <select
                    name="背景色Color"
                    defaultValue={newsletter.backgroundColor}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="from-indigo-600 to-purple-600">靛紫渐变</option>
                    <option value="from-blue-600 to-cyan-600">蓝青渐变</option>
                    <option value="from-rose-600 to-pink-600">玫瑰渐变</option>
                    <option value="from-green-600 to-emerald-600">绿翠渐变</option>
                    <option value="from-orange-600 to-red-600">橙红渐变</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Badge文字(3个)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      name="badge1Text"
                      type="text"
                      defaultValue={newsletter.badge1Text}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="badge2Text"
                      type="text"
                      defaultValue={newsletter.badge2Text}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="badge3Text"
                      type="text"
                      defaultValue={newsletter.badge3Text}
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingNewsletter(false)}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Comparison Edit Modal */}
      {editingSizeComparison && sizeComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">编辑尺寸 Comparison</h3>
              <button
                onClick={() => setEditingSizeComparison(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (onUpdateSizeComparison) {
                onUpdateSizeComparison({
                  ...sizeComparison,
                  title: formData.get('标题') as string,
                  description: formData.get('描述') as string,
                  按钮1Text: formData.get('按钮1Text') as string,
                  按钮1Value: formData.get('按钮1Value') as string,
                  按钮2Text: formData.get('按钮2Text') as string,
                  按钮2Value: formData.get('按钮2Value') as string,
                  feature1Icon: formData.get('feature1Icon') as string,
                  feature1Title: formData.get('feature1Title') as string,
                  feature1description: formData.get('feature1描述') as string,
                  feature2Icon: formData.get('feature2Icon') as string,
                  feature2Title: formData.get('feature2Title') as string,
                  feature2description: formData.get('feature2描述') as string,
                  standardPhoneLabel: formData.get('standardPhoneLabel') as string,
                  backgroundColor: formData.get('backgroundColor') as string
                });
              }
              setEditingSizeComparison(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                  <input
                    name="标题"
                    type="text"
                    defaultValue={sizeComparison.title}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">描述</label>
                  <textarea
                    name="描述"
                    defaultValue={sizeComparison.description}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">切换按钮</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">按钮1 - 文字</label>
                      <input name="按钮1Text" type="text" defaultValue={sizeComparison.按钮1Text} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">按钮1 - 值</label>
                      <input name="按钮1Value" type="text" defaultValue={sizeComparison.按钮1Value} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">按钮2 - 文字</label>
                      <input name="按钮2Text" type="text" defaultValue={sizeComparison.按钮2Text} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                      <label className="block text-xs font-bold text-gray-700 mt-2 mb-2">按钮2 - 值</label>
                      <input name="按钮2Value" type="text" defaultValue={sizeComparison.按钮2Value} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" required />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">特性1</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      name="feature1Icon"
                      type="text"
                      defaultValue={sizeComparison.feature1Icon}
                      placeholder="fa-weight-hanging"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="feature1Title"
                      type="text"
                      defaultValue={sizeComparison.feature1Title}
                      placeholder="标题"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="feature1描述"
                      type="text"
                      defaultValue={sizeComparison.feature1描述}
                      placeholder="描述"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">特性2</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      name="feature2Icon"
                      type="text"
                      defaultValue={sizeComparison.feature2Icon}
                      placeholder="fa-expand"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="feature2Title"
                      type="text"
                      defaultValue={sizeComparison.feature2Title}
                      placeholder="标题"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                    <input
                      name="feature2描述"
                      type="text"
                      defaultValue={sizeComparison.feature2描述}
                      placeholder="描述"
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">标准手机Label</label>
                  <input
                    name="standardPhoneLabel"
                    type="text"
                    defaultValue={sizeComparison.standardPhoneLabel}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">背景颜色类名</label>
                  <input
                    name="背景色Color"
                    type="text"
                    defaultValue={sizeComparison.backgroundColor}
                    placeholder="bg-gray-900"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSizeComparison(false)}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Edit/Add Modal */}
      {(editingFAQ || showAddFAQ) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingFAQ ? '编辑问题' : '添加问题'}
              </h3>
              <button
                onClick={() => {
                  setEditingFAQ(null);
                  setShowAddFAQ(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              handleFAQSubmit(e, {
                icon: formData.get('icon') as string,
                question: formData.get('question') as string,
                answer: formData.get('answer') as string,
                order: Number(formData.get('Order')),
                isActive: formData.get('isActive') === 'true'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Icon class name
                    <span className="text-xs text-gray-500 ml-2">(Font Awesome)</span>
                  </label>
                  <input
                    name="icon"
                    type="text"
                    defaultValue={editingFAQ?.icon}
                    placeholder="fa-mobile-screen-按钮"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">问题</label>
                  <input
                    name="question"
                    type="text"
                    defaultValue={editingFAQ?.question}
                    placeholder="e.g.,, 手机规格是什么？"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">回答</label>
                  <textarea
                    name="answer"
                    defaultValue={editingFAQ?.answer}
                    placeholder="详细回答这个Question..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">排序</label>
                    <input
                      name="Order"
                      type="number"
                      min="0"
                      defaultValue={editingFAQ?.order ?? faqs.length}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">状态</label>
                    <select
                      name="isActive"
                      defaultValue={String(editingFAQ?.isActive ?? true)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFAQ(null);
                    setShowAddFAQ(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingFAQ ? '保存修改' : '添加问题'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Edit/Add Modal */}
      {(editingReview || showAddReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingReview ? '编辑Review' : '添加Review'}
              </h3>
              <button
                onClick={() => {
                  setEditingReview(null);
                  setShowAddReview(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              const imagesStr = formData.get('reviewImages') as string;
              handleReviewSubmit(e, {
                user: formData.get('user') as string,
                rating: Number(formData.get('rating')),
                comment: formData.get('comment') as string,
                date: formData.get('date') as string,
                reviewImages: imagesStr ? imagesStr.split('\n').filter(url => url.trim()) : []
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">User名</label>
                    <input
                      name="user"
                      type="text"
                      defaultValue={editingReview?.user}
                      placeholder="e.g.,, Marco R."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">评分 (1-5)</label>
                    <select
                      name="rating"
                      defaultValue={editingReview?.rating || 5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    >
                      <option value="5">5 星 ⭐⭐⭐⭐⭐</option>
                      <option value="4">4 星 ⭐⭐⭐⭐</option>
                      <option value="3">3 星 ⭐⭐⭐</option>
                      <option value="2">2 星 ⭐⭐</option>
                      <option value="1">1 星 ⭐</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Review Content</label>
                  <textarea
                    name="comment"
                    defaultValue={editingReview?.comment}
                    placeholder="UserofReview Content..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">发布时间</label>
                  <input
                    name="date"
                    type="text"
                    defaultValue={editingReview?.date}
                    placeholder="e.g.,, 2 giorni fa"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ReviewImage URL(可选)
                    <span className="text-xs text-gray-500 ml-2">(One URL per line, Recommended 600×800px)</span>
                  </label>
                  <textarea
                    name="reviewImages"
                    defaultValue={editingReview?.reviewImages?.join('\n')}
                    placeholder="https://example.com/image1.jpg"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setShowAddReview(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingReview ? '保存修改' : '添加Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Review Edit/Add Modal */}
      {(editingProductReview || showAddProductReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingProductReview ? '编辑Product Review' : 'add商品Review'}
              </h3>
              <button
                onClick={() => {
                  setEditingProductReview(null);
                  setShowAddProductReview(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const imagesStr = formData.get('reviewImages') as string;
              const reviewData: Review = {
                id: editingProductReview?.id || `review-${Date.now()}`,
                user: formData.get('user') as string,
                rating: Number(formData.get('rating')),
                comment: formData.get('comment') as string,
                date: formData.get('date') as string,
                reviewImages: imagesStr ? imagesStr.split('\n').filter(url => url.trim()) : []
              };
              
              if (editingProductReview) {
                setProductReviews(prev => prev.map(r => r.id === editingProductReview.id ? reviewData : r));
                setEditingProductReview(null);
              } else {
                setProductReviews(prev => [...prev, reviewData]);
                setShowAddProductReview(false);
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">User名</label>
                    <input
                      name="user"
                      type="text"
                      defaultValue={editingProductReview?.user}
                      placeholder="e.g.,, Marco R."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">评分 (1-5)</label>
                    <select
                      name="rating"
                      defaultValue={editingProductReview?.rating || 5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    >
                      <option value="5">5 星 ⭐⭐⭐⭐⭐</option>
                      <option value="4">4 星 ⭐⭐⭐⭐</option>
                      <option value="3">3 星 ⭐⭐⭐</option>
                      <option value="2">2 星 ⭐⭐</option>
                      <option value="1">1 星 ⭐</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Review Content</label>
                  <textarea
                    name="comment"
                    defaultValue={editingProductReview?.comment}
                    placeholder="UserofReview Content..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">发布时间</label>
                  <input
                    name="date"
                    type="text"
                    defaultValue={editingProductReview?.date}
                    placeholder="e.g.,, 2 giorni fa"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ReviewImage URL(可选)
                    <span className="text-xs text-gray-500 ml-2">(One URL per line, Recommended 600×800px)</span>
                  </label>
                  <textarea
                    name="reviewImages"
                    defaultValue={editingProductReview?.reviewImages?.join('\n')}
                    placeholder="https://example.com/image1.jpg"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductReview(null);
                    setShowAddProductReview(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingProductReview ? '保存修改' : '添加Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Post Edit/Add Modal */}
      {(editingBlogPost || showAddBlogPost) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingBlogPost ? '编辑Blog文章' : '添加Blog文章'}
              </h3>
              <button
                onClick={() => {
                  setEditingBlogPost(null);
                  setShowAddBlogPost(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              handleBlogPostSubmit(e, {
                title: formData.get('title') as string,
                excerpt: formData.get('excerpt') as string,
                content: formData.get('content') as string,
                category: formData.get('category') as string,
                image: formData.get('image') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">文章标题</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingBlogPost?.title}
                    placeholder="输入文章标题..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">文章分类</label>
                  <select
                    name="category"
                    defaultValue={editingBlogPost?.category || 'Lifestyle'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Technology">Technology</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="News">News</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">文章摘要</label>
                  <textarea
                    name="excerpt"
                    defaultValue={editingBlogPost?.excerpt}
                    placeholder="输入文章摘要..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">文章内容</label>
                  <textarea
                    name="content"
                    defaultValue={editingBlogPost?.content}
                    placeholder="输入文章内容..."
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    封面图片 URL
                    <span className="text-xs text-indigo-600 ml-2">(推荐尺寸：1200×675px，16:9比例)</span>
                  </label>
                  <input
                    type="url"
                    name="image"
                    defaultValue={editingBlogPost?.image}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  {editingBlogPost?.image && (
                    <div className="mt-3">
                      <img src={editingBlogPost.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlogPost(null);
                    setShowAddBlogPost(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingBlogPost ? '保存修改' : '添加文章'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Mini Scene Edit/Add Modal */}
      {(editingWhyMiniScene || showAddWhyMiniScene) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">
                {editingWhyMiniScene ? '编辑场景' : '添加场景'}
              </h3>
              <button
                onClick={() => {
                  setEditingWhyMiniScene(null);
                  setShowAddWhyMiniScene(false);
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const benefits = [
                formData.get('benefit1') as string,
                formData.get('benefit2') as string,
                formData.get('benefit3') as string
              ].filter(b => b.trim());

              const scene: WhyMiniScene = {
                id: editingWhyMiniScene?.id || `scene-${Date.now()}`,
                tag: formData.get('tag') as string,
                tagColor: formData.get('tagColor') as string,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                image: formData.get('image') as string,
                benefits,
                order: Number(formData.get('order')),
                isActive: formData.get('isActive') === 'true'
              };

              if (editingWhyMiniScene) {
                onUpdateWhyMiniScene?.(scene);
                setEditingWhyMiniScene(null);
              } else {
                onAddWhyMiniScene?.(scene);
                setShowAddWhyMiniScene(false);
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">标签文字</label>
                    <input
                      name="tag"
                      type="text"
                      defaultValue={editingWhyMiniScene?.tag}
                      placeholder="例如: FOR FOCUS"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">标签颜色</label>
                    <select
                      name="tagColor"
                      defaultValue={editingWhyMiniScene?.tagColor || 'indigo'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    >
                      <option value="indigo">靛蓝 (Indigo)</option>
                      <option value="purple">紫色 (Purple)</option>
                      <option value="green">绿色 (Green)</option>
                      <option value="orange">橙色 (Orange)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">场景标题</label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editingWhyMiniScene?.title}
                    placeholder="例如: Study for Exams / Prevent Distraction at Work"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">场景描述</label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={editingWhyMiniScene?.description}
                    placeholder="描述这个使用场景的详细情况..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    场景图片URL
                    <span className="text-xs text-indigo-600 ml-2">(推荐尺寸：800×800px，正方形)</span>
                  </label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={editingWhyMiniScene?.image}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  {editingWhyMiniScene?.image && (
                    <div className="mt-3">
                      <img src={editingWhyMiniScene.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">优势特点（3个）</label>
                  <div className="space-y-2">
                    <input
                      name="benefit1"
                      type="text"
                      defaultValue={editingWhyMiniScene?.benefits[0]}
                      placeholder="优势特点 1"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                    <input
                      name="benefit2"
                      type="text"
                      defaultValue={editingWhyMiniScene?.benefits[1]}
                      placeholder="优势特点 2"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                    <input
                      name="benefit3"
                      type="text"
                      defaultValue={editingWhyMiniScene?.benefits[2]}
                      placeholder="优势特点 3"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">排序</label>
                    <input
                      name="order"
                      type="number"
                      defaultValue={editingWhyMiniScene?.order ?? whyMiniScenes.length}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">状态</label>
                    <select
                      name="isActive"
                      defaultValue={editingWhyMiniScene?.isActive !== false ? 'true' : 'false'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingWhyMiniScene(null);
                    setShowAddWhyMiniScene(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {editingWhyMiniScene ? '保存修改' : '添加场景'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Mini Content Edit Modal */}
      {editingWhyMiniContent && whyMiniContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">编辑页面内容</h3>
              <button
                onClick={() => setEditingWhyMiniContent(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const content: WhyMiniContent = {
                pageTitle: formData.get('pageTitle') as string,
                pageSubtitle: formData.get('pageSubtitle') as string,
                ctaTitle: formData.get('ctaTitle') as string,
                ctaDescription: formData.get('ctaDescription') as string,
                ctaButtonText: formData.get('ctaButtonText') as string
              };
              onUpdateWhyMiniContent?.(content);
              setEditingWhyMiniContent(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">页面标题</label>
                  <input
                    name="pageTitle"
                    type="text"
                    defaultValue={whyMiniContent.pageTitle}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">页面副标题</label>
                  <input
                    name="pageSubtitle"
                    type="text"
                    defaultValue={whyMiniContent.pageSubtitle}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CTA标题</label>
                  <input
                    name="ctaTitle"
                    type="text"
                    defaultValue={whyMiniContent.ctaTitle}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CTA描述</label>
                  <textarea
                    name="ctaDescription"
                    rows={3}
                    defaultValue={whyMiniContent.ctaDescription}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CTA按钮文字</label>
                  <input
                    name="ctaButtonText"
                    type="text"
                    defaultValue={whyMiniContent.ctaButtonText}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingWhyMiniContent(false)}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
