import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const ProductFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Quale versione Android viene preinstallata?',
      answer: 'Il dispositivo viene fornito con Android 14 pre-installato, con aggiornamenti garantiti per 4 anni di versioni major e 5 anni di patch di sicurezza.'
    },
    {
      question: 'La batteria è sostituibile?',
      answer: 'La batteria non è sostituibile dall\'utente per mantenere il design ultra-compatto. È comunque coperta da garanzia di 2 anni e mantiene l\'80% della capacità dopo 800 cicli di ricarica.'
    },
    {
      question: 'È compatibile con le eSIM?',
      answer: 'Sì, il dispositivo supporta dual SIM: 1 nano-SIM fisica + 1 eSIM. Puoi utilizzare entrambe contemporaneamente per lavoro e uso personale.'
    },
    {
      question: 'Posso usarlo con una sola mano?',
      answer: 'Assolutamente sì! Con dimensioni di 89.5 x 45mm e peso di soli 125g, è progettato specificamente per l\'uso con una mano, perfetto anche per tasche piccole.'
    },
    {
      question: 'Come funziona la garanzia?',
      answer: 'Garanzia ufficiale di 2 anni del produttore inclusa. Copre difetti di fabbricazione e malfunzionamenti hardware. Assistenza in italiano con centro riparazioni in Italia.'
    },
    {
      question: 'Quali metodi di pagamento accettate?',
      answer: 'Accettiamo carte di credito/debito (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay e bonifico bancario. Pagamento sicuro con crittografia SSL.'
    },
    {
      question: 'Quanto tempo richiede la spedizione?',
      answer: 'Spedizione express gratuita in tutta Italia. Consegna in 24-48h per le principali città, 2-3 giorni per isole e zone remote. Tracking incluso.'
    },
    {
      question: 'Posso restituire il prodotto?',
      answer: 'Sì, hai 30 giorni per il reso gratuito senza dover fornire motivazioni. Il prodotto deve essere nelle condizioni originali con confezione integra. Rimborso completo entro 5-7 giorni lavorativi.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-600 block mb-2 sm:mb-3">
            Domande Frequenti
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Hai Domande? Rispondiamo Qui
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Non trovi la risposta? Contatta il nostro supporto clienti
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
            Hai ancora dubbi?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 font-medium">
            Il nostro team di supporto è qui per aiutarti
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all inline-flex items-center justify-center gap-2">
              <i className="fa-solid fa-comments"></i>
              Chat dal Vivo
            </button>
            <button className="bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-sm border-2 border-gray-200 hover:border-indigo-600 transition-all inline-flex items-center justify-center gap-2">
              <i className="fa-solid fa-envelope"></i>
              Invia Email
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductFAQ;
