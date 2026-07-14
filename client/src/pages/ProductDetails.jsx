import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../AppContext';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { truncate } from '../config/seo';
import { getProductUrl, getCategoryUrl, getImageUrl } from '../utils/seo';
import { getProductSchema, getBreadcrumbSchema } from '../utils/structuredData';

export default function ProductDetails() {
  const { slugOrId } = useParams();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/product/${slugOrId}`);
        setProduct(data);
      } catch (error) {
        console.error('Error loading product details:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading product">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <SEOHead
          title="Product Not Found"
          description="The watch you are looking for is not available. Browse our full collection of premium timepieces at Chronova."
          canonical="/shop"
          noindex
        />
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
          <Link to="/shop" className="mt-4 inline-block bg-gray-900 text-white px-6 py-2 rounded-lg">
            Back to Shop
          </Link>
        </section>
      </>
    );
  }

  const isWishlisted = wishlist.some((item) => item._id === product._id);
  const inStock = product.countInStock > 0;
  const productUrl = getProductUrl(product);
  const imageAlt = product.imageAlt || `${product.name} - ${product.brand || 'Chronova'} premium watch`;
  const seoTitle = product.seoTitle || `${product.name} | ${product.brand || 'Chronova'}`;
  const seoDescription = product.metaDescription || truncate(product.shortDescription || product.description, 160);
  const seoKeywords = product.metaKeywords || `${product.name}, ${product.brand}, ${product.category?.name}, watches, Chronova`;

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];
  if (product.category?.slug) {
    breadcrumbs.push({ name: product.category.name, path: getCategoryUrl(product.category) });
  }
  breadcrumbs.push({ name: product.name, path: productUrl });

  return (
    <>
      <SEOHead
        title={truncate(seoTitle, 57)}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={productUrl}
        ogType="product"
        ogImage={getImageUrl(product.image)}
      />
      <StructuredData data={[getProductSchema(product), getBreadcrumbSchema(breadcrumbs)]} />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center space-x-2">
                {i > 0 && <span className="text-gray-400" aria-hidden="true">/</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium truncate max-w-[200px]" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link to={crumb.path} className="hover:text-gray-900">{crumb.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <figure className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative m-0">
            <img
              src={product.image}
              alt={imageAlt}
              title={product.name}
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </figure>

          <section className="flex flex-col justify-between py-2">
            <div className="space-y-6">
              <header>
                {product.category?.slug ? (
                  <Link
                    to={getCategoryUrl(product.category)}
                    className="text-indigo-600 text-xs font-semibold uppercase tracking-wider hover:underline"
                  >
                    {product.category.name}
                  </Link>
                ) : (
                  <span className="text-indigo-600 text-xs font-semibold uppercase tracking-wider">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-sm text-gray-500 mt-1">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>
                )}
              </header>

              <div className="flex items-center space-x-4">
                {product.discount > 0 ? (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-950">Rs. {(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-semibold">-{product.discount}% OFF</span>
                    </div>
                    <span className="text-sm text-gray-400 line-through">Rs. {product.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-950">Rs. {product.price.toFixed(2)}</span>
                )}
                {inStock ? (
                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                    In Stock ({product.countInStock} available)
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                    Out of Stock
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
              )}

              <div>
                <h2 className="text-sm font-semibold text-gray-900">Product Description</h2>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>

              {inStock && (
                <div className="flex items-center space-x-4 pt-4">
                  <label htmlFor="product-qty" className="text-sm font-medium text-gray-700">Quantity</label>
                  <select
                    id="product-qty"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {[...Array(Math.min(10, product.countInStock)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
              {inStock ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <FiShoppingCart size={18} aria-hidden="true" />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-150 text-gray-400 font-medium py-3 rounded-xl cursor-not-allowed"
                >
                  <FiShoppingCart size={18} aria-hidden="true" />
                  <span>Out of Stock</span>
                </button>
              )}

              <button
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`flex items-center justify-center space-x-2 border py-3 px-6 rounded-xl transition-all cursor-pointer ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-350 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isWishlisted ? (
                  <>
                    <FaHeart size={18} aria-hidden="true" />
                    <span>Remove Wishlist</span>
                  </>
                ) : (
                  <>
                    <FiHeart size={18} aria-hidden="true" />
                    <span>Save to Wishlist</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
