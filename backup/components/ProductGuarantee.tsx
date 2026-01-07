import React from 'react';

const ProductGuarantee: React.FC = () => {
  const guarantees = [
    {
      icon: 'fa-shield-check',
      title: 'Garanzia 2 Anni',
      description: 'Copertura completa su difetti di fabbricazione e malfunzionamenti hardware',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: 'fa-rotate-left',
      title: 'Reso Gratuito 30 Giorni',
      description: 'Non sei soddisfatto? Rimborso completo senza domande',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: 'fa-truck-fast',
      title: 'Spedizione Express Gratuita',
      description: 'Consegna rapida in 24-48h in tutta Italia con tracking incluso',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: 'fa-headset',
      title: 'Supporto Dedicato',
      description: 'Assistenza clienti in italiano via chat, email e telefono',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: 'fa-lock',
      title: 'Pagamento Sicuro',
      description: 'Transazioni protette con crittografia SSL e certificazione PCI DSS',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: 'fa-certificate',
      title: 'Prodotto Originale',
      description: 'Dispositivi autentici con garanzia ufficiale del produttore',
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            Acquista con Fiducia
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Le Nostre Garanzie
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            La tua soddisfazione è la nostra priorità. Acquista senza rischi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {guarantees.map((item, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <i className={`fa-solid ${item.icon} text-2xl sm:text-3xl text-white`}></i>
                </div>
                
                <h3 className="text-base sm:text-lg font-black text-gray-900 mb-2 sm:mb-3">
                  {item.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-100">
          <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-6 sm:mb-8">
            Certificazioni e Partner
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fa-solid fa-lock text-xl sm:text-2xl"></i>
              <span className="text-xs sm:text-sm font-black uppercase">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fa-brands fa-cc-visa text-2xl sm:text-3xl"></i>
              <i className="fa-brands fa-cc-mastercard text-2xl sm:text-3xl"></i>
              <i className="fa-brands fa-cc-paypal text-2xl sm:text-3xl"></i>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fa-solid fa-shield-halved text-xl sm:text-2xl"></i>
              <span className="text-xs sm:text-sm font-black uppercase">PCI DSS</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <i className="fa-solid fa-truck text-xl sm:text-2xl"></i>
              <span className="text-xs sm:text-sm font-black uppercase">DHL Express</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGuarantee;
