import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { SITE_DESCRIPTION, SITE_KEYWORDS } from '../config/seo';
import { getOrganizationSchema, getWebsiteSchema } from '../utils/structuredData';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/product'),
          api.get('/category'),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const latestProducts = products.filter((p) => p.isLatest).slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Premium Watches & Timepieces Online"
        description={SITE_DESCRIPTION}
        keywords={SITE_KEYWORDS}
        canonical="/"
        ogType="website"
      />
      <StructuredData data={[getOrganizationSchema(), getWebsiteSchema()]} />

      <div className="bg-white">
        <section className="relative bg-gray-50 border-b border-gray-100" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 space-y-6 text-center md:text-left mb-10 md:mb-0">
              <h1 id="hero-heading" className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
                Define Your Time. <br />
                <span className="text-indigo-600">Elevate Your Style.</span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-md mx-auto md:mx-0">
                Discover Chronova&apos;s exclusive collection of handpicked premium timepieces. Simple aesthetics, unparalleled precision.
              </p>
              <div>
                <Link
                  to="/shop"
                  className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-lg transition-colors cursor-pointer"
                  aria-label="Browse our full watch collection"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
            <div className="md:w-5/12 aspect-[4/3] bg-gray-150 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                alt="Chronova premium luxury watches collection display"
                title="Chronova Premium Watches"
                loading="eager"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="bg-gray-50 border border-gray-150 rounded-xl p-6 text-center hover:bg-gray-100 hover:border-gray-200 transition-all group"
                  aria-label={`Shop ${category.name} watches`}
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {category.description || `Explore our ${category.name} watch collection`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featuredProducts.length > 0 && (
          <section className="bg-gray-50/50 border-t border-b border-gray-100" aria-labelledby="featured-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-gray-900">
                    Featured Timepieces
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Our most premium and popular watches</p>
                </div>
                <Link to="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500" aria-label="View all watches">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="new-arrivals-heading">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 id="new-arrivals-heading" className="text-2xl font-bold tracking-tight text-gray-900">
                New Arrivals
              </h2>
              <p className="text-sm text-gray-500 mt-1">Stay ahead with the latest watch releases</p>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500" aria-label="View all new watches">
              View All &rarr;
            </Link>
          </div>
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-500">
              No products available yet. Check back soon!
            </p>
          )}
        </section>
      </div>
    </>
  );
}
