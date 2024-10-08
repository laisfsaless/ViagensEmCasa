'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const CheckoutPage: React.FC = () => {
  const t = useTranslations('CheckoutPage');
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const deliveryFee = 5.0;
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  const totalWithDelivery = (parseFloat(cartTotal) + deliveryFee).toFixed(2);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  useEffect(() => {
    const fetchUserData = async () => {
      const session = await getSession();
      if (session) {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        const data = await response.json();
        setName(data.name || '');
        setNif(data.nif || '');
        setContactNumber(data.contactNumber || '');
        setBillingAddress(data.billingAddress || '');
        setShippingAddress(data.shippingAddress || '');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          nif,
          contactNumber,
          billingAddress,
          shippingAddress,
          paymentMethod,
          items: cart,
        }),
      });

      if (response.ok) {
        clearCart();
        router.push(`/${locale}/checkout/order-success`);
      } else {
        const data = await response.json();
        alert(data.error || t('purchaseError'));
      }
    } catch (error) {
      console.error(t('purchaseError'), error);
      alert(t('purchaseError'));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">{t('checkout')}</h1>
        {cart.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-xl text-base-content">{t('emptyCart')}</p>
          </div>
        ) : (
          <div>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('shippingDetails')}</h2>
              {[
                { label: t('name'), value: name, setValue: setName, placeholder: t('enterName'), id: 'name' },
                { label: t('nif'), value: nif, setValue: setNif, placeholder: t('enterNif'), id: 'nif' },
                { label: t('contactNumber'), value: contactNumber, setValue: setContactNumber, placeholder: t('enterContactNumber'), id: 'contactNumber' },
                { label: t('billingAddress'), value: billingAddress, setValue: setBillingAddress, placeholder: t('enterBillingAddress'), id: 'billingAddress' },
                { label: t('shippingAddress'), value: shippingAddress, setValue: setShippingAddress, placeholder: t('enterShippingAddress'), id: 'shippingAddress' },
              ].map(({ label, value, setValue, placeholder, id }) => (
                <div className="mb-4" key={id}>
                  <label htmlFor={id} className="block text-base-content mb-1">{label}</label>
                  <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('paymentMethod')}</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="credit_card">{t('creditCard')}</option>
                <option value="paypal">{t('paypal')}</option>
                <option value="bank_transfer">{t('bankTransfer')}</option>
              </select>
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('orderSummary')}</h2>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 mb-4 bg-base-100 shadow-lg rounded-lg">
                  <div className="flex items-center">
                    <div className="w-16 h-16 relative rounded-lg mr-4">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-base-content">{item.productName}</h3>
                      <p className="text-base-content">{item.price.toFixed(2)} €</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-base-content">{item.quantity}</span>
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm bg-transparent border border-base-content text-base-content rounded-full hover:bg-base-200"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </section>
            <div className="text-2xl font-semibold text-base-content mb-4">
              {t('deliveryFee')}: {deliveryFee.toFixed(2)} €
            </div>
            <div className="text-2xl font-semibold text-base-content mb-4">
              {t('total')}: {totalWithDelivery} €
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout}>
              {t('placeOrder')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg text-primary"></span>
  </div>
);
