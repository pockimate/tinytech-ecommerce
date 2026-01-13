import React, { useState, useEffect } from 'react';
import { Banner } from '../types';

interface BannerCarouselProps {
  banners?: Banner[];
  onNavigate: (view: string) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners: propBanners, onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use prop banners or fall back to defaults
  const defaultBanners: Banner[] = [
    {
      id: '1',
      title: 'TinyTalk Pro S1',
      subtitle: 'The world\'s smallest flagship smartphone. Maximum power, minimum size.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1400',
      buttonText: 'Learn More',
      buttonLink: 'products',
      backgroundColor: 'from-indigo-600 to-purple-600',
      order: 0,
      isActive: true
    },
    {
      id: '2',
      title: 'ZenWatch Ultra',
      subtitle: 'The complete smartwatch that replaces your phone. Built-in 4G LTE.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400',
      buttonText: 'Explore Now',
      buttonLink: 'products',
      backgroundColor: 'from-blue-600 to-cyan-600',
      order: 1,
      isActive: true
    },
    {
      id: '3',
      title: 'January Sale',
      subtitle: 'Save up to 35% on all devices. Use code TINY20.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1400',
      buttonText: 'Shop Now',
      buttonLink: 'products',
      backgroundColor: 'from-rose-600 to-pink-600',
      order: 2,
      isActive: true
    }
  ];

  // Filter active banners and sort by order
  const banners = (propBanners || defaultBanners)
    .filter(b => b.isActive)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full">
      {/* Top padding for navbar */}
      <div className="h-20 sm:h-24 lg:h-28 bg-white"></div>
      
      <div className="relative w-full aspect-[1/1] sm:aspect-[16/9] lg:aspect-[2/1] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.backgroundColor || 'from-indigo-600 to-purple-600'} opacity-20`}></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-end justify-center px-4 sm:px-6 pb-24">
              <div className="max-w-6xl mx-auto text-center text-white">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up">
                  {banner.title}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-medium opacity-90 animate-fade-in-up animation-delay-100">
                  {banner.subtitle}
                </p>
                <button
                  onClick={() => onNavigate(banner.buttonLink || 'products')}
                  className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105 animate-fade-in-up animation-delay-200"
                >
                  {banner.buttonText}
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all z-10 group"
      >
        <i className="fa-solid fa-chevron-left text-xl group-hover:scale-110 transition-transform"></i>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all z-10 group"
      >
        <i className="fa-solid fa-chevron-right text-xl group-hover:scale-110 transition-transform"></i>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? 'w-12 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            } rounded-full`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
        >
          <i className={`fa-solid ${isAutoPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
        </button>
      </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
