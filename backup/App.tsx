import React, { useState, useEffect, useRef } from 'react';
import { getExchangeRates, convertCurrency, currencySymbols, type CurrencyCode } from './services/exchangeRate';
import { TranslationProvider, useTranslation, useTranslatedText, useTranslatedTexts } from './context/TranslationContext';
import { TranslatedText } from './components/TranslatedText';
import TranslatedInput from './components/TranslatedInput';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AIConsultant from './components/AIConsultant';
import SizeComparison from './components/SizeComparison';
import VerticalVideoShowcase from './components/VerticalVideoShowcase';
import FAQ from './components/FAQ';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import BannerCarousel from './components/BannerCarousel';
import ReviewMasonry from './components/ReviewMasonry';
import FeaturesSection from './components/FeaturesSection';
import MarqueeBar from './components/MarqueeBar';
import BrandStory from './components/BrandStory';
import Newsletter from './components/Newsletter';
import ProductSpecs from './components/ProductSpecs';
import ProductFAQ from './components/ProductFAQ';
import RelatedProducts from './components/RelatedProducts';
import ProductGuarantee from './components/ProductGuarantee';
import PromotionBundle from './components/PromotionBundle';
import BlogDetail from './components/BlogDetail';
import PromoModal from './components/PromoModal';
import FeaturedProductsSlider from './components/FeaturedProductsSlider';
import AdminDashboard from './components/AdminDashboard';
import Wishlist from './components/Wishlist';
import LogoEditor from './components/LogoEditor';
import SEO from './components/SEO';
import { PRODUCTS, BLOG_POSTS, ALL_REVIEWS } from './data';
import { Product, CartItem, User, Order, Banner, Feature, BrandStoryContent, VideoContent, NewsletterContent, SizeComparisonContent, FAQItem, Review, BlogPost, WhyMiniScene, WhyMiniContent, LogoSettings } from './types';
import { isValidEmail, safeGetLocalStorage, isValidProductArray } from './utils/security';
import { productSchema, blogPostSchema } from './utils/jsonld';

