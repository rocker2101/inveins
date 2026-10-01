/**
 * Client-Side Cashfree Payment Gateway Integration (v3 SDK)
 * Dynamically loads official Cashfree Checkout SDK and manages checkout modals & redirects.
 */

declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CashfreePaymentOptions {
  orderId: string;
  paymentSessionId: string;
  environment?: 'sandbox' | 'production';
  onSuccess: (verifiedData: any) => void;
  onFailure: (errorMsg: string) => void;
  onDismiss?: () => void;
}

let cashfreeScriptPromise: Promise<boolean> | null = null;

/**
 * Ensures Cashfree JS SDK v3 script is loaded in the browser
 */
export function loadCashfreeScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Cashfree) {
    return Promise.resolve(true);
  }

  if (cashfreeScriptPromise) {
    return cashfreeScriptPromise;
  }

  cashfreeScriptPromise = new Promise((resolve) => {
    // Check if script element already exists in document
    const existingScript = document.querySelector('script[src*="cashfree.com/js/v3/cashfree.js"]');
    if (existingScript) {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[CASHFREE] Failed to load Cashfree JS SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return cashfreeScriptPromise;
}

/**
 * Initializes Cashfree instance and opens the checkout modal
 */
export async function openCashfreeCheckout(options: CashfreePaymentOptions): Promise<void> {
  const isLoaded = await loadCashfreeScript();

  if (!isLoaded || !window.Cashfree) {
    options.onFailure('Could not connect to Cashfree payment gateway. Please check your internet connection.');
    return;
  }

  try {
    const mode = options.environment === 'production' ? 'production' : 'sandbox';
    const cashfree = window.Cashfree({ mode });

    // Open checkout in modal overlay
    const checkoutResult = await cashfree.checkout({
      paymentSessionId: options.paymentSessionId,
      redirectTarget: '_modal',
    });

    if (checkoutResult?.error) {
      console.warn('[CASHFREE] Checkout warning/error:', checkoutResult.error);
      const msg = checkoutResult.error?.message || 'Payment was not completed.';
      
      // If user closed/dismissed the modal
      if (checkoutResult.error?.code === 'payment_cancelled' || msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dismiss')) {
        if (options.onDismiss) {
          options.onDismiss();
        } else {
          options.onFailure('Payment window was closed. You can retry or choose Cash on Delivery.');
        }
        return;
      }

      options.onFailure(msg);
      return;
    }

    // Modal completed — verify order status authoritatively with our backend
    try {
      const verifyRes = await fetch('/api/payment/cashfree-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: options.orderId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        options.onSuccess(verifyData);
      } else {
        // If still pending or gateway sync taking a moment, give polite notice
        options.onFailure(verifyData.message || 'Payment is being processed. Please verify your order status.');
      }
    } catch (verifyErr) {
      console.error('[CASHFREE] Error during backend verification:', verifyErr);
      options.onFailure('Network error verifying transaction. Please check Track Order in your account.');
    }
  } catch (err: any) {
    console.error('[CASHFREE] Checkout launch exception:', err);
    options.onFailure('Failed to open payment modal: ' + (err?.message || String(err)));
  }
}
