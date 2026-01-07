
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { TranslatedText } from './TranslatedText';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product, selectedColor?: string, selectedVariants?: { [key: string]: string }) => void;
  onViewDetails: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist: (id: string) => void;
  formatPrice?: (price: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails, isWishlisted, onToggleWishlist, formatPrice }) => {
  const isOutOfStock = product.stockLevel === 0;

  // State for color and variants selection
  const [selectedColor, setSelectedColor] = useState<string>(product.colorOptions?.[0]?.name || '');
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  // Initialize selected variants with first option of each variant
  useEffect(() => {
    if (product.variants) {
      const initialVariants: { [key: string]: string } = {};
      product.variants.forEach(variant => {
        if (variant.options.length > 0) {
          initialVariants[variant.type] = variant.options[0].id;
        }
      });
      setSelectedVariants(initialVariants);
    }
  }, [product]);

  // Calculate total price including variant prices
  const calculateTotalPrice = () => {
    let total = product.price;
    if (product.variants) {
      product.variants.forEach(variant => {
        const selectedOptionId = selectedVariants[variant.type];
        const option = variant.options.find(o => o.id === selectedOptionId);
        if (option?.price) total += option.price;
      });
    }
    return total;
  };

  const displayPrice = formatPrice ? formatPrice(calculateTotalPrice()) : `$${calculateTotalPrice()}`;

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedVariants);
  };

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 relative">
      <div
        className="absolute top-5 right-5 z-10 p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm cursor-pointer hover:scale-110 transition-all text-gray-400"
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
      >
        <i className={`${isWishlisted ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'} text-lg`}></i>
      </div>

      <div
        className="relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(product);
        }}
      >
        <img
          src={activeImage}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
        <div className="absolute top-5 left-5 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          {product.category}
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="bg-white text-gray-900 px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs"><TranslatedText fallback="Sold Out" /></span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-xl text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <span className="font-black text-indigo-600 text-lg">{displayPrice}</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Color Selection */}
        {product.colorOptions && product.colorOptions.length > 0 && (
          <div className="mb-3 relative z-10" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Color — <span className="text-indigo-600">{selectedColor}</span>
            </p>
            <div className="flex gap-2">
              {product.colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedColor(opt.name);
                    setActiveImage(opt.image);
                  }}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all cursor-pointer ${selectedColor === opt.name
                      ? 'border-gray-900 scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                    }`}
                >
                  <img src={opt.image} className="w-full h-full rounded-full object-cover pointer-events-none" alt={opt.name} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 mb-3 relative z-10" onClick={(e) => e.stopPropagation()}>
            {product.variants.map((variant) => (
              <div key={variant.type}>
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  {variant.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.slice(0, 3).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (option.inStock) {
                          setSelectedVariants(prev => ({ ...prev, [variant.type]: option.id }));
                        }
                      }}
                      disabled={!option.inStock}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${selectedVariants[variant.type] === option.id
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : option.inStock
                            ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                        }`}
                    >
                      {option.name}
                      {option.price > 0 && (
                        <span className="ml-1 text-[10px]">+{formatPrice ? formatPrice(option.price) : `€${option.price}`}</span>
                      )}
                    </button>
                  ))}
                  {variant.options.length > 3 && (
                    <span className="text-xs text-gray-400 flex items-center">+{variant.options.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-star text-[10px] text-yellow-400"></i>
            <span className="text-xs font-bold text-gray-700">{product.rating}</span>
          </div>
          {product.stockLevel < 5 && product.stockLevel > 0 && (
            <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter animate-pulse"><TranslatedText fallback={`Only ${product.stockLevel} left`} /></span>
          )}
        </div>

        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className={`mt-6 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-xl shadow-gray-200 hover:shadow-indigo-200'
            }`}
        >
          <i className="fa-solid fa-cart-plus"></i>
          {isOutOfStock ? <TranslatedText fallback="Waitlist Only" /> : <TranslatedText fallback="Add to Bag" />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
