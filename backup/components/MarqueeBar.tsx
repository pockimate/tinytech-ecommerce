import React from 'react';

interface MarqueeBarProps {
  items: string[];
  speed?: number;
  backgroundColor?: string;
  textColor?: string;
}

const MarqueeBar: React.FC<MarqueeBarProps> = ({ 
  items, 
  speed = 50,
  backgroundColor = 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
  textColor = 'text-white'
}) => {
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className={`${backgroundColor} py-3 overflow-hidden relative`}>
      <div className="marquee-container flex">
        <div 
          className="marquee-content flex items-center whitespace-nowrap"
          style={{
            animation: `marquee ${speed}s linear infinite`
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div key={index} className="flex items-center mx-8">
              <span className={`${textColor} font-semibold text-sm sm:text-base flex items-center`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .marquee-container {
          position: relative;
        }
        
        .marquee-content {
          display: flex;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default MarqueeBar;
