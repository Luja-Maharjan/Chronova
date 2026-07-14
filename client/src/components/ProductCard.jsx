import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { getProductUrl, getCategoryUrl } from '../utils/seo';

export default function ProductCard({ product }) {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useApp();

  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const inStock = product.countInStock > 0;
  const productUrl = getProductUrl(product);
  const imageAlt = product.imageAlt || `${product.name} - ${product.brand || 'Chronova'} watch`;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <article className="group relative bg-white border border-gray-150 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow">
      <Link to={productUrl} className="block relative aspect-square bg-gray-50 overflow-hidden" aria-label={`View ${product.name} details`}>
        <img
          src={product.image}
          alt={imageAlt}
          title={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
          }}
        />

        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-500 shadow-sm hover:text-red-500 transition-colors focus:outline-none cursor-pointer z-10"
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" size={16} aria-hidden="true" />
          ) : (
            <FiHeart size={16} aria-hidden="true" />
          )}
        </button>

        {!inStock && (
          <span className="absolute bottom-2 left-2 bg-red-100 text-red-800 text-xxs font-semibold px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}

        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xxs font-extrabold px-2 py-0.5 rounded shadow-sm z-10">
            -{product.discount}%
          </span>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category?.slug ? (
            <Link
              to={getCategoryUrl(product.category)}
              className="text-gray-400 text-xxs uppercase tracking-wider font-semibold hover:text-indigo-600"
            >
              {product.category.name}
            </Link>
          ) : (
            <span className="text-gray-400 text-xxs uppercase tracking-wider font-semibold">
              {product.category?.name || 'Uncategorized'}
            </span>
          )}
          <Link to={productUrl}>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mt-1 group-hover:underline">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-3">
          {product.discount > 0 ? (
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-950">Rs. {(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
              <span className="text-xs text-gray-400 line-through">Rs. {product.price.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-base font-bold text-gray-950">Rs. {product.price.toFixed(2)}</span>
          )}
          {inStock ? (
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none"
            >
              <FiShoppingCart size={15} aria-hidden="true" />
            </button>
          ) : (
            <button
              disabled
              aria-label={`${product.name} is out of stock`}
              className="p-2 bg-gray-150 text-gray-400 rounded-lg cursor-not-allowed"
            >
              <FiShoppingCart size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
