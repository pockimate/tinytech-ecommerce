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
    <section className="py-8 sm:py-12 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-indigo-600 transition-colors">
                <i className={`fa-solid ${feature.icon} text-2xl sm:text-3xl text-indigo-600 group-hover:text-white transition-colors`}></i>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
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
