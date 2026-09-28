'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (isCheckoutOpen) {
      setIsCheckoutOpen(false);
      router.push('/checkout');
    }
  }, [isCheckoutOpen, setIsCheckoutOpen, router]);

  return null;
};
