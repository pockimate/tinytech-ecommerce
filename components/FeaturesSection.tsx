import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: 'fa-truck-fast',
      title: 'Free Shipping',
      description: 'Fast delivery worldwide. Free express shipping on all orders.'
    },
    {
      icon: 'fa-rotate-left',
      title: '30-Day Free Returns',
      description: 'Not satisfied? Full refund within 30 days of purchase.'
    },
    {
      icon: 'fa-shield-halved',
      title: '2-Year Warranty',
      description: 'Official manufacturer warranty. Dedicated customer support.'
    },
    {
      icon: 'fa-credit-card',
      title: 'Secure Payment',
      description: 'Credit card, PayPal or bank transfer. SSL protected transactions.'
    }
  ];

  return (
    <section className="py-6 xs:py-8 sm:py-12 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300 p-2 xs:p-3 sm:p-4"
            >
              <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4 md:mb-6 group-hover:bg-indigo-600 transition-colors">
                <i className={`fa-solid ${feature.icon} text-lg xs:text-xl sm:text-2xl md:text-3xl text-indigo-600 group-hover:text-white transition-colors`}></i>
              </div>
              <h3 className="text-xs xs:text-sm sm:text-base lg:text-xl font-black text-gray-900 mb-1 xs:mb-2 sm:mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-[10px] xs:text-xs sm:text-sm md:text-base text-gray-500 font-medium leading-relaxed hidden xs:block">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
