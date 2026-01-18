/**
 * React Hook for PayPal Card Fields v6
 * Manages Card Fields SDK initialization and state
 */

import { useState, useEffect, useCallback } from 'react';
import {
  initializePayPalSDKV6,
  isCardFieldsEligible,
  createCardFieldsSession,
  renderCardFields,
  submitCardPayment,
  isSDKInitialized
} from '../services/paypalCardFieldsV6';

interface UsePayPalCardFieldsReturn {
  isInitialized: boolean;
  isEligible: boolean;
  isProcessing: boolean;
  error: string | null;
  setupCardFields: (containers: {
    number: string | HTMLElement;
    expiry: string | HTMLElement;
    cvv: string | HTMLElement;
    name?: string | HTMLElement;
  }) => Promise<void>;
  submitPayment: (
    orderId: string,
    billingAddress?: {
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      adminArea1?: string;
      adminArea2?: string;
      countryCode?: string;
    }
  ) => Promise<{
    success: boolean;
    orderId?: string;
    liabilityShift?: string;
    error?: string;
    state: 'succeeded' | 'canceled' | 'failed';
  }>;
}

export function usePayPalCardFields(currency: string = 'USD'): UsePayPalCardFieldsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardSession, setCardSession] = useState<any>(null);

  // Initialize SDK on mount
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        console.log('[usePayPalCardFields] Initializing SDK...');
        
        // Initialize SDK
        const sdkInstance = await initializePayPalSDKV6();
        
        if (!mounted) return;

        // Check eligibility
        const eligible = await isCardFieldsEligible(currency);
        
        if (!mounted) return;

        setIsEligible(eligible);
        setIsInitialized(true);
        setError(null);

        console.log('[usePayPalCardFields] SDK initialized successfully');
        console.log('[usePayPalCardFields] Card Fields eligible:', eligible);
      } catch (err) {
        if (!mounted) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Card Fields';
        console.error('[usePayPalCardFields] Initialization error:', errorMessage);
        setError(errorMessage);
        setIsInitialized(false);
        setIsEligible(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [currency]);

  // Setup card fields in containers
  const setupCardFields = useCallback(async (containers: {
    number: string | HTMLElement;
    expiry: string | HTMLElement;
    cvv: string | HTMLElement;
    name?: string | HTMLElement;
  }) => {
    try {
      console.log('[usePayPalCardFields] Setting up card fields...');

      // Create session
      const session = createCardFieldsSession();
      setCardSession(session);

      // Render fields
      renderCardFields(session, containers);

      console.log('[usePayPalCardFields] Card fields setup complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to setup card fields';
      console.error('[usePayPalCardFields] Setup error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Submit payment
  const submitPayment = useCallback(async (
    orderId: string,
    billingAddress?: {
      postalCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      adminArea1?: string;
      adminArea2?: string;
      countryCode?: string;
    }
  ) => {
    if (!cardSession) {
      return {
        success: false,
        error: 'Card session not initialized',
        state: 'failed' as const
      };
    }

    try {
      setIsProcessing(true);
      console.log('[usePayPalCardFields] Submitting payment...');

      const result = await submitCardPayment(cardSession, orderId, billingAddress);

      console.log('[usePayPalCardFields] Payment result:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment submission failed';
      console.error('[usePayPalCardFields] Submit error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
        state: 'failed' as const
      };
    } finally {
      setIsProcessing(false);
    }
  }, [cardSession]);

  return {
    isInitialized,
    isEligible,
    isProcessing,
    error,
    setupCardFields,
    submitPayment
  };
}
