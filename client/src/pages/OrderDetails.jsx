import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../AppContext';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { getProductUrl } from '../utils/seo';

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState(false);

  const submitEsewaForm = (paymentDetails) => {
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
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetryingPayment(true);
    try {
      const { data } = await api.post(`/order/${order._id}/retry-esewa`, {
        frontendUrl: window.location.origin,
      });
      sessionStorage.setItem('pendingEsewaOrderId', order._id);
      submitEsewaForm(data.paymentDetails);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry payment');
      setRetryingPayment(false);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/order/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleDeliver = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      await api.put(`/order/${order._id}/deliver`);
      toast.success('Order marked as delivered');
      fetchOrder(); // Refetch updated details
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <SEOHead title="Order Not Found" description="The requested order could not be found." noindex />
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="text-gray-500 mt-2">The order ID is invalid or you do not have permission to view it.</p>
          <Link to="/profile" className="mt-4 inline-block bg-gray-900 text-white px-6 py-2 rounded-lg">
            Go to Order History
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`Order #${order._id.substring(order._id.length - 8).toUpperCase()}`}
        description={`View order details, payment status, and shipping information for your Chronova purchase.`}
        noindex
      />
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Order Receipt</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1">
            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              order.isPaid
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              order.isDelivered
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : order.orderStatus === 'Pending Payment'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-250'
            }`}
          >
            {order.isDelivered ? 'Delivered' : order.orderStatus || 'Processing'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Shipping details */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.user?.name}</p>
              <p>{order.user?.email}</p>
              <p className="pt-2">{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.isDelivered ? (
              <p className="text-xs text-blue-600 mt-4 font-medium bg-blue-50 border border-blue-100 rounded-lg p-3">
                Delivered on {new Date(order.deliveredAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-yellow-600 mt-4 font-medium bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                Order is being processed. It will be shipped soon.
              </p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Payment Information</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between max-w-xs">
                <span className="font-medium text-gray-500">Method:</span>
                <span className="font-semibold text-gray-955">
                  {order.paymentMethod === 'eSewa' ? 'eSewa Pay' : 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="flex justify-between max-w-xs">
                <span className="font-medium text-gray-500">Status:</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid (Pending)'}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <p className="text-xs text-green-650 font-medium bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                  Paid on {new Date(order.paidAt).toLocaleString()}
                </p>
              )}
              {!order.isPaid && order.paymentMethod === 'COD' && (
                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 mt-2">
                  Payment will be collected in cash upon delivery.
                </p>
              )}
              {!order.isPaid && order.paymentMethod === 'eSewa' && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-orange-600 font-medium bg-orange-50 border border-orange-100 rounded-lg p-3">
                    Payment is pending. Complete your eSewa payment to confirm this order.
                  </p>
                  <button
                    onClick={handleRetryPayment}
                    disabled={retryingPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {retryingPayment ? 'Redirecting to eSewa...' : 'Pay with eSewa'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Line items list */}
          <div className="bg-white border border-gray-150 rounded-xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Order Items</h2>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div>
                      <Link to={`/product/${item.product}`} className="hover:underline">
                        <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.qty} &times; Rs. {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Rs. {(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Invoicing */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Cost Summary</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">Rs. {order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  {order.shippingPrice === 0 ? 'Free' : `Rs. ${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-semibold text-gray-900">Rs. {order.taxPrice.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>{order.isPaid ? 'Total Paid' : 'Total Amount'}</span>
                <span>Rs. {order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Admin Action: Mark as Delivered */}
            {user?.isAdmin && !order.isDelivered && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleDeliver}
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  {submitting ? 'Updating status...' : 'Mark as Delivered'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      </article>
    </>
  );
}
