import React, { useEffect, useState } from 'react';
import TranslatedInput from './TranslatedInput';

interface PromoModalProps {
  onClose: () => void;
  onClaim: () => void;
}

const PromoModal: React.FC<PromoModalProps> = ({ onClose, onClaim }) => {
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleClaim = () => {
    if (email) {
      onClaim();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all z-10"
        >
          <i className="fa-solid fa-xmark text-gray-600 text-sm sm:text-base"></i>
        </button>

        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i className="fa-solid fa-gift text-2xl sm:text-4xl"></i>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-center mb-2 sm:mb-3">
              Offerta Esclusiva!
            </h2>
            <p className="text-center text-white/90 font-medium text-sm sm:text-base lg:text-lg">
              Ottieni <strong>20% di sconto</strong> sul tuo primo ordine
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 lg:p-8">
          {/* Countdown */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="fa-solid fa-clock text-orange-600 animate-pulse text-sm"></i>
              <span className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                L'offerta scade tra:
              </span>
            </div>
            <div className="flex justify-center gap-2">
              <div className="bg-white rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-orange-600">{String(minutes).padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Min</div>
              </div>
              <div className="flex items-center text-xl sm:text-2xl font-black text-orange-600">:</div>
              <div className="bg-white rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 min-w-[50px] sm:min-w-[60px] text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-orange-600">{String(seconds).padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase">Sec</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-green-600 text-xs sm:text-sm"></i>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">20% di sconto immediato</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-green-600 text-xs sm:text-sm"></i>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Spedizione express gratuita</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-check text-green-600 text-xs sm:text-sm"></i>
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Accesso a offerte esclusive</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-3 sm:mb-4">
            <TranslatedInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholderFallback="Enter your email"
              className="w-full px-3 py-3 sm:px-4 sm:py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-medium text-sm sm:text-base"
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClaim}
            disabled={!email}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-black text-sm sm:text-base lg:text-lg uppercase tracking-wide hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-gift"></i>
            Richiedi lo Sconto
          </button>

          {/* Trust Badge */}
          <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4 font-medium">
            <i className="fa-solid fa-lock mr-1"></i>
            I tuoi dati sono al sicuro. No spam.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PromoModal;
