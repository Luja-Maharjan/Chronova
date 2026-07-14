import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-gray-900 font-bold tracking-wider text-lg">CHRONOVA</p>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Premium watches and timepieces for every style. Shop luxury, smart, and classic watches with fast delivery across Nepal.
            </p>
          </div>

          <nav aria-label="Shop links">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Shop</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/shop" className="hover:text-gray-900 transition-colors">All Watches</Link></li>
              <li><Link to="/cart" className="hover:text-gray-900 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-gray-900 transition-colors">My Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-gray-900 transition-colors">My Account</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Company</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-gray-900 transition-colors">About Chronova</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact Us</Link></li>
            </ul>
          </nav>

          <nav aria-label="Account links">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Account</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/login" className="hover:text-gray-900 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-gray-900 transition-colors">Create Account</Link></li>
              <li><Link to="/checkout" className="hover:text-gray-900 transition-colors">Checkout</Link></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Chronova. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <span className="hover:text-gray-900 cursor-default">Privacy Policy</span>
            <span className="hover:text-gray-900 cursor-default">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
