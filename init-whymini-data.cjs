// 初始化 Why Mini 数据到数据库
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aidtulrpkxvlyjbvqxhd.supabase.co';
const supabaseKey = 'sb_publishable__qjxv46ac2RcSH59L49ubQ_tbxNnfQo';

const supabase = createClient(supabaseUrl, supabaseKey);

const whyMiniScenes = [
  {
    id: 'scene-1',
    tag: 'FOR FOCUS',
    tagColor: 'indigo',
    title: 'Study for Exams / Prevent Distraction at Work',
    description: 'When preparing for exams or needing deep work, the mini phone keeps you focused. No endless social media scrolling, no distracting notifications. Only essential communication features to help you stay efficient.',
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767870370/boke4_vkn3gk.webp',
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
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767870370/boke4_vkn3gk.webp',
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
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767870370/boke4_vkn3gk.webp',
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
    image: 'https://res.cloudinary.com/dbwd1fo6k/image/upload/v1767870370/boke4_vkn3gk.webp',
    benefits: [
      'Ultra-light weight, almost unnoticeable when running',
      'Compact size, won\'t shake during movement',
      'Keep music and calling features'
    ],
    order: 3,
    isActive: true
  }
];

async function initData() {
  console.log('🚀 初始化 Why Mini 数据到数据库...\n');
  
  for (const scene of whyMiniScenes) {
    console.log(`📝 添加场景: ${scene.tag}...`);
    
    const { error } = await supabase
      .from('site_content')
      .insert({
        type: 'why_mini_scene',
        content: scene,
        order_index: scene.order,
        is_active: true
      });
    
    if (error) {
      console.log(`   ❌ 失败: ${error.message}`);
    } else {
      console.log(`   ✅ 成功!`);
    }
  }
  
  console.log('\n========================================');
  console.log('✅ Why Mini 数据初始化完成!');
}

initData();
