const fs = require('fs');

// Read the file
const filePath = 'components/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace English text with Chinese
const replacements = [
  // Tabs
  ["label: 'Data Overview'", "label: '数据概览'"],
  ["label: 'Homepage Management'", "label: '首页管理'"],
  ["label: 'Product Management'", "label: '商品管理'"],
  ["label: 'Blog Management'", "label: '博客管理'"],
  ["label: 'Why Mini Management'", "label: 'Why Mini'"],
  ["label: 'Order Management'", "label: '订单管理'"],
  ["label: 'User Management'", "label: '用户管理'"],
  ["label: 'Review Management'", "label: '评价管理'"],
  ["label: 'System Settings'", "label: '系统设置'"],
  
  // Stats cards
  [">Total Revenue<", ">总收入<"],
  [">Total Orders<", ">总订单<"],
  [">Registered User<", ">注册用户<"],
  [">Product on Sale<", ">在售商品<"],
  
  // Headers and buttons
  [">Recent Orders<", ">最近订单<"],
  [">View All<", ">查看全部<"],
  [">Order ID<", ">订单号<"],
  [">Customer<", ">客户<"],
  [">Amount<", ">金额<"],
  [">Status<", ">状态<"],
  [">Actions<", ">操作<"],
  [">Edit<", ">编辑<"],
  [">Delete<", ">删除<"],
  [">Save<", ">保存<"],
  [">Cancel<", ">取消<"],
  [">Add<", ">添加<"],
  [">Close<", ">关闭<"],
  [">Back to Website<", ">返回网站<"],
  [">Admin Dashboard<", ">管理后台<"],
  ["Manage your e-commerce platform", "管理您的电商平台"],
  
  // Form labels
  [">Title<", ">标题<"],
  [">Subtitle<", ">副标题<"],
  [">Description<", ">描述<"],
  [">Image URL<", ">图片链接<"],
  [">Price<", ">价格<"],
  [">Original Price<", ">原价<"],
  [">Stock<", ">库存<"],
  [">Category<", ">分类<"],
  [">Name<", ">名称<"],
  [">Email<", ">邮箱<"],
  [">Phone<", ">电话<"],
  [">Address<", ">地址<"],
  [">Date<", ">日期<"],
  [">Rating<", ">评分<"],
  [">Comment<", ">评论<"],
  [">Content<", ">内容<"],
  [">Author<", ">作者<"],
  [">Excerpt<", ">摘要<"],
  [">Button Text<", ">按钮文字<"],
  [">Button Link<", ">按钮链接<"],
  [">Background Color<", ">背景颜色<"],
  [">Icon<", ">图标<"],
  [">Order<", ">排序<"],
  [">Active<", ">启用<"],
  [">Question<", ">问题<"],
  [">Answer<", ">答案<"],
  [">Tag<", ">标签<"],
  [">Tag Color<", ">标签颜色<"],
  [">Benefits<", ">优势<"],
  [">Video URL<", ">视频链接<"],
  [">Thumbnail<", ">缩略图<"],
  [">Product Tag<", ">产品标签<"],
  [">Views<", ">浏览量<"],
  
  // Section titles
  [">Banner Management<", ">轮播图管理<"],
  [">Feature Management<", ">特性管理<"],
  [">Brand Story<", ">品牌故事<"],
  [">Video Management<", ">视频管理<"],
  [">Newsletter Settings<", ">订阅设置<"],
  [">Size Comparison<", ">尺寸对比<"],
  [">FAQ Management<", ">常见问题<"],
  [">Homepage Reviews<", ">首页评价<"],
  [">Product List<", ">商品列表<"],
  [">Order List<", ">订单列表<"],
  [">User List<", ">用户列表<"],
  [">Review List<", ">评价列表<"],
  [">Blog Posts<", ">博客文章<"],
  [">Why Mini Scenes<", ">Why Mini 场景<"],
  [">Why Mini Content<", ">Why Mini 内容<"],
  [">Logo Settings<", ">Logo设置<"],
  
  // Buttons
  [">Add Banner<", ">添加轮播图<"],
  [">Add Feature<", ">添加特性<"],
  [">Add Video<", ">添加视频<"],
  [">Add FAQ<", ">添加问题<"],
  [">Add Review<", ">添加评价<"],
  [">Add Product<", ">添加商品<"],
  [">Add Blog Post<", ">添加文章<"],
  [">Add Scene<", ">添加场景<"],
  [">Edit Banner<", ">编辑轮播图<"],
  [">Edit Feature<", ">编辑特性<"],
  [">Edit Video<", ">编辑视频<"],
  [">Edit FAQ<", ">编辑问题<"],
  [">Edit Review<", ">编辑评价<"],
  [">Edit Product<", ">编辑商品<"],
  [">Edit Blog Post<", ">编辑文章<"],
  [">Edit Scene<", ">编辑场景<"],
  [">Edit Brand Story<", ">编辑品牌故事<"],
  [">Edit Newsletter<", ">编辑订阅设置<"],
  [">Edit Size Comparison<", ">编辑尺寸对比<"],
  [">Edit Why Mini Content<", ">编辑Why Mini内容<"],
  
  // Status
  [">Processing<", ">处理中<"],
  [">Shipped<", ">已发货<"],
  [">Delivered<", ">已送达<"],
  [">Cancelled<", ">已取消<"],
  
  // Misc
  [">Total:<", ">总计:<"],
  [">Totale:<", ">总计:<"],
  [">No data<", ">暂无数据<"],
  [">Loading...<", ">加载中...<"],
  [">Confirm Delete<", ">确认删除<"],
  [">Are you sure<", ">确定要<"],
  [">Yes, Delete<", ">确认删除<"],
  [">No, Cancel<", ">取消<"],
  
  // Product form
  [">Product Name<", ">商品名称<"],
  [">Product Image<", ">商品图片<"],
  [">Product Description<", ">商品描述<"],
  [">Stock Level<", ">库存数量<"],
  [">Discount<", ">折扣<"],
  
  // More specific replacements
  ["placeholder=\"Enter title\"", "placeholder=\"输入标题\""],
  ["placeholder=\"Enter subtitle\"", "placeholder=\"输入副标题\""],
  ["placeholder=\"Enter description\"", "placeholder=\"输入描述\""],
  ["placeholder=\"Enter image URL\"", "placeholder=\"输入图片链接\""],
  ["placeholder=\"Enter price\"", "placeholder=\"输入价格\""],
  ["placeholder=\"Enter name\"", "placeholder=\"输入名称\""],
  ["placeholder=\"Enter email\"", "placeholder=\"输入邮箱\""],
  ["placeholder=\"Enter content\"", "placeholder=\"输入内容\""],
];

for (const [from, to] of replacements) {
  content = content.split(from).join(to);
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Admin dashboard translated to Chinese!');
console.log('Done!');
