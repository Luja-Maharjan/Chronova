import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

function submitEsewaForm(paymentDetails) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentDetails.url;

  Object.entries(paymentDetails.fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function PaymentFailure() {
  const [retrying, setRetrying] = useState(false);
  const pendingOrderId = sessionStorage.getItem('pendingEsewaOrderId');

  const handleRetryPayment = async () => {
    if (!pendingOrderId) {
      toast.error('No pending order found. Please checkout again.');
      return;
    }

    setRetrying(true);
    try {
      const { data } = await api.post(`/order/${pendingOrderId}/retry-esewa`, {
        frontendUrl: window.location.origin,
      });
      submitEsewaForm(data.paymentDetails);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry payment');
      setRetrying(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Payment Unsuccessful"
        description="Your eSewa payment was not completed. Your order remains pending and no funds were debited. Retry payment anytime."
        noindex
      />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="bg-white border border-gray-150 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-sm space-y-6 animate-in fade-in zoom-in duration-300">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <FiAlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payment Unsuccessful</h1>
          <p className="text-sm text-gray-500">
            Your eSewa transaction could not be completed. You may have cancelled the payment flow or
            encountered an issue. No funds were debited.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your order is saved as pending payment. Your cart and stock remain unchanged.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          {pendingOrderId && (
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {retrying ? (
                <>
                  <FiLoader className="animate-spin" />
                  Redirecting to eSewa...
                </>
              ) : (
                'Retry eSewa Payment'
              )}
            </button>
          )}
          <Link
            to="/checkout"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center"
          >
            {pendingOrderId ? 'Start New Checkout' : 'Try Checkout Again'}
          </Link>
          <Link
            to="/cart"
            className="w-full border border-gray-250 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm text-center"
          >
            Review Cart
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
