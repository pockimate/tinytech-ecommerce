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
            Il Futuro è Minimalista
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            Negli ultimi anni abbiamo assistito a un'evoluzione significativa nel modo in cui pensiamo agli smartphone. 
            La corsa alle dimensioni sempre più grandi sembra finalmente rallentare, lasciando spazio a una nuova 
            filosofia: dispositivi compatti che non compromettono le prestazioni.
          </p>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            I mini phone rappresentano questa rivoluzione. Con schermi da 3 pollici e hardware flagship, 
            questi dispositivi stanno ridefinendo cosa significa "smartphone premium". Non si tratta di compromessi, 
            ma di scelte consapevoli per uno stile di vita più equilibrato.
          </p>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-12">
            Vantaggi Concreti
          </h2>
          <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Portabilità estrema:</strong> Entra in qualsiasi tasca senza ingombro
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Uso con una mano:</strong> Totale controllo senza acrobazie
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Batteria efficiente:</strong> Display piccolo = autonomia sorprendente
              </span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-circle-check text-indigo-600 mt-1"></i>
              <span className="text-base sm:text-lg text-gray-600 font-medium">
                <strong>Digital detox:</strong> Meno distrazioni, più vita reale
              </span>
            </li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-12">
            Conclusione
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4 sm:mb-6">
            Il movimento verso dispositivi più piccoli e funzionali non è solo una moda passeggera, 
            ma una risposta concreta alle esigenze di chi cerca un rapporto più sano con la tecnologia. 
            I mini phone dimostrano che "meno è meglio" non è solo uno slogan, ma una filosofia di design 
            che funziona davvero.
          </p>
        </article>

        {/* Share Buttons */}
        <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Condividi Articolo</p>
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
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 sm:mb-12">Articoli Correlati</h3>
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
