
export interface ColorOption {
  name: string;
  image: string;
}

export interface VariantOption {
  id: string;
  name: string;
  price?: number; // 额外价格，如果为0或undefined则使用基础价格
  inStock: boolean;
}

export interface ProductVariant {
  type: 'storage' | 'size' | 'memory' | 'band' | 'custom';
  label: string;
  options: VariantOption[];
}

export interface BundleDeal {
  id: string;
  name: string;
  count: number;
  price: number;
  originalPrice: number;
  savingsLabel: string;
  isPopular?: boolean;
  includes?: string[]; // 套餐包含的物品列表
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
  reviewImages?: string[];
}

export interface VideoShowcase {
  id: string;
  title: string;
  thumbnail: string;
  productTag: string;
  views: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'phone' | 'watch' | 'accessory';
  price: number;
  rating: number;
  image: string;
  images?: string[];
  detailImages?: string[];
  description: string;
  fullDescription?: string;
  stockLevel: number;
  colorOptions?: ColorOption[];
  variants?: ProductVariant[]; // 新增变体选项
  bundles?: BundleDeal[];
  specs: {
    screen?: string;
    battery: string;
    storage?: string;
    chipset?: string;
    material?: string;
  };
  features: string[];
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedVariants?: { [key: string]: string }; // 存储选中的变体，如 { storage: "128GB", size: "Large" }
  bundleId?: string;
  bundleItems?: Array<{
    color?: string;
    variants?: { [key: string]: string };
  }>; // 用于存储bundle中每件商品的独立选择
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  address: string;
}

export interface User {
  name: string;
  email: string;
  wishlist: string[];
  orders: Order[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  order: number;
  isActive: boolean;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface BrandStoryContent {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  secondDescription: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  badgeText1: string;
  badgeText2: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
}

export interface VideoContent {
  id: string;
  title: string;
  thumbnail: string;
  productTag: string;
  views: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
}

export interface NewsletterContent {
  id: string;
  icon: string;
  title: string;
  description: string;
  discountText: string;
  placeholderText: string;
  buttonText: string;
  privacyText: string;
  badge1Text: string;
  badge2Text: string;
  badge3Text: string;
  backgroundColor: string;
}

export interface SizeComparisonContent {
  id: string;
  title: string;
  description: string;
  button1Text: string;
  button1Value: string;
  button2Text: string;
  button2Value: string;
  feature1Icon: string;
  feature1Title: string;
  feature1Description: string;
  feature2Icon: string;
  feature2Title: string;
  feature2Description: string;
  standardPhoneLabel: string;
  backgroundColor: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface WhyMiniScene {
  id: string;
  tag: string;
  tagColor: string; // e.g., 'indigo', 'purple', 'green', 'orange'
  title: string;
  description: string;
  image: string;
  benefits: string[]; // Array of 3 benefit points
  order: number;
  isActive: boolean;
}

export interface WhyMiniContent {
  pageTitle: string;
  pageSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
}

export interface LogoSettings {
  headerLogo: {
    image: string;
    text: string;
    width: number;
    height: number;
  };
  footerLogo: {
    image: string;
    text: string;
    width: number;
    height: number;
  };
}
