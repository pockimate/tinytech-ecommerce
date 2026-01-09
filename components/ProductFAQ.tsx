import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const ProductFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Which Android version is pre-installed?',
      answer: 'The device comes with Android 14 pre-installed, with guaranteed updates for 4 years of major versions and 5 years of security patches.'
    },
    {
      question: 'Is the battery replaceable?',
      answer: 'The battery is not user-replaceable to maintain the ultra-compact design. However, it is covered by a 2-year warranty and maintains 80% capacity after 800 charge cycles.'
    },
    {
      question: 'Is it compatible with eSIM?',
      answer: 'Yes, the device supports dual SIM: 1 physical nano-SIM + 1 eSIM. You can use both simultaneously for work and personal use.'
    },
    {
      question: 'Can I use it with one hand?',
      answer: 'Absolutely! With dimensions of 89.5 x 45mm and weighing only 125g, it is specifically designed for one-hand use, perfect even for small pockets.'
    },
    {
      question: 'How does the warranty work?',
      answer: 'Official 2-year manufacturer warranty included. Covers manufacturing defects and hardware malfunctions. Support available with repair center.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay and bank transfer. Secure payment with SSL encryption.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Free express shipping worldwide. Delivery in 24-48h for major cities, 2-3 days for remote areas. Tracking included.'
    },
    {
      question: 'Can I return the product?',
      answer: 'Yes, you have 30 days for free returns without having to provide reasons. The product must be in original condition with intact packaging. Full refund within 5-7 business days.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Have Questions? We Answer Here
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Can't find the answer? Contact our customer support
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left"
              >
                <span className="text-sm sm:text-base font-black text-gray-900 pr-4">
                  {faq.question}
                </span>
                <i className={`fa-solid fa-chevron-down text-indigo-600 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}></i>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-10 sm:mt-12 text-center p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100">
          <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3">
            Still have questions?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 font-medium">
            Our support team is here to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all inline-flex items-center justify-center gap-2">
              <i className="fa-solid fa-comments"></i>
              Live Chat
            </button>
            <button className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-sm border-2 border-gray-200 hover:border-indigo-600 transition-all inline-flex items-center justify-center gap-2">
              <i className="fa-solid fa-envelope"></i>
              Send Email
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductFAQ;
