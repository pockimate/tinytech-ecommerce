// 修复 Banner 颜色的脚本
// 在浏览器控制台运行

console.log('🔧 修复 Banner 颜色...');

// 检查当前的 banners 数据
const currentBanners = JSON.parse(localStorage.getItem('tinytech_banners') || '[]');
console.log('当前 banners 数据:', currentBanners);

// 修复缺失的 backgroundColor
const fixedBanners = currentBanners.map((banner, index) => {
  const defaultColors = [
    'from-indigo-600 to-purple-600',
    'from-blue-600 to-cyan-600', 
    'from-rose-600 to-pink-600'
  ];
  
  if (!banner.backgroundColor) {
    banner.backgroundColor = defaultColors[index % defaultColors.length];
    console.log(`✅ 修复 banner ${banner.id} 的颜色: ${banner.backgroundColor}`);
  }
  
  return banner;
});

// 保存修复后的数据
localStorage.setItem('tinytech_banners', JSON.stringify(fixedBanners));
console.log('🎉 Banner 颜色修复完成！请刷新页面查看效果。');

// 显示修复后的数据
console.log('修复后的 banners:', fixedBanners);