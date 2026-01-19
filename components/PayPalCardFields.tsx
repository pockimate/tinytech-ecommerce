/**
 * PayPal Card Fields v6 Component
 * Renders secure hosted card input fields using PayPal SDK v6
 */

import React, { useEffect, useRef } from 'react';
import { TranslatedText } from './TranslatedText';

interface PayPalCardFieldsProps {
  onSetupComplete: (containers: {
    number: string | HTMLElement;
    expiry: string | HTMLElement;
    cvv: string | HTMLElement;
    name?: string | HTMLElement;
  }) => Promise<void>;
  currency?: string;
}

export const PayPalCardFields: React.FC<PayPalCardFieldsProps> = ({
  onSetupComplete,
  currency = 'USD'
}) => {
  const numberRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const cvvRef = useRef<HTMLDivElement>(null);
  const [isSetup, setIsSetup] = React.useState(false);
  const setupAttemptedRef = useRef(false); // Prevent multiple setup attempts

  useEffect(() => {
    // Prevent multiple setup attempts
    if (isSetup || setupAttemptedRef.current) return;

    const setupFields = async () => {
      try {
        if (!numberRef.current || !expiryRef.current || !cvvRef.current) {
          console.error('[PayPalCardFields] Container refs not ready');
          return;
        }

        console.log('[PayPalCardFields] Setting up card fields...');
        setupAttemptedRef.current = true;

        // Only pass number, expiry, cvv (no name field)
        await onSetupComplete({
          number: numberRef.current,
          expiry: expiryRef.current,
          cvv: cvvRef.current
        });

        setIsSetup(true);
        console.log('[PayPalCardFields] Card fields setup complete');
      } catch (error) {
        console.error('[PayPalCardFields] Setup error:', error);
        setupAttemptedRef.current = false; // Allow retry on error
      }
    };

    // Delay setup to ensure DOM is ready
    const timer = setTimeout(setupFields, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [onSetupComplete, isSetup]);

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-credit-card text-indigo-600"></i>
        <TranslatedText fallback="Credit Card" />
      </h3>

      {/* Security Badge */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <i className="fa-solid fa-shield-halved text-green-600"></i>
        <div className="text-sm text-green-800">
          <strong>Secure Payment</strong>
          <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Card Number Field */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <TranslatedText fallback="Card Number" /> *
          </label>
          <div
            ref={numberRef}
            className="w-full rounded-xl border-2 border-gray-200 focus-within:border-indigo-600 transition-colors bg-white overflow-hidden"
            style={{ minHeight: '48px', maxHeight: '48px' }}
          />
        </div>

        {/* Expiry and CVV Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <TranslatedText fallback="Expiry" /> *
            </label>
            <div
              ref={expiryRef}
              className="w-full rounded-xl border-2 border-gray-200 focus-within:border-indigo-600 transition-colors bg-white overflow-hidden"
              style={{ minHeight: '48px', maxHeight: '48px' }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <TranslatedText fallback="CVV" /> *
              <i className="fa-solid fa-question-circle text-gray-400 cursor-help" title="3-4 digit security code on the back of your card"></i>
            </label>
            <div
              ref={cvvRef}
              className="w-full rounded-xl border-2 border-gray-200 focus-within:border-indigo-600 transition-colors bg-white overflow-hidden"
              style={{ minHeight: '48px', maxHeight: '48px' }}
            />
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Accepted cards:</span>
          <div className="flex gap-2">
            <i className="fa-brands fa-cc-visa text-blue-600 text-2xl"></i>
            <i className="fa-brands fa-cc-mastercard text-red-600 text-2xl"></i>
            <i className="fa-brands fa-cc-amex text-blue-500 text-2xl"></i>
            <i className="fa-brands fa-cc-discover text-orange-500 text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
