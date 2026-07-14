import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import { getProductUrl } from '../utils/seo';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useApp();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
  };

  if (wishlist.length === 0) {
    return (
      <>
        <SEOHead
          title="My Wishlist — Saved Watches"
          description="Save your favorite Chronova watches to your wishlist. Build a collection of premium timepieces and shop when you are ready."
          keywords="wishlist, saved watches, Chronova, favorite timepieces"
          canonical="/wishlist"
        />
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h1>
            <p className="text-gray-500 mt-2">
              You haven&apos;t saved any timepieces to your wishlist yet. Explore our shop to find items you love!
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Explore Shop
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="My Wishlist — Saved Timepieces"
        description="View and manage your saved Chronova watches. Add wishlist items to cart or remove products you no longer need."
        keywords="wishlist, saved watches, Chronova timepieces"
        canonical="/wishlist"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Wishlist</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((prod) => {
            if (!prod) return null;
            const inStock = prod.countInStock > 0;
            const productUrl = getProductUrl(prod);

            return (
              <article
                key={prod._id}
                className="group bg-white border border-gray-150 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <Link to={productUrl} className="block relative aspect-square bg-gray-50" aria-label={`View ${prod.name}`}>
                  <img
                    src={prod.image}
                    alt={prod.imageAlt || `${prod.name} watch in wishlist`}
                    title={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-gray-400 text-xxs font-semibold uppercase">{prod.category?.name}</span>
                    <Link to={productUrl}>
                      <h2 className="text-sm font-semibold text-gray-900 line-clamp-1 mt-0.5 group-hover:underline">
                        {prod.name}
                      </h2>
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

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => removeFromWishlist(prod._id)}
                      aria-label={`Remove ${prod.name} from wishlist`}
                      className="flex-1 flex justify-center items-center py-2 px-3 border border-gray-300 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={15} aria-hidden="true" />
                      <span className="text-xs font-semibold ml-1.5 hidden sm:inline">Remove</span>
                    </button>

                    {inStock ? (
                      <button
                        onClick={(e) => handleAddToCart(e, prod)}
                        aria-label={`Add ${prod.name} to cart`}
                        className="flex-1 flex justify-center items-center py-2 px-3 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiShoppingCart size={15} aria-hidden="true" />
                        <span className="text-xs font-semibold ml-1.5 hidden sm:inline">Add</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        aria-label={`${prod.name} is out of stock`}
                        className="flex-1 flex justify-center items-center py-2 px-3 bg-gray-150 text-gray-400 rounded-lg cursor-not-allowed text-xs font-semibold"
                      >
                        Out of stock
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
