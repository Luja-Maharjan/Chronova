import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();

  // Form states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Calculations
  const itemsPrice = cart.reduce((acc, item) => {
    if (!item.product) return acc;
    const price = item.product.price * (1 - (item.product.discount || 0) / 100);
    return acc + price * item.quantity;
  }, 0);
  const shippingPrice = itemsPrice > 0 && itemsPrice < 100 ? 10 : 0;
  const taxPrice = itemsPrice * 0.1;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode || !country) {
      toast.error('Please enter all shipping details');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = cart
        .filter((item) => item.product)
        .map((item) => ({
          name: item.product.name,
          qty: item.quantity,
          image: item.product.image,
          price: item.product.price * (1 - (item.product.discount || 0) / 100),
          product: item.product._id,
        }));

      const { data } = await api.post('/order', {
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        paymentMethod,
        frontendUrl: window.location.origin,
      });

      if (paymentMethod === 'eSewa' && data.paymentDetails) {
        // Store pending order ID so user can retry payment if eSewa fails
        sessionStorage.setItem('pendingEsewaOrderId', data._id);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentDetails.url;

        Object.entries(data.paymentDetails.fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.success('Order placed successfully!');
        await clearCart();
        navigate(`/order/${data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Secure Checkout"
        description="Complete your Chronova watch purchase securely. Enter shipping details and pay with eSewa or Cash on Delivery."
        keywords="checkout, secure payment, eSewa, COD, buy watches Nepal"
        canonical="/checkout"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Shipping Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-150 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="123 Watchmaker St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                    placeholder="Kathmandu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                    placeholder="44600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                  placeholder="Nepal"
                />
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* COD Option */}
                  <label
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="sr-only"
                    />
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                      <span className="text-indigo-600 text-xs font-bold">COD</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Cash on Delivery</span>
                    <span className="text-xxs text-gray-500 mt-1 text-center">Pay with cash when your package arrives</span>
                  </label>

                  {/* eSewa Option */}
                  <label
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'eSewa'
                        ? 'border-green-600 bg-green-50/20 ring-2 ring-green-600/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="eSewa"
                      checked={paymentMethod === 'eSewa'}
                      onChange={() => setPaymentMethod('eSewa')}
                      className="sr-only"
                    />
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <span className="text-green-600 text-xs font-extrabold font-mono">eS</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">eSewa Pay</span>
                    <span className="text-xxs text-gray-500 mt-1 text-center">Instantly pay using your eSewa digital wallet</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  {submitting
                    ? 'Placing your order...'
                    : paymentMethod === 'eSewa'
                    ? 'Proceed to eSewa Pay'
                    : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Items & Totals Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-150 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Details</h2>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2 space-y-3">
              {cart.map((item) => (
                <div key={item.product?._id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-12 h-12 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.product?.name}</h4>
                      <p className="text-xxs text-gray-500">Qty: {item.quantity} &times; Rs. {(item.product?.price * (1 - (item.product?.discount || 0) / 100)).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    Rs. {((item.product?.price * (1 - (item.product?.discount || 0) / 100)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>Rs. {itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `Rs. ${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>Rs. {taxPrice.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
