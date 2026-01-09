
import { Product, BlogPost, VideoShowcase, Review } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'TinyTalk Pro S1',
    category: 'phone',
    price: 199,
    rating: 4.8,
    stockLevel: 15,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    colorOptions: [
      { name: 'Blue', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=100' },
      { name: 'Orange', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=100' },
      { name: 'Black', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=100' },
      { name: 'Silver', image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=100' }
    ],
    variants: [
      {
        type: 'storage',
        label: 'Storage',
        options: [
          { id: '64gb', name: '64GB', price: 0, inStock: true },
          { id: '128gb', name: '128GB', price: 30, inStock: true },
          { id: '256gb', name: '256GB', price: 60, inStock: true }
        ]
      },
      {
        type: 'memory',
        label: 'RAM',
        options: [
          { id: '4gb', name: '4GB', price: 0, inStock: true },
          { id: '8gb', name: '8GB', price: 20, inStock: true },
          { id: '12gb', name: '12GB', price: 40, inStock: false }
        ]
      }
    ],
    bundles: [
      { id: 'b1', name: 'Single', count: 1, price: 199, originalPrice: 249, savingsLabel: 'Save 20%' },
      { id: 'b2', name: 'Duo', count: 2, price: 349, originalPrice: 498, savingsLabel: 'Save 35%', isPopular: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1520923179270-ee0e79f9fa06?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551817958-11e0f7bbe4d0?auto=format&fit=crop&q=80&w=800'
    ],
    detailImages: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'The world\'s most powerful 3.0" smartphone. Fits in your coin pocket.',
    fullDescription: 'Designed for the minimalist professional. The S1 doesn\'t compromise on power, featuring a flagship chipset in a chassis no larger than a business card. Perfect for secondary devices or digital detox days.',
    specs: {
      screen: '3.0" LTPS Display (400 PPI)',
      battery: '2500mAh (High-Density)',
      storage: '128GB + 8GB RAM',
      chipset: 'Helio G99 Octa-core'
    },
    features: ['Face Unlock', 'Android 13', 'Full Google Play Support', 'Dual SIM', 'NFC Payment'],
    reviews: [
      {
        id: 'r1',
        user: 'Emma N.',
        rating: 5,
        comment: 'Ho comprato il pocketX Pro per mia sorella, lo porta sempre in borsa e lo trova comodissimo per lavoro e social.',
        date: '2 days ago',
        reviewImages: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600']
      },
      {
        id: 'r2',
        user: 'Mattia G.',
        rating: 5,
        comment: 'Il PocketX Pro è il regalo di Natale ideale per bambini: piccolo, leggero e completo. Comprandone più di uno, ho anche risparmiato sul totale.',
        date: '1 week ago',
        reviewImages: ['https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&q=80&w=600']
      },
      {
        id: 'r3',
        user: 'Ginevra C.',
        rating: 5,
        comment: 'Il mio pocketX pro è perfetto come mini smartphone da portare ovunque, soprattutto quando viaggio in città.',
        date: '3 days ago',
        reviewImages: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbea?auto=format&fit=crop&q=80&w=600']
      },
      {
        id: 'r4',
        user: 'Alice S.',
        rating: 5,
        comment: 'Ho preso tre PocketX Pro per Natale e ho risparmiato molto comprando più dispositivi. I bambini li adorano!',
        date: 'Just now',
        reviewImages: ['https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=600']
      }
    ]
  },
  {
    id: 'w1',
    name: 'ZenWatch Ultra',
    category: 'watch',
    price: 249,
    rating: 4.9,
    stockLevel: 8,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    colorOptions: [
      { name: 'White', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100' },
      { name: 'Black', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=100' },
      { name: 'Silver', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=100' }
    ],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      {
        type: 'band',
        label: 'Watch Band',
        options: [
          { id: 'silicone', name: 'Silicone', price: 0, inStock: true },
          { id: 'leather', name: 'Leather', price: 35, inStock: true },
          { id: 'metal', name: 'Metal Link', price: 50, inStock: true }
        ]
      },
      {
        type: 'size',
        label: 'Case Size',
        options: [
          { id: '42mm', name: '42mm', price: 0, inStock: true },
          { id: '46mm', name: '46mm', price: 20, inStock: true }
        ]
      }
    ],
    bundles: [
      { id: 'bw1', name: 'Single', count: 1, price: 249, originalPrice: 299, savingsLabel: 'Save 15%' },
      { id: 'bw2', name: 'Duo', count: 2, price: 449, originalPrice: 598, savingsLabel: 'Save 25%', isPopular: true }
    ],
    description: 'A complete smartphone on your wrist. 4G LTE standalone connectivity.',
    specs: { screen: '2.02" AMOLED', battery: '1000mAh', storage: '32GB' },
    features: ['GPS', 'Heart Rate', 'LTE'],
    reviews: []
  }
];

export const VIDEO_SHOWCASE: VideoShowcase[] = [
  { id: 'v1', title: 'Unboxing S1', thumbnail: 'https://images.unsplash.com/photo-1605170439002-90f450c99706?auto=format&fit=crop&q=80&w=600', productTag: 'TinyTalk Pro S1', views: '1.2M' }
];

export const BLOG_POSTS: BlogPost[] = [
  { id: 'b1', title: 'The Rise of Mini', excerpt: 'Why small is big.', content: '...', date: 'Dec 15', image: 'https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&q=80&w=800', category: 'Lifestyle' }
];

export const ALL_REVIEWS: Review[] = [
  {
    id: 'ar1',
    user: 'Emma N.',
    rating: 5,
    comment: 'I bought the PocketX Pro for my sister, she always carries it in her bag and finds it super convenient for work and social media.',
    date: '2 days ago',
    reviewImages: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar2',
    user: 'Matt G.',
    rating: 5,
    comment: 'The PocketX Pro is the ideal Christmas gift for kids: small, lightweight and complete. By buying more than one, I also saved on the total.',
    date: '1 week ago',
    reviewImages: ['https://images.unsplash.com/photo-1556656793-062ff9878258?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar3',
    user: 'Jenny C.',
    rating: 5,
    comment: 'My PocketX Pro is perfect as a mini smartphone to carry everywhere, especially when traveling in the city.',
    date: '3 days ago',
    reviewImages: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbea?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar4',
    user: 'Alice S.',
    rating: 5,
    comment: 'I got three PocketX Pros for Christmas and saved a lot by buying multiple devices. The kids love them!',
    date: 'Just now',
    reviewImages: ['https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar5',
    user: 'Mark R.',
    rating: 5,
    comment: 'Finally a pocket smartphone that doesn\'t sacrifice anything! Perfect for running and the gym.',
    date: '5 days ago',
    reviewImages: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar6',
    user: 'Sophie L.',
    rating: 4,
    comment: 'Great product, incredible dimensions. Only downside: it takes a bit to get used to the small screen.',
    date: '2 weeks ago'
  },
  {
    id: 'ar7',
    user: 'Luke T.',
    rating: 5,
    comment: 'I use it as a second phone for work. Lightweight, fast and the battery lasts all day!',
    date: '1 month ago',
    reviewImages: ['https://images.unsplash.com/photo-1520923179270-ee0e79f9fa06?auto=format&fit=crop&q=80&w=600']
  },
  {
    id: 'ar8',
    user: 'Fran M.',
    rating: 5,
    comment: 'Perfect for nights out when I don\'t want to carry a bag. Fits in my pocket!',
    date: '3 weeks ago',
    reviewImages: ['https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=600']
  }
];

