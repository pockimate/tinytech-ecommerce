
import React from 'react';
import { VIDEO_SHOWCASE } from '../data';
import { TranslatedText } from './TranslatedText';

const VerticalVideoShowcase: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black mb-4"><TranslatedText fallback="TT Reels" /></h2>
            <p className="text-gray-500"><TranslatedText fallback="See our micro-tech in action. Real users, real world." /></p>
          </div>
          <div className="flex gap-2">
             <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
               <i className="fa-solid fa-chevron-left"></i>
             </button>
             <button className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors">
               <i className="fa-solid fa-chevron-right"></i>
             </button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
          {VIDEO_SHOWCASE.map((video) => (
            <div 
              key={video.id} 
              className="flex-shrink-0 w-[280px] aspect-[9/16] rounded-[32px] overflow-hidden relative group snap-start cursor-pointer shadow-xl"
            >
              <img 
                src={video.thumbnail} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={video.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> <TranslatedText fallback="Live" />
                </span>
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md bg-white/10 px-2 py-0.5 rounded">
                  {video.views} <TranslatedText fallback="Views" />
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30">
                  <i className="fa-solid fa-play text-white text-2xl ml-1"></i>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-block bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3 shadow-lg">
                  <i className="fa-solid fa-tag mr-1 text-[8px]"></i> {video.productTag}
                </div>
                <h4 className="text-white font-bold text-lg leading-tight">{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VerticalVideoShowcase;
