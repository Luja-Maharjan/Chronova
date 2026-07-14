import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { FiShoppingBag, FiHeart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, cart, wishlist, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Links */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
              CHRONOVA
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Home
              </Link>
              <Link to="/shop" className="text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Shop
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Contact
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search watches"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
              <button type="submit" aria-label="Submit search" className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <FiSearch size={16} />
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 relative">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xxs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xxs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                  <FiUser size={20} />
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-950 focus:outline-none p-2"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm"
            />
            <button type="submit" className="absolute right-3 top-3 text-gray-400">
              <FiSearch size={16} />
            </button>
          </form>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5"
          >
            Shop
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5"
          >
            Contact
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5 flex items-center justify-between"
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="block text-gray-600 hover:text-gray-950 font-medium py-1.5 flex items-center justify-between"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-gray-950 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block text-indigo-600 hover:text-indigo-900 font-medium py-1.5"
            >
              Admin Dashboard
            </Link>
          )}

          <hr className="border-gray-100" />

          {user ? (
            <div className="space-y-2 pt-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-gray-950 py-1.5 flex items-center space-x-2"
              >
                <FiUser size={18} />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left text-gray-500 hover:text-gray-900 py-1.5 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 py-2.5 rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
