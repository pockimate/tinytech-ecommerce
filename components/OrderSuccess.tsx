import React from 'react';

interface OrderSuccessProps {
  orderId: string;
  onContinueShopping: () => void;
  onViewOrders: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ 
  orderId, 
  onContinueShopping,
  onViewOrders
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4 py-24">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <i className="fa-solid fa-check text-5xl text-green-600"></i>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Ordine Confermato!
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Grazie per il tuo acquisto. Il tuo ordine è stato ricevuto con successo.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Numero Ordine</p>
              <p className="text-2xl font-black text-gray-900">{orderId}</p>
            </div>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
              <i className="fa-solid fa-circle-check mr-2"></i>
              Confermato
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-envelope text-indigo-600 text-xl"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Email di Conferma</p>
                <p className="text-sm text-gray-600">
                  Ti abbiamo inviato una email di conferma con tutti i dettagli dell'ordine.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-truck-fast text-indigo-600 text-xl"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Spedizione Stimata</p>
                <p className="text-sm text-gray-600">
                  Il tuo ordine verrà spedito entro 1-2 giorni lavorativi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-box text-indigo-600 text-xl"></i>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Tracciamento</p>
                <p className="text-sm text-gray-600">
                  Riceverai un numero di tracciamento appena il pacco sarà spedito.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <h3 className="font-black text-xl mb-6">Cosa Succede Ora?</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="w-0.5 h-full bg-green-600 mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <p className="font-bold text-gray-900">Ordine Ricevuto</p>
                <p className="text-sm text-gray-600">Oggi</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <p className="font-bold text-gray-900">In Elaborazione</p>
                <p className="text-sm text-gray-600">1-2 giorni</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold">
                  3
                </div>
                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
              </div>
              <div className="flex-1 pb-6">
                <p className="font-bold text-gray-600">Spedito</p>
                <p className="text-sm text-gray-500">2-3 giorni</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-600">Consegnato</p>
                <p className="text-sm text-gray-500">5-7 giorni</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onViewOrders}
            className="bg-indigo-600 text-white py-4 px-6 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg"
          >
            <i className="fa-solid fa-receipt mr-2"></i>
            Visualizza Ordine
          </button>
          <button
            onClick={onContinueShopping}
            className="bg-white text-gray-900 border-2 border-gray-200 py-4 px-6 rounded-2xl font-black hover:bg-gray-50 transition-all"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Continua lo Shopping
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Hai bisogno di aiuto? Contattaci
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <a href="mailto:support@tinytech.com" className="text-indigo-600 hover:text-indigo-700">
              <i className="fa-solid fa-envelope mr-2"></i>
              Email
            </a>
            <a href="tel:+39123456789" className="text-indigo-600 hover:text-indigo-700">
              <i className="fa-solid fa-phone mr-2"></i>
              Telefono
            </a>
            <button className="text-indigo-600 hover:text-indigo-700">
              <i className="fa-solid fa-comments mr-2"></i>
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
