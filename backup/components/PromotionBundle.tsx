import React, { useState, useEffect, useRef } from 'react';
import { TranslatedText } from './TranslatedText';

interface Bundle {
  id: string;
  name: string;
  count: number;
  price: number;
  originalPrice: number;
  savingsLabel: string;
  isPopular?: boolean;
}

interface PromotionBundleProps {
  bundles: Bundle[];
  selectedBundleId: string;
  onSelectBundle: (id: string) => void;
  formatPrice?: (price: number) => string;
  colorOptions?: Array<{ name: string; image: string }>;
  selectedColor?: string;
  onColorSelect?: (color: string, image: string) => void;
  variants?: Array<{
    type: string;
    label: string;
    options: Array<{ id: string; name: string; price?: number; inStock: boolean }>;
  }>;
  selectedVariants?: { [key: string]: string };
  onVariantSelect?: (type: string, optionId: string) => void;
  onBundleItemsChange?: (items: Array<{ color?: string; variants?: { [key: string]: string } }>) => void;
}

const PromotionBundle: React.FC<PromotionBundleProps> = ({ 
  bundles, 
  selectedBundleId, 
  onSelectBundle, 
  formatPrice,
  colorOptions,
  selectedColor,
  onColorSelect,
  variants,
  selectedVariants,
  onVariantSelect,
  onBundleItemsChange
}) => {
  const [bundleItemSelections, setBundleItemSelections] = useState<Array<{ color?: string; variants?: { [key: string]: string } }>>([]);

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 56
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <i className="fa-solid fa-bolt text-yellow-300 animate-pulse text-lg"></i>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest"><TranslatedText fallback="Limited Time Flash Sale" /></span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-1"><TranslatedText fallback="Up to 35% Off" /></h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium"><TranslatedText fallback="Offer expires in:" /></p>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase opacity-80"><TranslatedText fallback="Hours" /></div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase opacity-80"><TranslatedText fallback="Min" /></div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[60px] sm:min-w-[70px]">
                <div className="text-2xl sm:text-3xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold uppercase opacity-80"><TranslatedText fallback="Sec" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="relative py-6 sm:py-8 flex items-center">
        <div className="flex-grow border-t-2 border-gray-200"></div>
        <div className="flex-shrink mx-4 flex items-center gap-2">
          <i className="fa-solid fa-gift text-indigo-600 text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-900"><TranslatedText fallback="Choose Your Package" /></span>
        </div>
        <div className="flex-grow border-t-2 border-gray-200"></div>
      </div>

      {/* Color and Variant Selection */}
      {(colorOptions || variants) && (
        <div className="space-y-6 mb-6">
          {colorOptions && colorOptions.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                <TranslatedText fallback="Color" /> — <span className="text-indigo-600">{selectedColor}</span>
              </p>
              <div className="flex gap-4">
                {colorOptions.map((opt) => (
                  <button 
                    key={opt.name} 
                    onClick={() => onColorSelect?.(opt.name, opt.image)}
                    className={`w-14 h-14 rounded-full border-2 p-1 transition-all ${
                      selectedColor === opt.name 
                        ? 'border-gray-900 scale-110 shadow-lg' 
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={opt.image} className="w-full h-full rounded-full object-cover" alt={opt.name} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {variants && variants.map((variant) => (
            <div key={variant.type}>
              <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                {variant.label} — <span className="text-indigo-600">
                  {variant.options.find(opt => opt.id === selectedVariants?.[variant.type])?.name || ''}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                {variant.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onVariantSelect?.(variant.type, option.id)}
                    disabled={!option.inStock}
                    className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      selectedVariants?.[variant.type] === option.id
                        ? 'border-gray-900 bg-gray-900 text-white scale-105 shadow-lg'
                        : option.inStock
                        ? 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                        : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {option.name}
                    {option.price > 0 && (
                      <span className="ml-2 text-xs">+{formatPrice ? formatPrice(option.price) : `€${option.price}`}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bundle Options */}
      <div className="space-y-3 sm:space-y-4">
        {bundles.map((bundle, index) => {
          const isSelected = selectedBundleId === bundle.id;
          const savingsPercent = Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100);
          const stockLeft = 5; // Fixed stock display
          
          return (
            <div 
              key={bundle.id} 
              onClick={() => onSelectBundle(bundle.id)} 
              className={`relative p-4 sm:p-6 rounded-2xl sm:rounded-[28px] border-2 cursor-pointer transition-all group ${
                isSelected 
                  ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl ring-4 ring-indigo-600/20 scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {bundle.isPopular && (
                <div className="absolute -top-3 -right-2 sm:right-8">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                    <i className="fa-solid fa-crown text-yellow-300"></i>
                    <TranslatedText fallback="BEST SELLER" />
                  </div>
                </div>
              )}

              {/* Best Value Badge */}
              {index === bundles.length - 1 && (
                <div className="absolute -top-3 left-4 sm:left-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <i className="fa-solid fa-star text-yellow-300"></i>
                    <TranslatedText fallback="BEST VALUE" />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' 
                    : 'bg-gray-50 border-2 border-gray-100 group-hover:border-indigo-200'
                }`}>
                  <i className={`fa-solid ${bundle.count > 1 ? 'fa-boxes-stacked' : 'fa-mobile-screen'} text-2xl sm:text-3xl ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}></i>
                </div>

                {/* Content */}
                <div className="flex-grow w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-lg sm:text-xl font-black text-gray-900">{bundle.name}</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-indigo-100 text-indigo-700 text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded-full border border-indigo-200">
                        <i className="fa-solid fa-truck-fast mr-1"></i>Spedizione Express Gratuita
                      </span>
                      {bundle.count > 1 && (
                        <span className="bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded-full border border-green-200">
                          <i className="fa-solid fa-gift mr-1"></i>Custodia Gratis
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <i className="fa-solid fa-circle-check"></i>
                      <TranslatedText fallback={`Save ${savingsPercent}%`} />
                    </span>
                    <span className="font-bold text-red-600 flex items-center gap-1 animate-pulse">
                      <i className="fa-solid fa-exclamation-triangle"></i>
                      <TranslatedText fallback={`Only ${stockLeft} available`} />
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 w-full sm:w-auto">
                  <div>
                    <p className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-1">
                      {formatPrice ? formatPrice(bundle.price) : `€${bundle.price}`}
                      {isSelected && <i className="fa-solid fa-circle-check text-indigo-600 text-lg sm:text-xl"></i>}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 line-through font-bold">{formatPrice ? formatPrice(bundle.originalPrice) : `€${bundle.originalPrice}`}</p>
                  </div>
                  
                  {/* Savings Badge */}
                  <div className="bg-red-500 text-white text-xs sm:text-sm font-black px-2 sm:px-3 py-1 rounded-lg">
                    -{savingsPercent}%
                  </div>
                </div>
              </div>

              {/* Multiple Item Variant Selection for bundles with count > 1 */}
              {bundle.count > 1 && isSelected && (colorOptions || variants) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-xs font-bold text-gray-700 mb-3"><TranslatedText fallback="Color" /></p>
                  {Array.from({ length: bundle.count }).map((_, itemIndex) => {
                    return <CustomDropdownItem 
                      key={itemIndex}
                      itemIndex={itemIndex}
                      colorOptions={colorOptions}
                      variants={variants}
                      onItemSelect={(color, variantSelections) => {
                        setBundleItemSelections(prev => {
                          const newSelections = [...prev];
                          newSelections[itemIndex] = {
                            color,
                            variants: variantSelections
                          };
                          // Notify parent component
                          if (onBundleItemsChange) {
                            onBundleItemsChange(newSelections);
                          }
                          return newSelections;
                        });
                      }}
                    />;
                  })}
                </div>
              )}

              {/* Included Items - Show if bundle has includes array */}
              {bundle.includes && bundle.includes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700">
                    <i className="fa-solid fa-plus-circle text-green-500"></i>
                    <span><TranslatedText fallback="Included in package:" /></span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bundle.includes.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                        🎁 {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fa-solid fa-shield-check text-green-500 text-lg sm:text-xl"></i>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900"><TranslatedText fallback="2-Year Warranty" /></div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium"><TranslatedText fallback="Official" /></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fa-solid fa-rotate-left text-blue-500 text-lg sm:text-xl"></i>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900"><TranslatedText fallback="30-Day Returns" /></div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium"><TranslatedText fallback="Free" /></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fa-solid fa-lock text-purple-500 text-lg sm:text-xl"></i>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900"><TranslatedText fallback="Secure Payment" /></div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium"><TranslatedText fallback="SSL Protected" /></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <i className="fa-solid fa-truck-fast text-orange-500 text-lg sm:text-xl"></i>
            <div>
              <div className="text-xs sm:text-sm font-black text-gray-900"><TranslatedText fallback="Fast Delivery" /></div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium"><TranslatedText fallback="24-48h" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown Component for Item Selection
interface CustomDropdownItemProps {
  itemIndex: number;
  colorOptions?: Array<{ name: string; image: string }>;
  variants?: Array<{
    type: string;
    label: string;
    options: Array<{ id: string; name: string; price?: number; inStock: boolean }>;
  }>;
  onItemSelect?: (color?: string, variants?: { [key: string]: string }) => void;
}

const CustomDropdownItem: React.FC<CustomDropdownItemProps> = ({ 
  itemIndex, 
  colorOptions, 
  variants,
  onItemSelect
}) => {
  const [selectedColor, setSelectedColor] = useState(colorOptions?.[0] || null);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [isColorOpen, setIsColorOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selections and notify parent
  useEffect(() => {
    const initVariants: { [key: string]: string } = {};
    if (variants) {
      variants.forEach(variant => {
        const firstAvailable = variant.options.find(o => o.inStock);
        if (firstAvailable) {
          initVariants[variant.type] = firstAvailable.id;
        }
      });
    }
    setSelectedVariants(initVariants);
    onItemSelect?.(selectedColor?.name, initVariants);
  }, []);

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold text-gray-900 w-8 flex-shrink-0">#{itemIndex + 1}</span>
      
      {/* Custom Color Dropdown */}
      {colorOptions && colorOptions.length > 0 && (
        <div ref={colorDropdownRef} className="relative w-44">
          {/* Selected Item Display */}
          <div 
            onClick={() => setIsColorOpen(!isColorOpen)}
            className="w-full pl-12 pr-8 py-1.5 rounded-lg border border-gray-300 hover:border-indigo-600 focus:border-indigo-600 cursor-pointer bg-gray-50 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <img 
                src={selectedColor?.image} 
                className="w-8 h-8 object-cover rounded-md border border-gray-200" 
                alt={selectedColor?.name}
              />
              <span className="text-sm font-medium text-gray-900">{selectedColor?.name}</span>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isColorOpen ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 20 20"
            >
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4"/>
            </svg>
          </div>

          {/* Dropdown Options */}
          {isColorOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {colorOptions.map((option) => (
                <div
                  key={option.name}
                  onClick={() => {
                    setSelectedColor(option);
                    setIsColorOpen(false);
                    onItemSelect?.(option.name, selectedVariants);
                  }}
                  className={`flex items-center gap-2 p-2 hover:bg-indigo-50 cursor-pointer transition-colors ${
                    selectedColor?.name === option.name ? 'bg-indigo-50' : ''
                  }`}
                >
                  <img 
                    src={option.image} 
                    className="w-10 h-10 object-cover rounded-md border border-gray-200" 
                    alt={option.name}
                  />
                  <span className="text-sm font-medium text-gray-900">{option.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Variant dropdowns - keep as native select for now */}
      {variants && variants.map((variant) => (
        <div key={variant.type} className="w-44">
          <select 
            value={selectedVariants[variant.type] || ''}
            className="w-full px-3 pr-8 py-1.5 rounded-lg border border-gray-300 focus:border-indigo-600 focus:outline-none text-sm font-medium appearance-none bg-gray-50 cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.2em 1.2em'
            }}
            onChange={(e) => {
              const newVariants = { ...selectedVariants, [variant.type]: e.target.value };
              setSelectedVariants(newVariants);
              onItemSelect?.(selectedColor?.name, newVariants);
            }}
          >
            {variant.options.filter(opt => opt.inStock).map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default PromotionBundle;
