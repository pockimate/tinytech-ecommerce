import React from 'react';
import type { BrandStoryContent } from '../types';

interface BrandStoryProps {
  data: BrandStoryContent;
}

const BrandStory: React.FC<BrandStoryProps> = ({ data }) => {
  return (
    <section className="py-8 sm:py-12 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-3 sm:mb-4">
              {data.subtitle}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
              {data.title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < data.title.split('\n').length - 1 && <br/>}
                </React.Fragment>
              ))}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {data.description}
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {data.secondDescription}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 mb-1 sm:mb-2">{data.stat1Value}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-bold uppercase tracking-wide">{data.stat1Label}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 mb-1 sm:mb-2">{data.stat2Value}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-bold uppercase tracking-wide">{data.stat2Label}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 mb-1 sm:mb-2">{data.stat3Value}</div>
                <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-bold uppercase tracking-wide">{data.stat3Label}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-lg">
                {data.button1Text}
              </button>
              <button className="bg-gray-100 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-gray-200 transition-all">
                {data.button2Text}
              </button>
            </div>
          </div>

          {/* Right Images */}
          <div className="order-1 lg:order-2 relative">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={data.image1}
                    className="w-full h-full object-cover"
                    alt="Product 1"
                  />
                </div>
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={data.image2}
                    className="w-full h-full object-cover"
                    alt="Product 2"
                  />
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={data.image3}
                    className="w-full h-full object-cover"
                    alt="Product 3"
                  />
                </div>
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={data.image4}
                    className="w-full h-full object-cover"
                    alt="Product 4"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-600 mb-1 sm:mb-2">{data.badgeText1}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-bold whitespace-pre-line">{data.badgeText2}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
