import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { TranslatedText } from './TranslatedText';

interface FeaturedProductsSliderProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, selectedColor?: string, selectedVariants?: { [key: string]: string }) => void;
  formatPrice?: (price: number) => string;
}

const FeaturedProductsSlider: React.FC<FeaturedProductsSliderProps> = ({ products, onProductClick, onAddToCart, formatPrice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredProducts = products.slice(0, 4);

  // State for each product's selections
  const [productSelections, setProductSelections] = useState<{
    [productId: string]: {
      selectedColor: string;
      activeImage: string;
      selectedVariants: { [key: string]: string };
    }
  }>({});

  // Initialize selections for all products
  useEffect(() => {
    const initialSelections: typeof productSelections = {};
    featuredProducts.forEach(product => {
      const variants: { [key: string]: string } = {};
      if (product.variants) {
        product.variants.forEach(variant => {
          if (variant.options.length > 0) {
            variants[variant.type] = variant.options[0].id;
          }
        });
      }
      initialSelections[product.id] = {
        selectedColor: product.colorOptions?.[0]?.name || '',
        activeImage: product.image,
        selectedVariants: variants
      };
    });
    setProductSelections(initialSelections);
  }, [featuredProducts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const updateProductSelection = (productId: string, updates: Partial<typeof productSelections[string]>) => {
    setProductSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates }
    }));
  };

  const calculateTotalPrice = (product: Product) => {
    let total = product.price;
    const selections = productSelections[product.id];
    if (selections && product.variants) {
      product.variants.forEach(variant => {
        const selectedOptionId = selections.selectedVariants[variant.type];
        const option = variant.options.find(o => o.id === selectedOptionId);
        if (option?.price) total += option.price;
      });
    }
    return total;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            <TranslatedText fallback="Featured" />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            <TranslatedText fallback="Our Best Sellers" />
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            <TranslatedText fallback="The most loved products by our customers" />
          </p>
        </div>

        <div className="relative">
          {/* Slider Container */}
          <div className="overflow-hidden rounded-3xl sm:rounded-[48px]">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {featuredProducts.map((product) => {
                const selection = productSelections[product.id] || { selectedColor: '', activeImage: product.image, selectedVariants: {} };

                return (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center p-6 sm:p-8 lg:p-16 bg-white">
                      {/* Product Image */}
                      <div
                        className="order-2 lg:order-1 cursor-pointer group"
                        onClick={() => onProductClick(product)}
                      >
                        <div className="aspect-[4/5] rounded-2xl sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl relative">
                          <img
                            src={selection.activeImage}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={product.name}
                          />
                          {product.badge && (
                            <span className="absolute top-4 right-4 bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase shadow-lg">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
                        {/* Rating & Badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5 text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className="fa-solid fa-star text-xs sm:text-sm"></i>
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm font-black text-gray-900 ml-1">
                              {product.rating}
                            </span>
                          </div>
                          {product.stockLevel < 10 && (
                            <span className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase">
                              <i className="fa-solid fa-fire mr-1"></i>
                              <TranslatedText fallback={`Only ${product.stockLevel} left`} />
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                          {product.description}
                        </p>

                        {/* Color Selection */}
                        {product.colorOptions && product.colorOptions.length > 0 && (
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                              <TranslatedText fallback="Color" /> — <span className="text-indigo-600">{selection.selectedColor}</span>
                            </p>
                            <div className="flex gap-3">
                              {product.colorOptions.map((opt) => (
                                <button
                                  key={opt.name}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateProductSelection(product.id, {
                                      selectedColor: opt.name,
                                      activeImage: opt.image
                                    });
                                  }}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 p-1 transition-all ${selection.selectedColor === opt.name
                                      ? 'border-gray-900 scale-110 shadow-lg'
                                      : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                  <img src={opt.image} className="w-full h-full rounded-full object-cover" alt={opt.name} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Variants Selection */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="space-y-4">
                            {product.variants.map((variant) => (
                              <div key={variant.type}>
                                <p className="text-xs sm:text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                                  {variant.label} — <span className="text-indigo-600">
                                    {variant.options.find(opt => opt.id === selection.selectedVariants?.[variant.type])?.name || ''}
                                  </span>
                                </p>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                  {variant.options.map((option) => (
                                    <button
                                      key={option.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateProductSelection(product.id, {
                                          selectedVariants: {
                                            ...selection.selectedVariants,
                                            [variant.type]: option.id
                                          }
                                        });
                                      }}
                                      disabled={!option.inStock}
                                      className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${selection.selectedVariants?.[variant.type] === option.id
                                          ? 'border-gray-900 bg-gray-900 text-white scale-105 shadow-lg'
                                          : option.inStock
                                            ? 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                        }`}
                                    >
                                      {option.name}
                                      {option.price > 0 && (
                                        <span className="ml-2 text-[10px] sm:text-xs">+{formatPrice ? formatPrice(option.price) : `€${option.price}`}</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <i className="fa-solid fa-microchip mr-1"></i>
                            Snapdragon 8 Gen 2
                          </span>
                          <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <i className="fa-solid fa-display mr-1"></i>
                            AMOLED 120Hz
                          </span>
                          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <i className="fa-solid fa-camera mr-1"></i>
                            50MP Camera
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3">
                          <span className="text-3xl sm:text-4xl font-black text-gray-900">
                            {formatPrice ? formatPrice(calculateTotalPrice(product)) : `€${calculateTotalPrice(product)}`}
                          </span>
                          {product.originalPrice && (
                            <div className="flex flex-col">
                              <span className="text-base sm:text-lg text-gray-400 line-through font-bold">
                                €{product.originalPrice}
                              </span>
                              <span className="text-xs font-bold text-red-600">
                                <TranslatedText fallback={`Save €${product.originalPrice - product.price}`} />
                              </span>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product, selection.selectedColor, selection.selectedVariants);
                            }}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wide hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
                          >
                            <i className="fa-solid fa-cart-shopping group-hover:animate-bounce"></i>
                            <TranslatedText fallback="Add to Cart" />
                          </button>
                          <button
                            onClick={() => onProductClick(product)}
                            className="bg-white text-gray-900 py-3 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wide border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <TranslatedText fallback="View Details" />
                            <i className="fa-solid fa-arrow-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all z-10"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-all z-10"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex
                    ? 'w-8 bg-indigo-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSlider;
