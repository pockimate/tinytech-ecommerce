import React, { useState, useEffect } from 'react';
import { LogoSettings } from '../types';
import { useTranslation, useTranslatedText } from '../context/TranslationContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  onNavigate: (view: any) => void;
  userLoggedIn: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'BRL' | 'MXN';
  onCurrencyChange: (curr: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'CAD' | 'AUD' | 'CHF' | 'INR' | 'BRL' | 'MXN') => void;
  logoSettings?: LogoSettings;
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onCartClick,
  onNavigate,
  userLoggedIn,
  onLoginClick,
  onLogout,
  currency,
  onCurrencyChange,
  logoSettings
}) => {
  const { language, setLanguage, availableLanguages, translate } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [navLabels, setNavLabels] = useState<Record<string, string>>({});

  const currencies = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'Pound' },
    JPY: { symbol: '¥', name: 'Yen' },
    CNY: { symbol: '¥', name: 'Yuan' },
    KRW: { symbol: '₩', name: 'Won' },
    CAD: { symbol: 'C$', name: 'CAD' },
    AUD: { symbol: 'A$', name: 'AUD' },
    CHF: { symbol: 'Fr', name: 'Franc' },
    INR: { symbol: '₹', name: 'Rupee' },
    BRL: { symbol: 'R$', name: 'Real' },
    MXN: { symbol: 'MX$', name: 'Peso' }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 翻译导航标签
  useEffect(() => {
    const translateNavLabels = async () => {
      const labels: Record<string, string> = {};
      const keys = ['home', 'products', 'blog', 'track order'];
      
      for (const key of keys) {
        const translated = await translate(key);
        labels[key] = translated;
      }
      setNavLabels(labels);
    };
    
    if (language !== 'en') {
      translateNavLabels();
    } else {
      setNavLabels({
        'home': 'Home',
        'products': 'Products',
        'blog': 'Blog',
        'track order': 'Track Order'
      });
    }
  }, [language, translate]);

  const navItems = [
    { key: 'home', view: 'home' },
    { key: 'products', view: 'products' },
    { key: 'blog', view: 'blog' },
    { key: 'track order', view: 'track' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 sm:py-4' : 'py-6 sm:py-8'} glass shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
          >
            <i className={`fa-solid ${showMobileMenu ? 'fa-xmark' : 'fa-bars'} text-lg text-gray-700`}></i>
          </button>

          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            {logoSettings?.headerLogo?.image ? (
              <img 
                src={logoSettings.headerLogo.image}
                alt="Logo"
                style={{ 
                  width: scrolled ? logoSettings.headerLogo.width * 0.9 : logoSettings.headerLogo.width,
                  height: scrolled ? logoSettings.headerLogo.height * 0.9 : logoSettings.headerLogo.height
                }}
                className="object-contain transition-all"
              />
            ) : (
              <div className="bg-indigo-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">TT</div>
            )}
            <span className="font-black text-xl sm:text-2xl tracking-tighter block">{logoSettings?.headerLogo?.text || 'TinyTech'}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item, idx) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view as any)}
                className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors relative group"
              >
                {navLabels[item.key] || item.key}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector - Hidden */}
          {/* <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowCurrMenu(false);
              }}
              className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
            >
              <span className="text-base sm:text-lg">{availableLanguages.find(l => l.code === language)?.flag || '🇺🇸'}</span>
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </button>
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-48 max-h-80 overflow-y-auto z-50">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${language === lang.code ? 'bg-indigo-50 text-indigo-600 font-bold' : ''}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                    {language === lang.code && <i className="fa-solid fa-check ml-auto text-xs"></i>}
                  </button>
                ))}
              </div>
            )}
          </div> */}

          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCurrMenu(!showCurrMenu);
                setShowLangMenu(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
            >
              <span className="text-xs sm:text-sm font-bold">{currencies[currency].symbol}</span>
              <span className="hidden sm:inline text-xs font-bold">{currency}</span>
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </button>
            {showCurrMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-40 max-h-80 overflow-y-auto z-50">
                {(Object.keys(currencies) as Array<keyof typeof currencies>).map(curr => (
                  <button
                    key={curr}
                    onClick={() => {
                      onCurrencyChange(curr);
                      setShowCurrMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${currency === curr ? 'bg-indigo-50 text-indigo-600 font-bold' : ''}`}
                  >
                    <span className="font-bold text-sm">{currencies[curr].symbol}</span>
                    <span className="text-sm">{curr}</span>
                    {currency === curr && <i className="fa-solid fa-check ml-auto text-xs"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <div 
            className="relative cursor-pointer hover:scale-110 transition-transform p-2 bg-gray-50 rounded-full flex"
            onClick={() => onNavigate('wishlist')}
          >
            <i className="fa-regular fa-heart text-lg sm:text-xl text-gray-700"></i>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Account Icon with Dropdown */}
          <div className="relative group">
            <div 
              className="cursor-pointer hover:scale-110 transition-transform p-2 bg-gray-50 rounded-full"
              onClick={userLoggedIn ? undefined : onLoginClick}
            >
              <i className={`fa-regular ${userLoggedIn ? 'fa-circle-user' : 'fa-user'} text-lg sm:text-xl text-gray-700`}></i>
            </div>
            {userLoggedIn && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={() => onNavigate('account')}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-t-xl flex items-center gap-2"
                >
                  <i className="fa-regular fa-user"></i>
                  我的账户
                </button>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-b-xl flex items-center gap-2"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  退出登录
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <div className="relative cursor-pointer hover:scale-110 transition-transform p-2 bg-indigo-600 rounded-full shadow-lg" onClick={onCartClick}>
            <i className="fa-solid fa-bag-shopping text-lg sm:text-xl text-white"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-indigo-600 text-[8px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold shadow-md ring-2 ring-indigo-600">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[100]"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div className={`lg:hidden fixed top-0 left-0 w-72 bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} rounded-br-3xl`}>
        <div className="bg-white rounded-br-3xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {logoSettings?.headerLogo?.image ? (
                <img 
                  src={logoSettings.headerLogo.image}
                  alt="Logo"
                  style={{ width: 32, height: 32 }}
                  className="object-contain"
                />
              ) : (
                <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg font-bold text-lg flex items-center justify-center">TT</div>
              )}
              <span className="font-black text-xl tracking-tighter">{logoSettings?.headerLogo?.text || 'TinyTech'}</span>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl text-gray-500"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view as any);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                >
                  <i className={`fa-solid ${
                    item.key === 'home' ? 'fa-house' :
                    item.key === 'products' ? 'fa-box' :
                    item.key === 'blog' ? 'fa-newspaper' :
                    'fa-truck'
                  } text-indigo-600 w-5`}></i>
                  <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {navLabels[item.key] || item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                  </span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>

            {/* Account & Wishlist */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (userLoggedIn) {
                    onNavigate('account');
                  } else {
                    onLoginClick();
                  }
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
              >
                <i className={`fa-regular ${userLoggedIn ? 'fa-circle-user' : 'fa-user'} text-indigo-600 w-5`}></i>
                <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  {userLoggedIn ? 'Account' : 'Login'}
                </span>
              </button>
              <button
                onClick={() => {
                  onNavigate('wishlist');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors group"
              >
                <i className="fa-regular fa-heart text-indigo-600 w-5"></i>
                <span className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
