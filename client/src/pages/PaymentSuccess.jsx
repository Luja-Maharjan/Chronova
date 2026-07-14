import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useApp } from '../AppContext';
import SEOHead from '../components/SEOHead';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useApp();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying');
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const dataParam = searchParams.get('data');

  const verifyPayment = useCallback(async () => {
    if (!dataParam) {
      setStatus('error');
      setErrorMessage('Invalid access. Payment details are missing.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/order/verify-esewa', { data: dataParam });
      setOrderDetails(data.order);
      setStatus('success');
      sessionStorage.removeItem('pendingEsewaOrderId');
      await clearCart();
      toast.success('Payment verified successfully!');
    } catch (err) {
      console.error('[PaymentSuccess] Verification failed:', err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 'Payment verification failed. Please contact support.'
      );
      toast.error('Payment verification failed.');
    } finally {
      setLoading(false);
    }
  }, [dataParam, clearCart]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  if (loading) {
    return (
      <>
        <SEOHead title="Verifying Payment" description="Your eSewa payment is being verified. Please wait while we confirm your transaction." noindex />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white border border-gray-150 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6">
          <div className="flex justify-center">
            <FiLoader className="h-12 w-12 text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verifying Payment</h2>
            <p className="text-sm text-gray-500">
              Please do not refresh the page or click back. We are verifying your transaction with eSewa.
            </p>
          </div>
        </div>
        </div>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <SEOHead title="Payment Verification Failed" description="We could not verify your eSewa payment. Please retry checkout or contact Chronova support." noindex />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md w-full text-center shadow-sm space-y-6">
          <div className="flex justify-center">
            <FiXCircle className="h-16 w-16 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Verification Failed</h2>
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
              {errorMessage}
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/checkout"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors text-sm text-center"
            >
              Retry Checkout
            </Link>
            <Link
              to="/"
              className="w-full border border-gray-250 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors text-sm text-center"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Payment Successful"
        description="Your Chronova order payment was successful. Thank you for shopping premium watches with us."
        noindex
      />
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-12">
      <div className="bg-white border border-gray-150 rounded-2xl p-8 sm:p-10 max-w-lg w-full shadow-sm space-y-8 animate-in fade-in zoom-in duration-300">

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
            <FiCheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Successful</h1>
          <p className="text-sm text-gray-500">Thank you for your order! Your payment has been received.</p>
        </div>

        {orderDetails && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-sm space-y-3">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Order ID</span>
              <span className="font-mono font-bold text-gray-900">
                #{orderDetails._id.substring(orderDetails._id.length - 8).toUpperCase()}
              </span>
            </div>
            {orderDetails.paymentResult && (
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">eSewa Ref ID</span>
                <span className="font-mono text-gray-900 font-semibold">
                  {orderDetails.paymentResult.id}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-gray-500 font-medium">Amount Paid</span>
              <span className="font-bold text-gray-950 text-base">
                Rs. {orderDetails.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Link
            to={orderDetails ? `/order/${orderDetails._id}` : '/profile'}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm text-center flex items-center justify-center"
          >
            View Order
          </Link>
          <Link
            to="/shop"
            className="w-full border border-gray-250 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm text-center flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
