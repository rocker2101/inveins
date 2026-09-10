/**
 * Client-Side Razorpay Payment Gateway Integration
 * Dynamically loads official Razorpay Checkout SDK and handles payment flows
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentOptions {
  orderId: string; // Internal order ID e.g. INV-XXXXX
  razorpayOrderId: string; // Razorpay order_id e.g. order_XXXXX
  amount: number; // Amount in paise e.g. 149900
  currency?: string;
  keyId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  onSuccess: (verifiedData: any) => void;
  onFailure: (errorMsg: string) => void;
  onDismiss?: () => void;
}

/**
 * Ensures Razorpay Checkout.js script is loaded in the browser
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Launches the official Razorpay Checkout Popup
 */
export async function openRazorpayCheckout(options: RazorpayPaymentOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    options.onFailure("Could not connect to Razorpay payment gateway. Please check your internet connection.");
    return;
  }

  const rzpOptions = {
    key: options.keyId,
    amount: options.amount,
    currency: options.currency || "INR",
    name: "INVEINS",
    description: `Order #${options.orderId}`,
    image: "/favicon.ico",
    order_id: options.razorpayOrderId,
    prefill: {
      name: options.customerName,
      email: options.customerEmail || "",
      contact: options.customerPhone,
    },
    theme: {
      color: "#141413",
      backdrop_color: "rgba(0, 0, 0, 0.7)",
    },
    modal: {
      confirm_close: true,
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        } else {
          options.onFailure("Payment process cancelled. You can retry or choose Cash on Delivery.");
        }
      },
    },
    handler: async function (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) {
      try {
        // Send payment signature to backend for cryptographic verification
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            order_id: options.orderId,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          options.onSuccess(verifyData);
        } else {
          options.onFailure(verifyData.message || "Cryptographic payment verification failed. Please contact support.");
        }
      } catch (err: any) {
        options.onFailure("Network error verifying transaction. Please contact support.");
      }
    },
  };

  try {
    const rzp = new window.Razorpay(rzpOptions);

    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay payment failure:", response.error);
      const desc = response?.error?.description || "Transaction failed or was declined by the bank.";
      options.onFailure(desc);
    });

    rzp.open();
  } catch (initErr: any) {
    console.error("Failed to initialize Razorpay checkout:", initErr);
    options.onFailure("Failed to initialize checkout modal: " + (initErr?.message || String(initErr)));
  }
}
