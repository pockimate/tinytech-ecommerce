import React from 'react';
import { Product } from '../types';

interface RelatedProductsProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, onProductClick }) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            You May Also Like
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Related Products
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Other mini phones that customers love
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
            <div 
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                <img 
                  src={product.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={product.name}
                />
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase">
                    {product.badge}
                  </span>
                )}
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <div className="flex gap-0.5 text-yellow-400 text-[8px] sm:text-[10px]">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star"></i>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-gray-900 ml-1">
                    {product.rating}
                  </span>
                </div>
                
                <h3 className="text-xs sm:text-sm font-black text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-gray-900">
                    €{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through font-bold">
                      €{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-lg inline-flex items-center gap-2"
          >
            View All Products
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
