
import React, { useState } from 'react';
import { TranslatedText } from './TranslatedText';

interface FAQItem {
  question: string;
  answer: string;
  icon: string;
}

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      icon: 'fa-mobile-screen-button',
      question: 'Phone Specifications',
      answer: 'Our TinyTalk Pro S1 features a 3.0" LTPS display, 8GB RAM, and 128GB storage powered by a high-efficiency Helio G99 chipset.'
    },
    {
      icon: 'fa-folder-open',
      question: 'Can I have more storage?',
      answer: 'The current models come with 128GB of high-speed UFS 2.2 storage. While there is no SD card slot to maintain the micro-size, 128GB is optimized for thousands of photos and essential apps.'
    },
    {
      icon: 'fa-mobile-screen',
      question: 'What operating system does it use?',
      answer: 'Pockimate devices run on a highly customized version of Android 13 designed to look and feel minimalist. We offer full Google Play Support with an optimized interface for small screens.'
    },
    {
      icon: 'fa-credit-card',
      question: 'Are there monthly payments?',
      answer: 'Yes! We partner with Klarna and Afterpay to offer interest-free installments over 3 or 6 months at checkout.'
    },
    {
      icon: 'fa-battery-three-quarters',
      question: 'How long to fully charge it?',
      answer: 'Our DenseEnergy cells support 18W fast charging. You can reach 0% to 100% in approximately 45 minutes.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">
            <TranslatedText fallback="Anything Else?" />
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            <TranslatedText fallback="Questions? We've Got You Covered!" />
          </h2>
        </div>

        <div className="border-t border-gray-100">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100">
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full py-7 flex items-center justify-between text-left group transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${activeIndex === index ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-gray-900'}`}>
                    <i className={`fa-solid ${faq.icon}`}></i>
                  </div>
                  <span className={`text-lg sm:text-xl font-bold transition-colors ${activeIndex === index ? 'text-indigo-600' : 'text-gray-900'}`}>
                    <TranslatedText fallback={faq.question} />
                  </span>
                </div>
                <div className={`transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-indigo-600' : 'text-gray-300'}`}>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${activeIndex === index ? 'max-h-40 pb-8' : 'max-h-0'}`}
              >
                <p className="pl-16 text-gray-500 leading-relaxed max-w-2xl font-medium">
                  <TranslatedText fallback={faq.answer} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
