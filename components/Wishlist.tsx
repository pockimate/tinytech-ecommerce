import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { TranslatedText } from './TranslatedText';

interface WishlistProps {
  wishlistIds: string[];
  allProducts: Product[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, selectedColor?: string, selectedVariants?: { [key: string]: string }) => void;
  onViewDetails: (product: Product) => void;
  formatPrice?: (price: number) => string;
}

const Wishlist: React.FC<WishlistProps> = ({
  wishlistIds,
  allProducts,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
  formatPrice
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'price-low' | 'price-high' | 'name'>('date');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  // Apply filters
  let filteredProducts = [...wishlistedProducts];
  if (filterStock === 'in-stock') {
    filteredProducts = filteredProducts.filter(p => p.stockLevel > 0);
  } else if (filterStock === 'out-of-stock') {
    filteredProducts = filteredProducts.filter(p => p.stockLevel === 0);
  }

  // Apply sorting
  filteredProducts.sort((a, b) => {
    if (!a || !b) return 0;
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalValue = wishlistedProducts.reduce((sum, p) => sum + (p?.price || 0), 0);
  const totalSavings = wishlistedProducts.reduce((sum, p) => {
    if (p?.originalPrice && p?.price) {
      return sum + (p.originalPrice - p.price);
    }
    return sum;
  }, 0);
  const inStockCount = wishlistedProducts.filter(p => p?.stockLevel > 0).length;

  const handleShare = async () => {
    const shareText = `Check out my wishlist on TinyTech! ${wishlistedProducts.length} amazing products I'm loving.`;
    const shareUrl = window.location.href;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'My TinyTech Wishlist',
          text: shareText,
          url: shareUrl
        });
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
        alert('Wishlist link copied to clipboard!');
      } catch (e) {
        console.error('Share failed', e);
        alert('Could not share wishlist');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className="fa-solid fa-heart text-4xl text-red-500 animate-pulse"></i>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <TranslatedText fallback="My Wishlist" />
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {wishlistedProducts.length === 0
              ? <TranslatedText fallback="Your wishlist is empty. Start adding items you love!" />
              : <TranslatedText fallback={`You have ${wishlistedProducts.length} item${wishlistedProducts.length !== 1 ? 's' : ''} saved`} />}
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <i className="fa-regular fa-heart text-8xl text-gray-200"></i>
                <i className="fa-solid fa-magnifying-glass absolute -bottom-2 -right-2 text-3xl text-indigo-400"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                <TranslatedText fallback="No items in your wishlist yet" />
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                <TranslatedText fallback="Start exploring our products and save your favorites to your wishlist for later" />
              </p>
              <button
                onClick={() => {
                  if (allProducts.length > 0) {
                    onViewDetails(allProducts[0]);
                  }
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <i className="fa-solid fa-shopping-bag"></i>
                <TranslatedText fallback="Continue Shopping" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-heart text-indigo-600"></i>
                  </div>
                  <div className="text-3xl font-black text-indigo-600">{wishlistedProducts.length}</div>
                </div>
                <div className="text-gray-600 text-sm">
                  <TranslatedText fallback="Items Saved" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-dollar-sign text-green-600"></i>
                  </div>
                  <div className="text-3xl font-black text-green-600">
                    {formatPrice ? formatPrice(totalValue) : `$${totalValue.toFixed(2)}`}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">
                  <TranslatedText fallback="Total Value" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-box text-orange-600"></i>
                  </div>
                  <div className="text-3xl font-black text-orange-600">{inStockCount}</div>
                </div>
                <div className="text-gray-600 text-sm">
                  <TranslatedText fallback="In Stock" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-tag text-purple-600"></i>
                  </div>
                  <div className="text-3xl font-black text-purple-600">
                    {formatPrice ? formatPrice(totalSavings) : `$${totalSavings.toFixed(2)}`}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">
                  <TranslatedText fallback="Total Savings" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl p-4 mb-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm font-bold text-gray-700"><TranslatedText fallback="Sort by:" /></label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="date"><TranslatedText fallback="Date Added" /></option>
                    <option value="price-low"><TranslatedText fallback="Price: Low to High" /></option>
                    <option value="price-high"><TranslatedText fallback="Price: High to Low" /></option>
                    <option value="name"><TranslatedText fallback="Name" /></option>
                  </select>

                  <label className="text-sm font-bold text-gray-700 ml-4"><TranslatedText fallback="Filter:" /></label>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value as any)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all"><TranslatedText fallback="All Items" /></option>
                    <option value="in-stock"><TranslatedText fallback="In Stock Only" /></option>
                    <option value="out-of-stock"><TranslatedText fallback="Out of Stock" /></option>
                  </select>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                  <TranslatedText fallback="Share Wishlist" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <i className="fa-solid fa-filter text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500"><TranslatedText fallback="No products match your current filters" /></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewDetails={onViewDetails}
                    isWishlisted={true}
                    onToggleWishlist={onToggleWishlist}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="relative z-10">
                <i className="fa-solid fa-cart-shopping text-4xl mb-4"></i>
                <h3 className="text-2xl font-black mb-3"><TranslatedText fallback="Ready to Buy?" /></h3>
                <p className="mb-6 text-indigo-100"><TranslatedText fallback="Add all your wishlist items to cart with one click" /></p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      wishlistedProducts.forEach(product => {
                        if (product.stockLevel > 0) {
                          onAddToCart(product);
                        }
                      });
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-indigo-600 hover:bg-gray-100'
                      }`}
                  >
                    {addedToCart ? (
                      <>
                        <i className="fa-solid fa-check mr-2"></i>
                        <TranslatedText fallback="Added to Cart!" />
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cart-plus mr-2"></i>
                        <TranslatedText fallback="Add All to Cart" />
                      </>
                    )}
                  </button>
                  {totalSavings > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold">
                      💰 <TranslatedText fallback={`Save ${formatPrice ? formatPrice(totalSavings) : `$${totalSavings.toFixed(2)}`} total!`} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
