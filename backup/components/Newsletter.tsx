import React from 'react';
import { TranslatedText } from './TranslatedText';
import TranslatedInput from './TranslatedInput';

interface NewsletterProps {
  // Future: can add onSubscribe callback
}

const Newsletter: React.FC<NewsletterProps> = () => {
  return (
    <section className="py-8 sm:py-12 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="mb-6 sm:mb-8">
          <i className="fa-solid fa-envelope-open-text text-4xl sm:text-5xl lg:text-6xl text-white/80 mb-4 sm:mb-6 inline-block"></i>
        </div>
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
          <TranslatedText fallback="Stay Updated" />
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium">
          <TranslatedText fallback="Subscribe to our newsletter and get 20% off your first order. Plus: exclusive previews and special offers." />
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xl mx-auto mb-6 sm:mb-8">
          <TranslatedInput
            type="email"
            placeholderFallback="Enter your email"
            className="flex-1 px-4 py-3 sm:px-6 sm:py-4 lg:py-5 rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30 text-base sm:text-lg font-medium"
          />
          <button className="bg-gray-900 text-white px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-2xl font-black text-sm sm:text-base hover:bg-black transition-all shadow-2xl whitespace-nowrap">
            <TranslatedText fallback="Subscribe Now" />
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>

        <p className="text-sm text-white/70 font-medium">
          <i className="fa-solid fa-lock mr-2"></i>
          <TranslatedText fallback="Your data is safe. No spam, only exclusive offers." />
        </p>

        {/* Trust Badges */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-white/80">
            <i className="fa-solid fa-check-circle text-2xl"></i>
            <span className="font-bold text-sm"><TranslatedText fallback="Exclusive Offers" /></span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <i className="fa-solid fa-check-circle text-2xl"></i>
            <span className="font-bold text-sm"><TranslatedText fallback="Product Previews" /></span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <i className="fa-solid fa-check-circle text-2xl"></i>
            <span className="font-bold text-sm"><TranslatedText fallback="Discount Codes" /></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