const App: React.FC = () => {
  type View = 'home' | 'products' | 'blog' | 'blog-detail' | 'product-detail' | 'track' | 'checkout' | 'order-success' | 'account' | 'admin' | 'contact' | 'refund' | 'privacy' | 'about' | 'lifestyle' | 'wishlist';
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const wheelAcc = useRef<number>(0);
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el || view !== 'product-detail') return;
    
    const imgs = (selectedProduct && selectedProduct.images && selectedProduct.images.length > 0)
      ? selectedProduct.images
      : (selectedProduct ? [selectedProduct.image] : []);

    const resetAcc = () => { wheelAcc.current = 0; };
    let accResetTimer: any = null;

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events when the mouse is directly over the thumbnails container
      // and the event target is within the thumbnails container
      const rect = el.getBoundingClientRect();
      const isOverThumbnails = e.clientX >= rect.left && e.clientX <= rect.right && 
                              e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      if (!isOverThumbnails || !el.contains(e.target as Node)) {
        return; // Allow normal page scrolling
      }
      
      // Only prevent default if we're actually over the thumbnails
      e.preventDefault();
      e.stopPropagation();
      
      // always scroll thumbnails horizontally
      el.scrollLeft += e.deltaY;

      // accumulate delta to determine index change
      wheelAcc.current += e.deltaY;
      clearTimeout(accResetTimer);
      accResetTimer = setTimeout(resetAcc, 150);

      const THRESHOLD = 80; // adjust sensitivity
      if (Math.abs(wheelAcc.current) > THRESHOLD) {
        setActiveIndex(prev => {
          const dir = wheelAcc.current > 0 ? 1 : -1;
          const next = Math.max(0, Math.min(prev + dir, imgs.length - 1));
          return next;
        });
        wheelAcc.current = 0;
      }
    };

    // Add event listener to document to capture all wheel events
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      clearTimeout(accResetTimer);
    };
  }, [selectedProduct, view]);

  // When activeIndex changes, update activeImage and scroll thumbnail into center
  useEffect(() => {
    if (!selectedProduct) return;
    const imgs = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [selectedProduct.image];
    const idx = Math.max(0, Math.min(activeIndex, imgs.length - 1));
    const img = imgs[idx];
    if (img && img !== activeImage) setActiveImage(img);

    // scroll the thumbnail into center
    const el = thumbsRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    const targetScroll = Math.max(0, child.offsetLeft - (el.clientWidth - child.clientWidth) / 2);
    el.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [activeIndex, selectedProduct]);

  // Initialize active image and center the thumbnail when product changes
  useEffect(() => {
    if (!selectedProduct) {
      setActiveImage('');
      return;
    }
    const imgs = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [selectedProduct.image];
    const first = imgs[0];
    setActiveImage(first);
    // center the first thumbnail after render
    requestAnimationFrame(() => {
      const el = thumbsRef.current;
      if (!el) return;
      const child = el.children[0] as HTMLElement | undefined;
      if (!child) return;
      const targetScroll = Math.max(0, child.offsetLeft - (el.clientWidth - child.clientWidth) / 2);
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    });
  }, [selectedProduct]);

  // Ensure sticky positioning works - scroll to top when entering product detail
  useEffect(() => {
    if (view === 'product-detail') {
      window.scrollTo(0, 0);
    }
  }, [view, selectedProduct]);

  const [cart, setCart] = useState<CartItem[]>(() =>
    safeGetLocalStorage('tinytech_cart', [], (val) => Array.isArray(val))
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'phone' | 'watch' | 'accessory'>('all');
  
  // Customization States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('');
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [bundleItemSelections, setBundleItemSelections] = useState<Array<{ color?: string; variants?: { [key: string]: string } }>>([]);

  // Order Tracking
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [hasSeenPromo, setHasSeenPromo] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0); // 传递给 checkout 的折扣比例

  // Language & Currency States
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'BRL' | 'MXN'>('USD');
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  // Check screen size for sticky behavior
  useEffect(() => {
    const checkSize = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // 汇率状态
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>({
    USD: 1,
    EUR: 0.91,
    GBP: 0.77,
    JPY: 143,
    CNY: 7.1,
    KRW: 1300,
    CAD: 1.32,
    AUD: 1.47,
    CHF: 0.86,
    INR: 83,
    BRL: 4.9,
    MXN: 17.7
  });

  // 加载实时汇率
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const rates = await getExchangeRates('USD');
        setExchangeRates(rates.rates);
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      }
    };
    loadExchangeRates();
  }, []);

  const convertPrice = (price: number) => {
    return (price * exchangeRates[currency]).toFixed(2);
  };

  const formatPrice = (price: number) => {
    const converted = convertPrice(price);
    // 使用导入的 currencySymbols
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      KRW: '₩',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      INR: '₹',
      BRL: 'R$',
      MXN: 'MX$'
    };
    return `${symbols[currency as keyof typeof symbols]}${converted}`;
  };

  // User/Persistence States
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => 
    safeGetLocalStorage('tinytech_wishlist', [], (val) => Array.isArray(val) && val.every(id => typeof id === 'string'))
  );
  
  // Load data from localStorage or use defaults
  const [allProducts, setAllProducts] = useState<Product[]>(() => 
    safeGetLocalStorage('tinytech_products', PRODUCTS, isValidProductArray)
  );
  
  const [banners, setBanners] = useState<Banner[]>(() => 
    safeGetLocalStorage('tinytech_banners', [
      {
        id: 'banner-1',
        title: 'TinyTalk Pro S1',
        subtitle: 'The world\'s smallest flagship smartphone. Maximum power, minimum size.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1400',
        buttonText: 'Learn More',
        buttonLink: 'products',
        backgroundColor: 'from-indigo-600 to-purple-600',
        order: 0,
        isActive: true
      },
      {
        id: 'banner-2',
        title: 'ZenWatch Ultra',
        subtitle: 'The complete smartwatch that replaces your phone. Integrated 4G LTE.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400',
        buttonText: 'Explore Now',
        buttonLink: 'products',
        backgroundColor: 'from-blue-600 to-cyan-600',
        order: 1,
        isActive: true
      },
      {
        id: 'banner-3',
        title: 'January Sale',
        subtitle: 'Save up to 35% on all devices. Use code TINY20.',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1400',
        buttonText: 'Shop Now',
        buttonLink: 'products',
        backgroundColor: 'from-rose-600 to-pink-600',
        order: 2,
        isActive: true
      }
    ])
  );
  
  const [features, setFeatures] = useState<Feature[]>(() => 
    safeGetLocalStorage('tinytech_features', [
    {
      id: 'feature-1',
      icon: 'fa-truck-fast',
      title: 'Free Shipping',
      description: 'Fast delivery worldwide. Free express on all orders.',
      order: 0,
      isActive: true
    },
    {
      id: 'feature-2',
      icon: 'fa-rotate-left',
      title: '30-Day Free Returns',
      description: 'Not satisfied? Full refund within 30 days of purchase.',
      order: 1,
      isActive: true
    },
    {
      id: 'feature-3',
      icon: 'fa-shield-halved',
      title: '2-Year Warranty',
      description: 'Official manufacturer warranty. Dedicated support.',
      order: 2,
      isActive: true
    },
    {
      id: 'feature-4',
      icon: 'fa-credit-card',
      title: 'Secure Payment',
      description: 'Credit card, PayPal or bank transfer. SSL protected transactions.',
      order: 3,
      isActive: true
    }
  ])
  );

  const [brandStory, setBrandStory] = useState<BrandStoryContent>(() => 
    safeGetLocalStorage('tinytech_brandStory', {
    id: 'brand-story-1',
    subtitle: 'Who We Are',
    title: 'Minimalist Design.\nMaximum Power.',
    description: 'TinyTech was born from a passion for essential technology. We create ultra-compact devices that combine flagship performance with revolutionary dimensions.',
    secondDescription: 'Every millimeter is designed with meticulous care. Zero compromises on specs, maximum attention to detail. For those seeking the best in the smallest format.',
    image1: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    image2: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    image3: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600',
    image4: 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&q=80&w=600',
    badgeText1: '3.0"',
    badgeText2: 'World\'s\nSmallest',
    stat1Value: '15K+',
    stat1Label: 'Happy Customers',
    stat2Value: '4.9',
    stat2Label: 'Average Rating',
    stat3Value: '98%',
    stat3Label: 'Recommended',
    button1Text: 'Learn More',
    button1Link: 'about',
    button2Text: 'Contact Us',
    button2Link: 'contact'
  })
  );

  const [videos, setVideos] = useState<VideoContent[]>(() => 
    safeGetLocalStorage('tinytech_videos', [
    {
      id: 'video-1',
      title: 'Unboxing S1',
      thumbnail: 'https://images.unsplash.com/photo-1605170439002-90f450c99706?auto=format&fit=crop&q=80&w=600',
      productTag: 'TinyTalk Pro S1',
      views: '1.2M',
      order: 0,
      isActive: true
    },
    {
      id: 'video-2',
      title: 'Size Comparison',
      thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600',
      productTag: 'TinyTalk Pro S1',
      views: '856K',
      order: 1,
      isActive: true
    },
    {
      id: 'video-3',
      title: 'Daily Vlog',
      thumbnail: 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&q=80&w=600',
      productTag: 'ZenWatch Ultra',
      views: '2.1M',
      order: 2,
      isActive: true
    }
  ])
  );

  const [newsletter, setNewsletter] = useState<NewsletterContent>(() => 
    safeGetLocalStorage('tinytech_newsletter', {
    id: 'newsletter-1',
    icon: 'fa-envelope-open-text',
    title: 'Stay Updated',
    description: 'Subscribe to our newsletter and get {discount} on your first order. Plus: exclusive previews and special offers.',
    discountText: '20% off',
    placeholderText: 'Enter your email',
    buttonText: 'Subscribe Now',
    privacyText: 'Your data is safe. No spam, only exclusive offers.',
    badge1Text: 'Exclusive Offers',
    badge2Text: 'Product Previews',
    badge3Text: 'Special Discounts',
    backgroundColor: 'from-indigo-600 to-purple-600'
  })
  );
  
  const [sizeComparison, setSizeComparison] = useState<SizeComparisonContent>(() => 
    safeGetLocalStorage('tinytech_sizeComparison', {
    id: 'size-comparison-1',
    title: 'Truly Pocketable.',
    description: 'Experience the freedom of devices that don\'t weigh you down. Our mini smartphones and watches are designed for the modern minimalists.',
    button1Text: 'Mini Smartphone',
    button1Value: 'tiny',
    button2Text: 'Smartwatch',
    button2Value: 'watch',
    feature1Icon: 'fa-weight-hanging',
    feature1Title: 'Ultra Lightweight',
    feature1Description: 'Weights as low as 80g. You\'ll forget it\'s there.',
    feature2Icon: 'fa-expand',
    feature2Title: 'One-Hand Operation',
    feature2Description: 'Reach every corner of the screen effortlessly.',
    standardPhoneLabel: 'Standard Phone (6.7")',
    backgroundColor: 'bg-gray-900'
  })
  );

  const [faqs, setFaqs] = useState<FAQItem[]>(() => 
    safeGetLocalStorage('tinytech_faqs', [
    {
      id: 'faq-1',
      icon: 'fa-mobile-screen-button',
      question: 'Phone Specifications',
      answer: 'Our TinyTalk Pro S1 features a 3.0" LTPS display, 8GB RAM, and 128GB storage powered by a high-efficiency Helio G99 chipset.',
      order: 0,
      isActive: true
    },
    {
      id: 'faq-2',
      icon: 'fa-folder-open',
      question: 'Can I have more storage?',
      answer: 'The current models come with 128GB of high-speed UFS 2.2 storage. While there is no SD card slot to maintain the micro-size, 128GB is optimized for thousands of photos and essential apps.',
      order: 1,
      isActive: true
    },
    {
      id: 'faq-3',
      icon: 'fa-cloud-arrow-down',
      question: 'How to download iOS?',
      answer: 'TinyTech devices run on a highly customized version of Android 13 designed to look and feel minimalist. We do not support iOS as it is proprietary to Apple, but we offer full Google Play Support.',
      order: 2,
      isActive: true
    },
    {
      id: 'faq-4',
      icon: 'fa-credit-card',
      question: 'Are there monthly payments?',
      answer: 'Yes! We partner with Klarna and Afterpay to offer interest-free installments over 3 or 6 months at checkout.',
      order: 3,
      isActive: true
    },
    {
      id: 'faq-5',
      icon: 'fa-battery-three-quarters',
      question: 'How long to fully charge it?',
      answer: 'Our DenseEnergy cells support 18W fast charging. You can reach 0% to 100% in approximately 45 minutes.',
      order: 4,
      isActive: true
    }
  ])
  );

  // Homepage Reviews State
  const [homepageReviews, setHomepageReviews] = useState<Review[]>(() => 
    safeGetLocalStorage('tinytech_homepageReviews', ALL_REVIEWS)
  );

  // Blog Posts State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => 
    safeGetLocalStorage('tinytech_blogPosts', BLOG_POSTS)
  );

  // Why Mini Scenes State
  const [whyMiniScenes, setWhyMiniScenes] = useState<WhyMiniScene[]>(() => 
    safeGetLocalStorage('tinytech_whyMiniScenes', [
      {
        id: 'scene-1',
        tag: 'FOR FOCUS',
        tagColor: 'indigo',
        title: 'Study for Exams / Prevent Distraction at Work',
        description: 'When preparing for exams or needing deep work, the mini phone keeps you focused. No endless social media scrolling, no distracting notifications. Only essential communication features to help you stay efficient.',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
        benefits: [
          'Reduce social media temptation, improve focus',
          'Only keep essential communication features',
          'Long battery life keeps you worry-free all day'
        ],
        order: 0,
        isActive: true
      },
      {
        id: 'scene-2',
        tag: 'FOR NIGHT OUT',
        tagColor: 'purple',
        title: 'Night Club Parties / Lightweight and Not Afraid to Lose',
        description: 'When going to nightclubs, music festivals, or parties, big phones take up space and are easy to lose. The mini phone fits easily in your pocket, letting you enjoy the night without worrying about expensive equipment safety.',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        benefits: [
          'Lightweight and compact, fits easily in any pocket',
          'Won\'t feel bad even if lost',
          'Stay in touch, contact friends anytime'
        ],
        order: 1,
        isActive: true
      },
      {
        id: 'scene-3',
        tag: 'FOR KIDS',
        tagColor: 'green',
        title: 'Child\'s First Phone',
        description: 'Choosing a first phone for your child? The mini phone is the perfect choice. Simple and easy to use, without complex social media and gaming temptations, teaching children to use technology responsibly.',
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
        benefits: [
          'No social media distractions, develop healthy habits',
          'Simple features, easy to manage and control',
          'Affordable, suitable as an entry-level device'
        ],
        order: 2,
        isActive: true
      },
      {
        id: 'scene-4',
        tag: 'FOR SPORTS',
        tagColor: 'orange',
        title: 'Perfect Companion for Sports',
        description: 'When running, working out, or doing outdoor sports, big phones are a burden. The mini phone feels almost weightless, letting you focus on the sport itself while staying reachable.',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
        benefits: [
          'Ultra-light weight, almost unnoticeable when running',
          'Compact size, won\'t shake during movement',
          'Keep music and calling features'
        ],
        order: 3,
        isActive: true
      }
    ])
  );

  const [whyMiniContent, setWhyMiniContent] = useState<WhyMiniContent>(() => 
    safeGetLocalStorage('tinytech_whyMiniContent', {
      pageTitle: 'Why Mini?',
      pageSubtitle: 'Discover the perfect moments for your compact companion',
      ctaTitle: 'Have you found your use case?',
      ctaDescription: 'The mini phone is not a replacement, but a smart supplement to your life. It\'s the best choice when you need focus, portability, and simplicity.',
      ctaButtonText: 'Explore Mini Phones'
    })
  );

  const [logoSettings, setLogoSettings] = useState<LogoSettings>(() =>
    safeGetLocalStorage('tinytech_logoSettings', {
      headerLogo: {
        image: '',
        text: 'TinyTech',
        width: 40,
        height: 40
      },
      footerLogo: {
        image: '',
        text: 'TinyTech',
        width: 40,
        height: 40
      }
    })
  );

  const [allOrders, setAllOrders] = useState<Order[]>([
    {
      id: 'ORD-2026001',
      date: '2026-01-01',
      items: [{
        id: '1',
        name: 'Atom Mini X1',
        price: 699,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
      }],
      total: 699,
      status: 'Processing',
      address: 'Via Roma 123, Milano'
    },
    {
      id: 'ORD-2026002',
      date: '2025-12-28',
      items: [{
        id: '2',
        name: 'Nano Pocket Pro',
        price: 899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1592286927505-b7ee4f0e7b17?w=400'
      }],
      total: 899,
      status: 'Shipped',
      address: 'Corso Vittorio 45, Roma'
    }
  ]);
  const [allUsers, setAllUsers] = useState<User[]>([
    {
      name: 'Marco Rossi',
      email: 'marco@example.com',
      orders: []
    },
    {
      name: 'Giulia Bianchi',
      email: 'giulia@example.com',
      orders: []
    }
  ]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
      setSelectedColor(selectedProduct.colorOptions?.[0]?.name || '');
      setSelectedBundleId(selectedProduct.bundles?.[0]?.id || '');
      
      // 初始化变体选择
      const initialVariants: { [key: string]: string } = {};
      selectedProduct.variants?.forEach(variant => {
        const firstAvailable = variant.options.find(opt => opt.inStock);
        if (firstAvailable) {
          initialVariants[variant.type] = firstAvailable.id;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [selectedProduct]);

  // Sync selectedProduct when allProducts changes (for real-time updates)
  useEffect(() => {
    if (selectedProduct) {
      const updatedProduct = allProducts.find(p => p.id === selectedProduct.id);
      if (updatedProduct && JSON.stringify(updatedProduct) !== JSON.stringify(selectedProduct)) {
        setSelectedProduct(updatedProduct);
      }
    }
  }, [allProducts]);

  // Show promo modal after 5 seconds on first visit
  // useEffect(() => {
  //   if (!hasSeenPromo && view !== 'admin') {
  //     const timer = setTimeout(() => {
  //       setShowPromoModal(true);
  //       setHasSeenPromo(true);
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasSeenPromo, view]);

  // Check URL hash for admin access
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        navigate('admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Handle PayPal return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paypalStatus = urlParams.get('paypal');
    const token = urlParams.get('token');
    const payerId = urlParams.get('PayerID');
    
    if (paypalStatus === 'success' && token && payerId) {
      console.log('[PayPal] Payment approved, capturing order...');
      handlePayPalReturn(token, payerId);
    } else if (paypalStatus === 'cancel') {
      console.log('[PayPal] Payment cancelled by user');
      alert('PayPal支付已取消');
      // 清理URL参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle PayPal payment return
  const handlePayPalReturn = async (token: string, payerId: string) => {
    try {
      // 导入PayPal服务
      const { capturePayPalOrder } = await import('./services/paypal');
      
      // 捕获支付并获取订单详情
      const result = await capturePayPalOrder(token);
      
      if (result.success) {
        console.log('[PayPal] Payment captured successfully');
        
        // 提取地址信息
        if (result.orderDetails) {
          const orderDetails = result.orderDetails;
          console.log('[PayPal] Order details:', orderDetails);
          
          // 提取收货地址信息
          const shippingAddress = orderDetails.purchase_units?.[0]?.shipping?.address;
          const payerInfo = orderDetails.payer;
          
          if (shippingAddress || payerInfo) {
            console.log('[PayPal] Shipping address:', shippingAddress);
            console.log('[PayPal] Payer info:', payerInfo);
            
            // 这里你可以将地址信息发送到你的后端服务器
            // 或者存储在本地状态中用于订单处理
            const addressInfo = {
              // 收货地址
              shipping: shippingAddress ? {
                name: shippingAddress.admin_area_2 || '', // 城市
                address_line_1: shippingAddress.address_line_1 || '',
                address_line_2: shippingAddress.address_line_2 || '',
                admin_area_1: shippingAddress.admin_area_1 || '', // 州/省
                admin_area_2: shippingAddress.admin_area_2 || '', // 城市
                postal_code: shippingAddress.postal_code || '',
                country_code: shippingAddress.country_code || ''
              } : null,
              // 付款人信息
              payer: payerInfo ? {
                name: payerInfo.name?.given_name + ' ' + payerInfo.name?.surname || '',
                email: payerInfo.email_address || '',
                phone: payerInfo.phone?.phone_number?.national_number || ''
              } : null
            };
            
            console.log('[PayPal] Extracted address info:', addressInfo);
            
            // 你可以在这里将地址信息发送到你的服务器
            // await sendAddressToServer(token, addressInfo);
          }
        }
        
        // 完成订单
        handleOrderComplete(token);
      } else {
        throw new Error('Payment capture failed');
      }
    } catch (error) {
      console.error('[PayPal] Payment capture error:', error);
      alert('PayPal支付处理失败，请联系客服。');
    } finally {
      // 清理URL参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tinytech_products', JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem('tinytech_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('tinytech_features', JSON.stringify(features));
  }, [features]);

  useEffect(() => {
    localStorage.setItem('tinytech_brandStory', JSON.stringify(brandStory));
  }, [brandStory]);

  useEffect(() => {
    localStorage.setItem('tinytech_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('tinytech_newsletter', JSON.stringify(newsletter));
  }, [newsletter]);

  useEffect(() => {
    localStorage.setItem('tinytech_sizeComparison', JSON.stringify(sizeComparison));
  }, [sizeComparison]);

  useEffect(() => {
    localStorage.setItem('tinytech_blogPosts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem('tinytech_faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('tinytech_homepageReviews', JSON.stringify(homepageReviews));
  }, [homepageReviews]);

  useEffect(() => {
    localStorage.setItem('tinytech_whyMiniScenes', JSON.stringify(whyMiniScenes));
  }, [whyMiniScenes]);

  useEffect(() => {
    localStorage.setItem('tinytech_whyMiniContent', JSON.stringify(whyMiniContent));
  }, [whyMiniContent]);

  useEffect(() => {
    localStorage.setItem('tinytech_logoSettings', JSON.stringify(logoSettings));
  }, [logoSettings]);

  useEffect(() => {
    localStorage.setItem('tinytech_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('tinytech_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    if (product.stockLevel === 0) return;
    
    // For bundles, quantity represents the number of bundles (not items in the bundle)
    // The bundle price already includes all items
    const itemQuantity = 1;
    
    setCart(prev => {
      const existing = prev.find(i => 
        i.id === product.id && 
        i.bundleId === selectedBundleId && 
        i.selectedColor === selectedColor &&
        JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants)
      );
      if (existing) {
        return prev.map(i => 
          (i.id === product.id && 
           i.bundleId === selectedBundleId && 
           i.selectedColor === selectedColor &&
           JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants)) 
          ? { ...i, quantity: i.quantity + itemQuantity } 
          : i
        );
      }
      return [...prev, { 
        ...product, 
        quantity: itemQuantity, 
        selectedColor, 
        bundleId: selectedBundleId,
        selectedVariants: { ...selectedVariants },
        bundleItems: selectedBundleId && bundleItemSelections.length > 0 ? bundleItemSelections : undefined
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleTrack = () => {
    if (!trackingId) return;
    const found = user?.orders.find(o => o.id === trackingId);
    if (found) setTrackingResult(found);
    else alert('Order not found. Please check your ID.');
  };

  const navigate = (newView: View) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getItemPrice = (item: CartItem) => {
    if (item.bundleId && item.bundles) {
      const bundle = item.bundles.find(b => b.id === item.bundleId);
      if (bundle) return bundle.price;
    }
    return item.price;
  };

  const subtotal = cart.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);

  const handleLogin = (email?: string, password?: string) => {
    // 基本的输入验证
    if (email && password) {
      // 验证email格式
      if (!isValidEmail(email)) {
        alert('请输入有效的邮箱地址');
        return;
      }
      // 验证密码长度
      if (password.length < 6) {
        alert('密码至少需要6个字符');
        return;
      }
    }
    setUser({ name: 'Minimalist User', email: email || 'hello@tinytech.com', wishlist: [], orders: [] });
    setIsLoginModalOpen(false);
  };

  const handleOrderComplete = (orderId: string) => {
    setCurrentOrderId(orderId);
    
    // Create order and add to user's orders
    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString(),
      items: [...cart],
      total: subtotal,
      status: 'Processing',
      address: 'Shipping Address'
    };
    
    if (user) {
      setUser({
        ...user,
        orders: [...user.orders, newOrder]
      });
    }
    
    setAllOrders(prev => [...prev, newOrder]);
    
    // Clear cart and navigate to success page
    setCart([]);
    navigate('order-success');
  };

  // Admin functions
  const handleUpdateProduct = (product: Product) => {
    setAllProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddProduct = (product: Product) => {
    setAllProducts(prev => [...prev, product]);
  };

  const handleUpdateOrder = (order: Order) => {
    setAllOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  // Banner Management Functions
  const handleUpdateBanner = (banner: Banner) => {
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      setBanners(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddBanner = (banner: Banner) => {
    setBanners(prev => [...prev, banner]);
  };

  // Feature Management Functions
  const handleUpdateFeature = (feature: Feature) => {
    setFeatures(prev => prev.map(f => f.id === feature.id ? feature : f));
  };

  const handleDeleteFeature = (id: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      setFeatures(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAddFeature = (feature: Feature) => {
    setFeatures(prev => [...prev, feature]);
  };

  // Brand Story Management
  const handleUpdateBrandStory = (content: BrandStoryContent) => {
    setBrandStory(content);
  };

  // Video Management Functions
  const handleUpdateVideo = (video: VideoContent) => {
    setVideos(prev => prev.map(v => v.id === video.id ? video : v));
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleAddVideo = (video: VideoContent) => {
    setVideos(prev => [...prev, video]);
  };

  // Newsletter Management
  const handleUpdateNewsletter = (content: NewsletterContent) => {
    setNewsletter(content);
  };

  // Size Comparison Management
  const handleUpdateSizeComparison = (content: SizeComparisonContent) => {
    setSizeComparison(content);
  };

  // FAQ Management Functions
  const handleUpdateFAQ = (faq: FAQItem) => {
    setFaqs(prev => prev.map(f => f.id === faq.id ? faq : f));
  };

  const handleDeleteFAQ = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAddFAQ = (faq: FAQItem) => {
    setFaqs(prev => [...prev, faq]);
  };

  // Homepage Review Management Functions
  const handleUpdateReview = (review: Review) => {
    setHomepageReviews(prev => prev.map(r => r.id === review.id ? review : r));
  };

  const handleDeleteReview = (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setHomepageReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddReview = (review: Review) => {
    setHomepageReviews(prev => [...prev, review]);
  };

  const handleUpdateBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => prev.map(p => p.id === post.id ? post : p));
  };

  const handleDeleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => [...prev, post]);
  };

  // Why Mini Management Functions
  const handleUpdateWhyMiniScene = (scene: WhyMiniScene) => {
    setWhyMiniScenes(prev => prev.map(s => s.id === scene.id ? scene : s));
  };

  const handleDeleteWhyMiniScene = (id: string) => {
    if (confirm('Are you sure you want to delete this scene?')) {
      setWhyMiniScenes(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddWhyMiniScene = (scene: WhyMiniScene) => {
    setWhyMiniScenes(prev => [...prev, scene]);
  };

  const handleUpdateWhyMiniContent = (content: WhyMiniContent) => {
    setWhyMiniContent(content);
  };

  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      {/* SEO优化 */}
      <SEO 
        title={
          selectedProduct ? `${selectedProduct.name} | TinyTech` :
          selectedBlogPost ? `${selectedBlogPost.title} | TinyTech 博客` :
          'TinyTech | 精致迷你电子产品 - 小巧强大的科技生活'
        }
        description={
          selectedProduct ? selectedProduct.description :
          selectedBlogPost ? selectedBlogPost.excerpt :
          'TinyTech专注于打造精致、实用、时尚的迷你电子产品。包括超小手机、智能手表、迷你平板等，为追求品质生活的你提供完美的数字伴侣。'
        }
        image={selectedProduct?.image || selectedBlogPost?.image}
        jsonLd={
          selectedProduct ? productSchema(selectedProduct) :
          selectedBlogPost ? blogPostSchema(selectedBlogPost) :
          undefined
        }
      />

      {view !== 'admin' && (
        <Navbar
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          wishlistCount={wishlist.length}
          onCartClick={() => setIsCartOpen(true)}
          onNavigate={navigate}
          userLoggedIn={!!user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          currency={currency}
          onCurrencyChange={setCurrency}
          logoSettings={logoSettings}
        />
      )}

      <main className="flex-grow transition-all duration-300">
        {/* HOME VIEW */}
        {view === 'home' && (
          <>
            <BannerCarousel banners={banners} onNavigate={(v) => navigate(v as any)} />
            
            {/* Marquee Bar */}
            <MarqueeBar 
              items={[
                '🎉 Free Shipping for orders over $50',
                '⚡ Express Delivery in 24-48h',
                '🎁 20% Off on first order with code WELCOME20',
                '🔒 100% Secure Payment',
                '💝 Free Gift Wrapping',
                '⭐ Over 10,000 Satisfied Customers'
              ]}
              speed={40}
            />
            
            <FeaturesSection />
            
            {/* Featured Products Grid */}
            <section className="py-16 px-6 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black mb-4"><TranslatedText fallback="Featured Products" /></h2>
                  <p className="text-gray-500 font-bold"><TranslatedText fallback="Discover our collection of premium micro-electronics" /></p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.slice(0, 8).map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={(prod, color, variants) => {
                        const item: CartItem = {
                          ...prod,
                          quantity: 1,
                          selectedColor: color,
                          selectedVariants: variants
                        };
                        
                        const existingIndex = cart.findIndex(
                          i => i.id === item.id && 
                          i.selectedColor === item.selectedColor &&
                          JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
                        );
                        
                        if (existingIndex > -1) {
                          const newCart = [...cart];
                          newCart[existingIndex].quantity += 1;
                          setCart(newCart);
                        } else {
                          setCart(prev => [...prev, item]);
                        }
                        
                        setIsCartOpen(true);
                      }}
                      onViewDetails={(product) => {
                        setSelectedProduct(product);
                        navigate('product-detail');
                      }}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={(id) => {
                        setWishlist(prev =>
                          prev.includes(id)
                            ? prev.filter(wid => wid !== id)
                            : [...prev, id]
                        );
                      }}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            </section>

            <BrandStory data={brandStory} />
            <VerticalVideoShowcase />
            <SizeComparison />
            <ReviewMasonry reviews={homepageReviews} />
            <Newsletter />
            <FAQ />
          </>
        )}

        {/* PRODUCTS VIEW */}
        {view === 'products' && (
           <section className="pt-40 pb-24 px-6 min-h-screen bg-white">
             <div className="max-w-6xl mx-auto">
               <div className="flex justify-between items-end mb-16">
                 <div>
                   <h1 className="text-5xl font-black mb-4"><TranslatedText fallback="The Studio" /></h1>
                   <p className="text-gray-500 font-bold"><TranslatedText fallback="Premium micro-electronics designed in Tokyo" /></p>
                 </div>
                 <div className="flex bg-gray-100 p-1 rounded-2xl">
                      {(['all', 'phone', 'watch'] as const).map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${filter === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>
                          <TranslatedText fallback={cat === 'all' ? 'All' : cat === 'phone' ? 'Phones' : 'Watches'} />
                        </button>
                      ))}
                   </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                 {allProducts.filter(p => filter === 'all' || p.category === filter).map(product => (
                   <ProductCard 
                     key={product.id} 
                     product={product} 
                     onAddToCart={(prod, color, variants) => {
                       // Create a cart item with selected options
                       const item: CartItem = {
                         ...prod,
                         quantity: 1,
                         selectedColor: color,
                         selectedVariants: variants
                       };
                       
                       // Check if item with same variant combination already exists
                       const existingIndex = cart.findIndex(
                         i => i.id === item.id && 
                         i.selectedColor === item.selectedColor &&
                         JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
                       );
                       
                       if (existingIndex > -1) {
                         const newCart = [...cart];
                         newCart[existingIndex].quantity += 1;
                         setCart(newCart);
                       } else {
                         setCart(prev => [...prev, item]);
                       }
                       
                       setIsCartOpen(true);
                     }}
                     onViewDetails={() => { setSelectedProduct(product); navigate('product-detail'); }}
                     isWishlisted={wishlist.includes(product.id)}
                     onToggleWishlist={toggleWishlist}
                     formatPrice={formatPrice}
                   />
                 ))}
               </div>
             </div>
           </section>
        )}

        {/* PRODUCT DETAIL VIEW */}
        {view === 'product-detail' && selectedProduct && (
          <>
          <div className="bg-white">
            <div className="pt-24 sm:pt-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
                <button onClick={() => navigate('products')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                  <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Studio" />
                </button>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                <div className="flex flex-col lg:flex-row gap-16">
                  {/* Left Column - Sticky Images */}
                  <div className="w-full lg:w-1/2">
                    <div 
                      className="space-y-6"
                      style={{
                        position: 'sticky',
                        WebkitPosition: 'sticky',
                        top: '50px',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <div className="aspect-[4/5] rounded-[48px] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl relative">
                        <img src={activeImage || selectedProduct.image} className="w-full h-full object-cover transition-transform duration-700" alt={selectedProduct.name} />
                      </div>
                      <div 
                        ref={thumbsRef}
                        className="flex gap-4 overflow-x-auto no-scrollbar py-2"
                        onScroll={() => {
                        const el = thumbsRef.current;
                        if (!el) return;
                        const children = Array.from(el.children) as HTMLElement[];
                        if (children.length === 0) return;
                        const center = el.scrollLeft + el.clientWidth / 2;
                        let closestIdx = 0;
                        let minDist = Infinity;
                        children.forEach((child, i) => {
                          const childCenter = child.offsetLeft + child.clientWidth / 2;
                          const dist = Math.abs(childCenter - center);
                          if (dist < minDist) {
                            minDist = dist;
                            closestIdx = i;
                          }
                        });
                        const imgs = (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [selectedProduct.image];
                        if (imgs[closestIdx] && imgs[closestIdx] !== activeImage) {
                          setActiveImage(imgs[closestIdx]);
                        }
                      }}
                    >
                      {(selectedProduct.images && selectedProduct.images.length > 0 
                        ? selectedProduct.images 
                        : [selectedProduct.image]
                      ).map((img, idx) => (
                        <div key={idx} onClick={() => setActiveImage(img)} className={`w-24 h-28 rounded-3xl flex-shrink-0 cursor-pointer overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Product Info */}
                  <div className="w-full lg:w-1/2 space-y-10">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"><TranslatedText fallback="New Arrival" /></span>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <i className="fa-solid fa-star text-[10px]"></i>
                          <span className="text-xs font-black text-gray-900">{selectedProduct.rating}</span>
                        </div>
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                        {selectedProduct.name}
                      </h1>
                      
                      {/* Enhanced Promotion Bundle with Color and Variants */}
                      {selectedProduct.bundles && (
                        <PromotionBundle 
                          bundles={selectedProduct.bundles}
                          selectedBundleId={selectedBundleId}
                          onSelectBundle={setSelectedBundleId}
                          formatPrice={formatPrice}
                          colorOptions={selectedProduct.colorOptions}
                          selectedColor={selectedColor}
                          onColorSelect={(color, image) => {
                            setSelectedColor(color);
                            setActiveImage(image);
                          }}
                          variants={selectedProduct.variants}
                          selectedVariants={selectedVariants}
                          onVariantSelect={(type, optionId) => {
                            setSelectedVariants(prev => ({ ...prev, [type]: optionId }));
                          }}
                          onBundleItemsChange={(items) => {
                            setBundleItemSelections(items);
                          }}
                        />
                      )}

                      {/* Price Display with Bundle and Variants */}
                      <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider"><TranslatedText fallback="Total Price" /></span>
                          <div className="text-right">
                            <div className="text-3xl font-black text-gray-900">
                              {formatPrice((() => {
                                // Check if bundle is selected
                                if (selectedBundleId && selectedProduct.bundles) {
                                  const selectedBundle = selectedProduct.bundles.find(b => b.id === selectedBundleId);
                                  if (selectedBundle) {
                                    return selectedBundle.price;
                                  }
                                }
                                
                                // Otherwise calculate base price + variants
                                let price = selectedProduct.price;
                                if (selectedProduct.variants) {
                                  selectedProduct.variants.forEach(variant => {
                                    const selectedOptionId = selectedVariants[variant.type];
                                    const option = variant.options.find(o => o.id === selectedOptionId);
                                    if (option?.price) price += option.price;
                                  });
                                }
                                return price;
                              })())}
                            </div>
                            {(() => {
                              // Show original price for bundle or product
                              if (selectedBundleId && selectedProduct.bundles) {
                                const selectedBundle = selectedProduct.bundles.find(b => b.id === selectedBundleId);
                                if (selectedBundle?.originalPrice) {
                                  return <div className="text-sm text-gray-400 line-through">{formatPrice(selectedBundle.originalPrice)}</div>;
                                }
                              } else if (selectedProduct.originalPrice) {
                                return <div className="text-sm text-gray-400 line-through">{formatPrice(selectedProduct.originalPrice)}</div>;
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>

                      <button onClick={() => addToCart(selectedProduct)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 sm:py-6 rounded-2xl sm:rounded-[28px] font-black text-base sm:text-lg uppercase tracking-widest hover:from-indigo-700 hover:to-purple-700 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 mb-6 group">
                        <i className="fa-solid fa-cart-shopping group-hover:animate-bounce"></i>
                        <span><TranslatedText fallback="Add to Cart" /></span>
                        <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                      </button>

                      <div className="py-6 border-y border-gray-100 flex justify-between items-center px-4 mb-6">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shadow-md"><i className="fa-solid fa-check"></i></div>
                          <span className="text-[10px] font-black uppercase text-gray-900"><TranslatedText fallback="Ordered" /></span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-900 mx-2"></div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm shadow-md"><i className="fa-solid fa-truck-fast"></i></div>
                          <span className="text-[10px] font-black uppercase text-gray-900"><TranslatedText fallback="Ships soon" /></span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center text-sm"><i className="fa-solid fa-gift"></i></div>
                          <span className="text-[10px] font-black uppercase text-gray-300"><TranslatedText fallback="Delivered" /></span>
                        </div>
                      </div>
                    </div>
                  
                    {/* All detail sections in right column */}
                    {/* RESTORED LONG-FORM MARKETING SECTION (详情图) */}
                    {selectedProduct.fullDescription && (
                      <section className="py-8">
                        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
                          <h2 className="text-3xl font-black text-gray-900 mb-4">产品详情</h2>
                          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                            {selectedProduct.fullDescription}
                          </div>
                        </div>
                      </section>
                    )}
            
                    {selectedProduct.detailImages && selectedProduct.detailImages.length > 0 && (
                      <section className="py-10">
                        <div className="space-y-8">
                          <div className="text-center space-y-2 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 block"><TranslatedText fallback="Product Showcase" /></span>
                            <h2 className="text-4xl font-black text-gray-900"><TranslatedText fallback="Minimalism Perfected" /></h2>
                            <p className="text-gray-500 font-medium text-lg"><TranslatedText fallback="Every millimeter engineered for absolute performance" /></p>
                          </div>
                          {selectedProduct.detailImages.map((img, idx) => (
                            <div key={idx} className="relative group overflow-hidden rounded-[48px] shadow-2xl border border-gray-100">
                               <img 
                                src={img} 
                                className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-[1.03]" 
                                alt={`Product feature ${idx + 1}`} 
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60"></div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* HIGH-CONVERSION REVIEWS SECTION */}
                    <section className="py-16">
                      <div>
                        {/* Review Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                          <div className="flex items-center gap-6">
                            <div className="flex gap-1 text-yellow-400 text-xl">
                              {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star"></i>)}
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-xl font-black text-gray-900">{selectedProduct.reviews?.length || 0} Recensioni</span>
                              <i className="fa-solid fa-chevron-down text-gray-400 group-hover:text-gray-900 transition-colors"></i>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button className="bg-white border border-gray-200 text-gray-900 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
                              <TranslatedText fallback="Write a review" />
                            </button>
                            <button className="bg-white border border-gray-200 text-gray-900 w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:shadow-md transition-all">
                              <i className="fa-solid fa-sliders"></i>
                            </button>
                          </div>
                        </div>

                        {/* Masonry Review Grid */}
                        <div className="columns-1 md:columns-2 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
                          {selectedProduct.reviews?.map((r) => (
                            <div key={r.id} className="break-inside-avoid bg-white rounded-2xl sm:rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500">
                              {r.reviewImages?.[0] && (
                                <div className="aspect-[3/4] overflow-hidden">
                                  <img src={r.reviewImages[0]} className="w-full h-full object-cover" alt="Review" />
                                </div>
                              )}
                              <div className="p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                                  <h4 className="font-black text-xs sm:text-sm lg:text-base text-gray-900">{r.user}</h4>
                                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase">
                                    <i className="fa-solid fa-circle-check text-[10px] sm:text-xs"></i>
                                    <span className="hidden sm:inline">Verificata</span>
                                  </div>
                                </div>
                                <div className="flex gap-0.5 text-yellow-400 text-[9px] sm:text-[10px] mb-2 sm:mb-4">
                                  {[...Array(r.rating)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed mb-3 sm:mb-4 line-clamp-4 sm:line-clamp-6">
                                  {r.comment}
                                </p>
                                <div className="pt-3 sm:pt-4 border-t border-gray-50 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">
                                  <span className="truncate">{r.date}</span>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <i className="fa-regular fa-thumbs-up"></i>
                                    <span className="hidden sm:inline"><TranslatedText fallback="Helpful" /></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Product Specifications */}
                    {selectedProduct && <ProductSpecs product={selectedProduct} />}

                    {/* Product Guarantee Section */}
                    <ProductGuarantee />

                    {/* Product FAQ */}
                    <ProductFAQ />

                    {/* Related Products */}
                    <RelatedProducts 
                      products={PRODUCTS.filter(p => p.id !== selectedProduct?.id)} 
                      onProductClick={(product) => { 
                        setSelectedProduct(product); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {view === 'checkout' && (
          <Checkout
            cart={cart}
            subtotal={subtotal}
            shippingCost={0}
            total={subtotal - subtotal * checkoutDiscount}
            discountApplied={checkoutDiscount}
            onBack={() => {
              setIsCartOpen(true);
              navigate('home');
            }}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {view === 'order-success' && (
          <OrderSuccess
            orderId={currentOrderId}
            onContinueShopping={() => navigate('home')}
            onViewOrders={() => navigate('account')}
          />
        )}

        {view === 'blog' && (
          <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-16 sm:mb-20">
                <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600"><TranslatedText fallback="Our Stories" /></span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                  <TranslatedText fallback="Minimalist Journal" />
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                  <TranslatedText fallback="Insights, stories, and inspiration from the world of minimalist technology" />
                </p>
              </div>

              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {blogPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="group cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                    onClick={() => {
                      setSelectedBlogPost(post);
                      navigate('blog-detail');
                    }}
                  >
                    <div className="bg-white rounded-3xl sm:rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      {/* Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                        <img 
                          src={post.image} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={post.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400 font-bold">{post.date}</span>
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-black mb-3 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                          {post.title}
                        </h3>
                        
                        <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-4 transition-all duration-300">
                          <span><TranslatedText fallback="Read More" /></span>
                          <i className="fa-solid fa-arrow-right text-xs"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === 'blog-detail' && selectedBlogPost && (
          <BlogDetail
            post={selectedBlogPost}
            allPosts={blogPosts}
            onNavigate={navigate}
            onPostClick={(post) => {
              setSelectedBlogPost(post);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Contact Us Page */}
        {view === 'contact' && (
          <section className="pt-28 sm:pt-40 pb-24 px-6 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => navigate('home')} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Home" />
              </button>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-6"><TranslatedText fallback="Contact Us" /></h1>
              <p className="text-xl text-gray-500 mb-16"><TranslatedText fallback="We'd love to hear from you. Get in touch with our team" /></p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-envelope text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-lg mb-2"><TranslatedText fallback="Email" /></h3>
                      <p className="text-gray-600">support@tinytech.com</p>
                      <p className="text-gray-600">sales@tinytech.com</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-phone text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-lg mb-2"><TranslatedText fallback="Phone" /></h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EST</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-location-dot text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-lg mb-2"><TranslatedText fallback="Address" /></h3>
                      <p className="text-gray-600">123 Minimalist Street</p>
                      <p className="text-gray-600">San Francisco, CA 94102</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-3xl p-8">
                  <h3 className="font-black text-xl mb-6"><TranslatedText fallback="Send us a message" /></h3>
                  <form className="space-y-4">
                    <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    <input type="email" placeholder="Your email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    <textarea rows={4} placeholder="Your message" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"></textarea>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all"><TranslatedText fallback="Send Message" /></button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Return & Refund Policy Page */}
        {view === 'refund' && (
          <section className="pt-28 sm:pt-40 pb-24 px-6 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => navigate('home')} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Home" />
              </button>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-6"><TranslatedText fallback="Return & Refund Policy" /></h1>
              <p className="text-lg text-gray-500 mb-12">Last updated: January 2, 2026</p>
              
              <div className="prose prose-lg max-w-none space-y-8">
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <h2 className="text-2xl font-black mb-3 text-indigo-900"><TranslatedText fallback="30-Day Money Back Guarantee" /></h2>
                  <p className="text-gray-700"><TranslatedText fallback="We offer a hassle-free 30-day return policy. If you're not completely satisfied with your purchase, return it for a full refund" /></p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Return Eligibility" /></h2>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-3"><i className="fa-solid fa-check text-green-600 mt-1"></i><span>Items must be returned within 30 days of delivery</span></li>
                    <li className="flex gap-3"><i className="fa-solid fa-check text-green-600 mt-1"></i><span>Products must be in original condition with all accessories</span></li>
                    <li className="flex gap-3"><i className="fa-solid fa-check text-green-600 mt-1"></i><span>Original packaging should be intact when possible</span></li>
                    <li className="flex gap-3"><i className="fa-solid fa-check text-green-600 mt-1"></i><span>Proof of purchase required</span></li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Return Process" /></h2>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex gap-3"><span className="font-black text-indigo-600">1.</span><span>Contact our support team at support@tinytech.com</span></li>
                    <li className="flex gap-3"><span className="font-black text-indigo-600">2.</span><span>Receive your RMA (Return Merchandise Authorization) number</span></li>
                    <li className="flex gap-3"><span className="font-black text-indigo-600">3.</span><span>Pack your item securely with the RMA number visible</span></li>
                    <li className="flex gap-3"><span className="font-black text-indigo-600">4.</span><span>Ship to our returns center (free return shipping)</span></li>
                    <li className="flex gap-3"><span className="font-black text-indigo-600">5.</span><span>Refund processed within 5-7 business days after receipt</span></li>
                  </ol>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Refund Method" /></h2>
                  <p className="text-gray-700">Refunds will be issued to the original payment method. Please allow 5-7 business days for the refund to appear in your account after we receive your return.</p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Exchanges" /></h2>
                  <p className="text-gray-700">If you'd like to exchange your product for a different model or color, simply return the original item and place a new order. We'll expedite the processing of your new order.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Privacy Policy & ToS Page */}
        {view === 'privacy' && (
          <section className="pt-28 sm:pt-40 pb-24 px-6 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => navigate('home')} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Home" />
              </button>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-6"><TranslatedText fallback="Privacy Policy & Terms of Service" /></h1>
              <p className="text-lg text-gray-500 mb-12">Last updated: January 2, 2026</p>
              
              <div className="prose prose-lg max-w-none space-y-8">
                <div>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Privacy Policy" /></h2>
                  <p className="text-gray-700 mb-4">At TinyTech, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Information We Collect</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Personal information (name, email, shipping address)</li>
                    <li>• Payment information (processed securely through encrypted channels)</li>
                    <li>• Device and usage data (IP address, browser type, pages visited)</li>
                    <li>• Cookies and tracking technologies for improved user experience</li>
                  </ul>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">How We Use Your Information</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Process and fulfill your orders</li>
                    <li>• Send order confirmations and shipping updates</li>
                    <li>• Provide customer support</li>
                    <li>• Improve our products and services</li>
                    <li>• Send promotional emails (you can opt-out anytime)</li>
                  </ul>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Data Protection</h3>
                  <p className="text-gray-700">We implement industry-standard security measures to protect your data. Your payment information is encrypted and never stored on our servers. We do not sell or share your personal information with third parties without your consent.</p>
                </div>
                
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Terms of Service" /></h2>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Use of Our Website</h3>
                  <p className="text-gray-700">By accessing TinyTech.com, you agree to these terms. You must be at least 18 years old to make purchases. All content on this site is protected by copyright and intellectual property laws.</p>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Product Information</h3>
                  <p className="text-gray-700">We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is error-free. We reserve the right to correct errors and update information at any time.</p>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Order Acceptance</h3>
                  <p className="text-gray-700">All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including product unavailability or pricing errors.</p>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Warranty</h3>
                  <p className="text-gray-700">All TinyTech products come with a standard 1-year manufacturer's warranty covering defects in materials and workmanship. This warranty does not cover accidental damage or normal wear and tear.</p>
                  
                  <h3 className="text-xl font-black mb-3 mt-6">Limitation of Liability</h3>
                  <p className="text-gray-700">TinyTech shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 mt-8">
                  <h3 className="text-xl font-black mb-3">Contact Us</h3>
                  <p className="text-gray-700">If you have any questions about our Privacy Policy or Terms of Service, please contact us at legal@tinytech.com</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About Us Page */}
        {view === 'about' && (
          <section className="pt-28 sm:pt-40 pb-24 px-6 min-h-screen bg-white">
            <div className="max-w-4xl mx-auto">
              <button onClick={() => navigate('home')} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Home" />
              </button>
              
              <h1 className="text-4xl sm:text-5xl font-black mb-6"><TranslatedText fallback="About TinyTech" /></h1>
              <p className="text-xl text-gray-500 mb-12"><TranslatedText fallback="Redefining technology for the modern minimalist" /></p>
              
              <div className="space-y-12">
                <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 mb-12">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200" className="w-full h-full object-cover" alt="Office" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-black mb-4"><TranslatedText fallback="Our Story" /></h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    Founded in 2020, TinyTech was born from a simple observation: technology keeps getting bigger, heavier, and more complicated. We asked ourselves—does it have to be this way?
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Our mission is to create powerful, beautifully designed devices that fit seamlessly into your minimalist lifestyle. Every product we make is engineered to maximize performance while minimizing size and complexity.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-black text-indigo-600 mb-2">500K+</div>
                    <p className="text-gray-600 font-bold">Customers Worldwide</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-indigo-600 mb-2">15+</div>
                    <p className="text-gray-600 font-bold">Product Lines</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-indigo-600 mb-2">98%</div>
                    <p className="text-gray-600 font-bold">Satisfaction Rate</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-black mb-4"><TranslatedText fallback="Our Values" /></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-minimize text-indigo-600"></i>
                      </div>
                      <h3 className="font-black text-xl mb-2">Minimalism</h3>
                      <p className="text-gray-600">Less is more. We eliminate the unnecessary to highlight what truly matters.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-bolt text-indigo-600"></i>
                      </div>
                      <h3 className="font-black text-xl mb-2">Performance</h3>
                      <p className="text-gray-600">Compact size doesn't mean compromised power. Flagship performance in every device.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-leaf text-indigo-600"></i>
                      </div>
                      <h3 className="font-black text-xl mb-2">Sustainability</h3>
                      <p className="text-gray-600">Eco-friendly materials and responsible manufacturing practices.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                        <i className="fa-solid fa-heart text-indigo-600"></i>
                      </div>
                      <h3 className="font-black text-xl mb-2">Customer First</h3>
                      <p className="text-gray-600">Your satisfaction is our priority. Premium support and hassle-free returns.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
                  <h2 className="text-3xl font-black mb-4"><TranslatedText fallback="Join the Minimalist Revolution" /></h2>
                  <p className="text-lg mb-6 opacity-90"><TranslatedText fallback="Experience technology the way it should be—simple, powerful, and beautifully designed" /></p>
                  <button onClick={() => navigate('products')} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-black hover:shadow-xl transition-all">
                    <TranslatedText fallback="Explore Products" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Use Cases / Why Mini Page */}
        {view === 'lifestyle' && (
          <section className="pt-24 sm:pt-32 pb-20 px-6 min-h-screen bg-white">
            <div className="max-w-6xl mx-auto">
              <button onClick={() => navigate('home')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
                <i className="fa-solid fa-arrow-left"></i> <TranslatedText fallback="Back to Home" />
              </button>
              
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">{whyMiniContent.pageTitle}</h1>
                <p className="text-xl sm:text-2xl text-gray-500 max-w-3xl mx-auto">{whyMiniContent.pageSubtitle}</p>
              </div>
              
              <div className="space-y-16">
                {whyMiniScenes
                  .filter(scene => scene.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((scene, index) => {
                    const isEven = index % 2 === 0;
                    const colorClass = 
                      scene.tagColor === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                      scene.tagColor === 'purple' ? 'bg-purple-100 text-purple-600' :
                      scene.tagColor === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600';
                    
                    const gradientClass =
                      scene.tagColor === 'indigo' ? 'from-indigo-100 to-purple-100' :
                      scene.tagColor === 'purple' ? 'from-purple-100 to-pink-100' :
                      scene.tagColor === 'green' ? 'from-green-100 to-teal-100' :
                      'from-orange-100 to-red-100';

                    return (
                      <div key={scene.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`}>
                        <div className={isEven ? 'order-2 lg:order-1' : 'order-1'}>
                          <div className={`inline-block ${colorClass} px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6`}>
                            {scene.tag}
                          </div>
                          <h2 className="text-3xl sm:text-4xl font-black mb-6">{scene.title}</h2>
                          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            {scene.description}
                          </p>
                          <ul className="space-y-3 text-gray-700">
                            {scene.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <i className="fa-solid fa-check-circle text-green-600 mt-1"></i>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={isEven ? 'order-1 lg:order-2' : 'order-2'}>
                          <div className={`aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${gradientClass} shadow-2xl`}>
                            <img src={scene.image} className="w-full h-full object-cover" alt={scene.title} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* CTA Section */}
              <div className="mt-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 sm:p-16 text-white text-center">
                <h2 className="text-3xl sm:text-4xl font-black mb-6">{whyMiniContent.ctaTitle}</h2>
                <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  {whyMiniContent.ctaDescription}
                </p>
                <button onClick={() => navigate('products')} className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl transition-all inline-flex items-center gap-3">
                  <span>{whyMiniContent.ctaButtonText}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'account' && (
          <section className="pt-40 pb-24 px-6 min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-5xl font-black mb-12"><TranslatedText fallback="My Account" /></h1>
              
              {user ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl font-black text-indigo-600 mb-4">
                        {user.name.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-black mb-2">{user.name}</h2>
                      <p className="text-gray-500 mb-6">{user.email}</p>
                      <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
                      <h3 className="text-2xl font-black mb-6"><TranslatedText fallback="Order History" /></h3>
                      {user.orders.length === 0 ? (
                        <div className="text-center py-12">
                          <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
                          <p className="text-gray-500 font-medium"><TranslatedText fallback="No orders yet" /></p>
                          <button
                            onClick={() => navigate('products')}
                            className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                          >
                            <TranslatedText fallback="Start Shopping" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {user.orders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-600 transition-all">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-black text-gray-900">{order.id}</p>
                                  <p className="text-sm text-gray-500">{order.date}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="space-y-2 mb-4">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50">
                                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-sm">{item.name}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-black">€{item.price}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <p className="font-black text-lg">Total: €{order.total.toFixed(2)}</p>
                                <button className="text-indigo-600 hover:text-indigo-700 font-bold text-sm">
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <i className="fa-solid fa-user-circle text-6xl text-gray-300 mb-4"></i>
                  <h2 className="text-2xl font-black mb-4"><TranslatedText fallback="Please Log In" /></h2>
                  <p className="text-gray-500 mb-8"><TranslatedText fallback="Sign in to view your account and orders" /></p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all"
                  >
                    <TranslatedText fallback="Sign In" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

      {view === 'track' && (
        <section className="pt-40 pb-24 px-6 min-h-screen bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-black mb-8"><TranslatedText fallback="Track Your Order" /></h1>
            <p className="text-gray-500 mb-12 text-lg"><TranslatedText fallback="Enter your order ID to track your shipment" /></p>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter Order ID"
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                />
                <button
                  onClick={handleTrack}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black hover:bg-indigo-700 transition-all whitespace-nowrap"
                >
                  <i className="fa-solid fa-search mr-2"></i>
                  <TranslatedText fallback="Track" />
                </button>
              </div>
            </div>

            {trackingResult && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 mb-1"><TranslatedText fallback="Order ID" /></p>
                    <p className="text-2xl font-black">{trackingResult.id}</p>
                  </div>
                  <span className={`px-6 py-3 rounded-full font-bold ${
                    trackingResult.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    trackingResult.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {trackingResult.status}
                  </span>
                </div>

                <div className="space-y-6 mb-8">
                  {trackingResult.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg">{item.name}</p>
                        <p className="text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-black text-xl">€{item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                          trackingResult.status === 'Processing' || trackingResult.status === 'Shipped' || trackingResult.status === 'Delivered'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <i className="fa-solid fa-check"></i>
                        </div>
                        {trackingResult.status !== 'Processing' && (
                          <div className="w-0.5 h-16 bg-green-600 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="font-black text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-500">{trackingResult.date}</p>
                      </div>
                    </div>

                    {(trackingResult.status === 'Shipped' || trackingResult.status === 'Delivered') && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            <i className="fa-solid fa-truck"></i>
                          </div>
                          {trackingResult.status === 'Delivered' && (
                            <div className="w-0.5 h-16 bg-green-600 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="font-black text-gray-900"><TranslatedText fallback="Shipped" /></p>
                          <p className="text-sm text-gray-500"><TranslatedText fallback="In transit" /></p>
                        </div>
                      </div>
                    )}

                    {trackingResult.status === 'Delivered' && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                            <i className="fa-solid fa-box-check"></i>
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="font-black text-gray-900"><TranslatedText fallback="Delivered" /></p>
                          <p className="text-sm text-gray-500"><TranslatedText fallback="Package delivered" /></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Wishlist View */}
        {view === 'wishlist' && (
          <div className="flex-grow">
            <Wishlist
              wishlistIds={wishlist}
              allProducts={allProducts}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
              onViewDetails={(product) => {
                setSelectedProduct(product);
                setView('product-detail');
                window.scrollTo(0, 0);
              }}
              formatPrice={formatPrice}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      {view !== 'admin' && (
        <footer className="bg-gray-900 pt-24 pb-12 px-6 text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('home')}>
                {logoSettings?.footerLogo?.image ? (
                  <img 
                    src={logoSettings.footerLogo.image}
                    alt="Footer Logo"
                    style={{ 
                      width: logoSettings.footerLogo.width,
                      height: logoSettings.footerLogo.height
                    }}
                    className="object-contain"
                  />
                ) : (
                  <div className="bg-white text-indigo-600 w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center">TT</div>
                )}
                <span className="font-black text-2xl tracking-tighter">{logoSettings?.footerLogo?.text || 'TinyTech'}</span>
              </div>
              <p className="text-gray-400 max-w-sm text-lg leading-relaxed"><TranslatedText fallback="Designing micro-tech for the modern minimalist. Reclaim your time and pocket space with flagship performance." /></p>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase text-[10px] tracking-widest text-indigo-400"><TranslatedText fallback="Company" /></h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><button onClick={() => navigate('about')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="About Us" /></button></li>
                <li><button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Contact Us" /></button></li>
                <li><button onClick={() => navigate('lifestyle')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Why Mini?" /></button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase text-[10px] tracking-widest text-indigo-400"><TranslatedText fallback="Support" /></h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><button onClick={() => navigate('track')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Track Order" /></button></li>
                <li><button onClick={() => navigate('refund')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Return & Refund" /></button></li>
                <li><button onClick={() => navigate('privacy')} className="text-gray-400 hover:text-white transition-colors"><TranslatedText fallback="Privacy & ToS" /></button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase text-[10px] tracking-widest text-indigo-400"><TranslatedText fallback="Newsletter" /></h4>
              <div className="flex flex-col gap-3">
                <TranslatedInput 
                  type="email" 
                  placeholderFallback="Email address" 
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none" 
                />
                <button className="bg-white text-gray-900 py-4 rounded-2xl font-black"><TranslatedText fallback="Subscribe" /></button>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <p><TranslatedText fallback="© 2024 TinyTech Electronics. Handcrafted for minimalists." /></p>
          </div>
        </div>
      </footer>
      )}

      {view !== 'admin' && view !== 'checkout' && (
        <>
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cart}
            onRemove={removeFromCart}
            onUpdateQty={updateCartQty}
            onStartCheckout={(discountApplied) => {
              setCheckoutDiscount(discountApplied);
              setIsCartOpen(false);
              navigate('checkout');
            }}
          />
          <AIConsultant />
        </>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && view !== 'admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black"><TranslatedText fallback="Welcome Back" /></h2>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-times text-gray-600"></i>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2"><TranslatedText fallback="Email" /></label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2"><TranslatedText fallback="Password" /></label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                const emailInput = (e.currentTarget.parentElement?.querySelector('input[type="email"]') as HTMLInputElement)?.value;
                const passwordInput = (e.currentTarget.parentElement?.querySelector('input[type="password"]') as HTMLInputElement)?.value;
                handleLogin(emailInput, passwordInput);
              }}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all mb-4"
            >
              <TranslatedText fallback="Sign In" />
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                <TranslatedText fallback="Don't have an account?" />{' '}
                <button className="text-indigo-600 font-bold hover:text-indigo-700">
                  <TranslatedText fallback="Sign Up" />
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  <i className="fa-brands fa-google mr-2 text-red-500"></i>
                  Google
                </button>
                <button className="py-3 px-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  <i className="fa-brands fa-facebook mr-2 text-blue-600"></i>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <AdminDashboard
          products={allProducts}
          orders={allOrders}
          users={allUsers}
          banners={banners}
          features={features}
          brandStory={brandStory}
          videos={videos}
          newsletter={newsletter}
          sizeComparison={sizeComparison}
          faqs={faqs}
          homepageReviews={homepageReviews}
          blogPosts={blogPosts}
          whyMiniScenes={whyMiniScenes}
          whyMiniContent={whyMiniContent}
          logoSettings={logoSettings}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddProduct={handleAddProduct}
          onUpdateOrder={handleUpdateOrder}
          onUpdateBanner={handleUpdateBanner}
          onDeleteBanner={handleDeleteBanner}
          onAddBanner={handleAddBanner}
          onUpdateFeature={handleUpdateFeature}
          onDeleteFeature={handleDeleteFeature}
          onAddFeature={handleAddFeature}
          onUpdateBrandStory={handleUpdateBrandStory}
          onUpdateVideo={handleUpdateVideo}
          onDeleteVideo={handleDeleteVideo}
          onAddVideo={handleAddVideo}
          onUpdateNewsletter={handleUpdateNewsletter}
          onUpdateSizeComparison={handleUpdateSizeComparison}
          onUpdateFAQ={handleUpdateFAQ}
          onDeleteFAQ={handleDeleteFAQ}
          onAddFAQ={handleAddFAQ}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
          onAddReview={handleAddReview}
          onUpdateBlogPost={handleUpdateBlogPost}
          onDeleteBlogPost={handleDeleteBlogPost}
          onAddBlogPost={handleAddBlogPost}
          onUpdateWhyMiniScene={handleUpdateWhyMiniScene}
          onDeleteWhyMiniScene={handleDeleteWhyMiniScene}
          onAddWhyMiniScene={handleAddWhyMiniScene}
          onUpdateWhyMiniContent={handleUpdateWhyMiniContent}
          onUpdateLogoSettings={setLogoSettings}
          onNavigate={navigate}
        />

      )}

      {/* Promo Modal */}
      {showPromoModal && view !== 'admin' && (
        <PromoModal
          onClose={() => setShowPromoModal(false)}
          onClaim={() => {
            // Handle promo claim - could add to newsletter, apply discount, etc.
            alert('Sconto del 20% applicato! Codice: WELCOME20');
          }}
        />
      )}
      </div>
    </TranslationProvider>
  );
};

export default App;
