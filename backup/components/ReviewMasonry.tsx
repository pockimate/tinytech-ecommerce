import React from 'react';
import { Review } from '../types';
import { TranslatedText } from './TranslatedText';

interface ReviewMasonryProps {
  reviews: Review[];
}

const ReviewMasonry: React.FC<ReviewMasonryProps> = ({ reviews }) => {
  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-4"><TranslatedText fallback="Customer Reviews" /></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4 lg:mb-6">
            <TranslatedText fallback="What Our Customers Say" />
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 max-w-2xl mx-auto">
            <TranslatedText fallback="Thousands of satisfied customers worldwide. Read their authentic experiences." />
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-2 lg:columns-4 gap-3 sm:gap-4 lg:gap-6 space-y-3 sm:space-y-4 lg:space-y-6">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="break-inside-avoid bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group"
            >
              {review.reviewImages && review.reviewImages[0] && (
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={review.reviewImages[0]} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="Review" 
                  />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-base sm:text-lg">
                    {review.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-gray-900">{review.user}</h4>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5 text-yellow-400 text-xs">
                        {[...Array(review.rating)].map((_, i) => (
                          <i key={i} className="fa-solid fa-star"></i>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-1"><TranslatedText fallback="Verified" /></span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium leading-relaxed line-clamp-6">
                  {review.comment}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-bold">
                  <span>{review.date}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <i className="fa-regular fa-thumbs-up"></i>
                    <TranslatedText fallback="Helpful" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <button className="bg-gray-900 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-indigo-600 transition-all shadow-lg">
            <TranslatedText fallback="View All Reviews" />
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewMasonry;
