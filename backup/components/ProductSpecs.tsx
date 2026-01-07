import React from 'react';
import { Product } from '../types';

interface ProductSpecsProps {
  product: Product;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ product }) => {
  const specs = [
    { category: 'Display', items: [
      { label: 'Screen Size', value: '3.0" AMOLED' },
      { label: 'Resolution', value: '720 x 1280 pixels' },
      { label: 'Refresh Rate', value: '120Hz' },
      { label: 'Brightness', value: '1000 nits peak' }
    ]},
    { category: 'Performance', items: [
      { label: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { label: 'RAM', value: '12GB LPDDR5X' },
      { label: 'Storage', value: '256GB UFS 4.0' },
      { label: 'GPU', value: 'Adreno 740' }
    ]},
    { category: 'Camera', items: [
      { label: 'Main Camera', value: '50MP f/1.8' },
      { label: 'Ultra Wide', value: '12MP f/2.2' },
      { label: 'Front Camera', value: '16MP f/2.0' },
      { label: 'Video', value: '4K@60fps, 8K@24fps' }
    ]},
    { category: 'Battery & Connectivity', items: [
      { label: 'Battery', value: '3500mAh' },
      { label: 'Fast Charging', value: '67W wired, 15W wireless' },
      { label: '5G', value: 'SA/NSA dual-mode' },
      { label: 'Bluetooth', value: '5.3' }
    ]},
    { category: 'Design', items: [
      { label: 'Dimensions', value: '89.5 x 45 x 9.8mm' },
      { label: 'Weight', value: '125g' },
      { label: 'Material', value: 'Aluminum frame, Gorilla Glass' },
      { label: 'Water Resistance', value: 'IP68' }
    ]}
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            Specifiche Tecniche
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Tutto Ciò che Devi Sapere
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            Specifiche complete e dettagliate del dispositivo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {specs.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 flex items-center gap-2">
                <i className="fa-solid fa-microchip text-indigo-600"></i>
                {section.category}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-gray-900 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Download Specs Button */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-lg inline-flex items-center gap-2">
            <i className="fa-solid fa-download"></i>
            Scarica Scheda Tecnica PDF
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSpecs;
