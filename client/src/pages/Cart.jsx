import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import { getProductUrl } from '../utils/seo';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, user } = useApp();
  const navigate = useNavigate();

  // Calculations
  const originalPrice = cart.reduce((acc, item) => {
    if (!item.product) return acc;
    return acc + item.product.price * item.quantity;
  }, 0);

  const itemsPrice = cart.reduce((acc, item) => {
    if (!item.product) return acc;
    const price = item.product.price * (1 - (item.product.discount || 0) / 100);
    return acc + price * item.quantity;
  }, 0);

  const totalSavings = originalPrice - itemsPrice;

  const shippingPrice = itemsPrice > 0 && itemsPrice < 100 ? 10 : 0;
  const taxPrice = itemsPrice * 0.1; // 10% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleQtyChange = (productId, currentQty, action, stockLimit) => {
    if (action === 'dec' && currentQty > 1) {
      updateCartQty(productId, currentQty - 1);
    } else if (action === 'inc' && currentQty < stockLimit) {
      updateCartQty(productId, currentQty + 1);
    }
  };

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <SEOHead
          title="Shopping Cart"
          description="Your Chronova shopping cart is empty. Browse our premium watch collection and add your favorite timepieces to cart."
          keywords="shopping cart, Chronova watches, buy watches Nepal"
          canonical="/cart"
        />
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>
            <p className="text-gray-500 mt-2">
              Looks like you haven&apos;t added any products to your cart yet. Head back to the shop to find your perfect timepiece.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Shopping Cart — Review Your Order"
        description="Review items in your Chronova shopping cart. Update quantities, apply discounts, and proceed to secure checkout with eSewa or Cash on Delivery."
        keywords="shopping cart, checkout, Chronova watches, order summary"
        canonical="/cart"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            return (
              <div
                key={prod._id}
                className="flex items-center gap-4 bg-white border border-gray-150 rounded-xl p-4 sm:p-5"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.imageAlt || `${prod.name} watch in cart`}
                    title={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>

                {/* Info & Quantity & Action */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-gray-400 text-xxs font-semibold uppercase">{prod.category?.name}</span>
                    <Link to={getProductUrl(prod)} className="hover:underline">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mt-0.5">{prod.name}</h3>
                    </Link>
                    {prod.discount > 0 ? (
                      <div className="flex flex-col mt-1">
                        <span className="text-sm font-bold text-gray-900">Rs. {(prod.price * (1 - prod.discount / 100)).toFixed(2)}</span>
                        <span className="text-xxs text-gray-400 line-through">Rs. {prod.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-900 mt-1">Rs. {prod.price.toFixed(2)}</p>
                    )}
                  </div>

                  {/* Quantity Toggles */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(prod._id, item.quantity, 'dec', prod.countInStock)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(prod._id, item.quantity, 'inc', prod.countInStock)}
                        disabled={item.quantity >= prod.countInStock}
                        className="px-2 py-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30 cursor-pointer"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(prod._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-150 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">Rs. {itemsPrice.toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-700">
                  <span className="font-medium">Discount Savings</span>
                  <span className="font-semibold">− Rs. {totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">
                  {shippingPrice === 0 ? 'Free' : `Rs. ${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (10%)</span>
                <span className="font-medium text-gray-900">Rs. {taxPrice.toFixed(2)}</span>
              </div>
              <hr className="border-gray-100 my-2" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors cursor-pointer text-sm"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight size={16} />
            </button>

            {shippingPrice > 0 && (
              <p className="text-xxs text-center text-gray-500">
                Spend Rs. {(100 - itemsPrice).toFixed(2)} more to qualify for FREE shipping!
              </p>
            )}
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
