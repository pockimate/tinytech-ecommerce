import React from 'react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
}

interface BlogDetailProps {
  post: BlogPost;
  allPosts: BlogPost[];
  onNavigate: (view: string) => void;
  onPostClick: (post: BlogPost) => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post, allPosts, onNavigate, onPostClick }) => {
  const relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('blog')}
          className="mb-8 sm:mb-12 flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Blog
        </button>

        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <span className="bg-indigo-100 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
            {post.category}
          </span>
          <span className="text-xs sm:text-sm text-gray-400 font-bold">{post.date}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6 sm:mb-8 leading-tight">
          {post.title}
        </h1>

        {/* Featured Image */}
        <div className="aspect-[16/9] rounded-2xl sm:rounded-[48px] overflow-hidden bg-gray-100 mb-8 sm:mb-12 shadow-2xl">
          <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed mb-6 sm:mb-8">
            {post.excerpt}
          </p>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-12">
            The Future is Minimalist
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            In recent years, we have witnessed a significant evolution in how we think about smartphones. 
            The race for ever-larger sizes finally seems to be slowing down, making room for a new 
            philosophy: compact devices that don't compromise on performance.
          </p>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            Mini phones represent this revolution. With 3-inch screens and flagship hardware, 
            these devices are redefining what "premium smartphone" means. It's not about compromises, 
            but conscious choices for a more balanced lifestyle.
          </p>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-12">
            Real Benefits
          </h2>
          <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Extreme portability:</strong> Fits in any pocket without bulk
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>One-hand use:</strong> Total control without acrobatics
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Efficient battery:</strong> Small display = surprising battery life
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Digital detox:</strong> Less distractions, more real life
              </span>
            </li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-12">
            Conclusion
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            The movement toward smaller, more functional devices is not just a passing trend, 
            but a concrete response to the needs of those seeking a healthier relationship with technology. 
            Mini phones prove that "less is more" is not just a slogan, but a design philosophy 
            that really works.
          </p>
        </article>

        {/* Share Buttons */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Share Article</p>
          <div className="flex gap-3 sm:gap-4">
            <button className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all">
              <i className="fa-brands fa-facebook-f"></i>
            </button>
            <button className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all">
              <i className="fa-brands fa-x-twitter"></i>
            </button>
            <button className="w-12 h-12 bg-blue-400 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 transition-all">
              <i className="fa-brands fa-linkedin-in"></i>
            </button>
            <button className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-all">
              <i className="fa-brands fa-whatsapp"></i>
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 sm:mb-12">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map(relatedPost => (
                <div 
                  key={relatedPost.id} 
                  onClick={() => onPostClick(relatedPost)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[16/10] rounded-2xl sm:rounded-[32px] overflow-hidden bg-gray-100 mb-4 sm:mb-6">
                    <img 
                      src={relatedPost.image} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={relatedPost.title} 
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2 sm:mb-4 block">
                    {relatedPost.category} • {relatedPost.date}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed line-clamp-3">
                    {relatedPost.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogDetail;
