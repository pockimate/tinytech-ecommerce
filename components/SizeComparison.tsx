
import React, { useState } from 'react';
import { TranslatedText } from './TranslatedText';

const SizeComparison: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<'tiny' | 'watch'>('tiny');

  return (
    <section className="py-20 px-6 bg-gray-900 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-6"><TranslatedText fallback="Truly Pocketable." /></h2>
          <p className="text-gray-400 text-lg mb-8">
            <TranslatedText fallback="Experience the freedom of devices that don't weigh you down. Our mini smartphones and watches are designed for the modern minimalists." />
          </p>
          
          <div className="flex gap-4 mb-10">
            <button 
              onClick={() => setSelectedProduct('tiny')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedProduct === 'tiny' ? 'bg-indigo-600' : 'border border-gray-700 hover:bg-gray-800'}`}
            >
              <TranslatedText fallback="Mini Smartphone" />
            </button>
            <button 
              onClick={() => setSelectedProduct('watch')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedProduct === 'watch' ? 'bg-indigo-600' : 'border border-gray-700 hover:bg-gray-800'}`}
            >
              <TranslatedText fallback="Smartwatch" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                <i className="fa-solid fa-weight-hanging"></i>
              </div>
              <div>
                <h4 className="font-bold"><TranslatedText fallback="Ultra Lightweight" /></h4>
                <p className="text-gray-400 text-sm"><TranslatedText fallback="Weighs as low as 80g. You'll forget it's there." /></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                <i className="fa-solid fa-expand"></i>
              </div>
              <div>
                <h4 className="font-bold"><TranslatedText fallback="One-Hand Operation" /></h4>
                <p className="text-gray-400 text-sm"><TranslatedText fallback="Reach every corner of the screen effortlessly." /></p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center items-center h-[500px]">
          {/* Standard Phone Placeholder */}
          <div className="absolute w-56 h-[440px] bg-gray-800 rounded-[40px] border-4 border-gray-700 opacity-30 transform -translate-x-12 translate-y-8 flex items-center justify-center">
             <span className="text-xs text-gray-500 rotate-90 whitespace-nowrap"><TranslatedText fallback="Standard Phone (6.7&quot;)" /></span>
          </div>

          {/* Our Product */}
          <div className={`relative transition-all duration-700 transform ${selectedProduct === 'tiny' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="w-28 h-56 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
               <div className="absolute top-2 w-10 h-1 bg-white/20 rounded-full"></div>
               <div className="text-center p-4">
                  <div className="text-[10px] font-bold opacity-70 mb-1">TINY TALK</div>
                  <div className="text-xl font-black">S1</div>
               </div>
            </div>
          </div>

          <div className={`absolute transition-all duration-700 transform ${selectedProduct === 'watch' ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}>
            <div className="w-32 h-32 bg-gray-800 rounded-3xl border-2 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center p-2">
              <div className="w-full h-full rounded-2xl bg-indigo-600/20 flex flex-col items-center justify-center">
                <i className="fa-solid fa-clock text-4xl text-indigo-400"></i>
                <span className="text-[10px] mt-2 font-bold tracking-widest uppercase">Ultra Gen</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 text-center">
            <span className="bg-white/10 px-4 py-1 rounded-full text-xs text-gray-400"><TranslatedText fallback="Visual size comparison scale" /></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SizeComparison;
