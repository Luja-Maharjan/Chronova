import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { SITE_KEYWORDS, truncate } from '../config/seo';
import { getCategoryUrl } from '../utils/seo';
import { getBreadcrumbSchema, getCategorySchema } from '../utils/structuredData';

export default function Shop() {
  const { slug: categorySlugParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/category');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const resolveCategory = async () => {
      if (categorySlugParam) {
        try {
          const { data } = await api.get(`/category/slug/${categorySlugParam}`);
          setActiveCategory(data);
          setCategory(data._id);
        } catch {
          setActiveCategory(null);
        }
      } else {
        setActiveCategory(null);
        setCategory(searchParams.get('category') || '');
      }
    };
    resolveCategory();
  }, [categorySlugParam, searchParams]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    if (!categorySlugParam) {
      setCategory(searchParams.get('category') || '');
    }
  }, [searchParams, categorySlugParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categorySlugParam) {
        params.categorySlug = categorySlugParam;
      } else if (category) {
        params.category = category;
      }
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const { data } = await api.get('/product', { params });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categorySlugParam && !activeCategory && category === '') return;
    fetchProducts();
  }, [category, categorySlugParam, sort, activeCategory]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const nextParams = {};
    if (search) nextParams.search = search;
    if (category && !categorySlugParam) nextParams.category = category;
    setSearchParams(nextParams);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
    setTimeout(() => {
      api.get('/product').then(({ data }) => setProducts(data));
    }, 50);
  };

  const pageTitle = activeCategory
    ? `${activeCategory.seoTitle || activeCategory.name + ' Watches'}`
    : search
    ? `Search: ${search}`
    : 'Shop Premium Watches';

  const pageDescription = activeCategory
    ? activeCategory.metaDescription ||
      truncate(`Shop ${activeCategory.name} watches at Chronova. ${activeCategory.description || 'Premium timepieces with fast delivery.'}`, 160)
    : search
    ? truncate(`Search results for "${search}" — browse matching watches at Chronova.`, 160)
    : 'Browse all premium watches at Chronova. Filter by category, price, and brand. Free shipping on orders over Rs. 100.';

  const pageKeywords = activeCategory
    ? activeCategory.metaKeywords || `${activeCategory.name}, watches, Chronova`
    : `${SITE_KEYWORDS}, shop watches, buy watches online Nepal`;

  const canonicalPath = activeCategory ? getCategoryUrl(activeCategory) : '/shop';

  return (
    <>
      <SEOHead
        title={truncate(pageTitle, 57)}
        description={pageDescription}
        keywords={pageKeywords}
        canonical={canonicalPath}
        ogType="website"
      />
      {activeCategory && (
        <StructuredData
          data={[
            getCategorySchema(activeCategory),
            getBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Shop', path: '/shop' },
              { name: activeCategory.name, path: canonicalPath },
            ]),
          ]}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-64 shrink-0 bg-white border border-gray-150 rounded-xl p-5 self-start" aria-label="Product filters">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

            <form onSubmit={handleFilterSubmit} className="space-y-6">
              <div>
                <label htmlFor="shop-search" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Search
                </label>
                <input
                  id="shop-search"
                  type="search"
                  placeholder="Product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              {!categorySlugParam && (
                <div>
                  <label htmlFor="shop-category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    id="shop-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Price Range</span>
                <div className="flex gap-2">
                  <label htmlFor="shop-min-price" className="sr-only">Minimum price</label>
                  <input
                    id="shop-min-price"
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
                    min="0"
                  />
                  <label htmlFor="shop-max-price" className="sr-only">Maximum price</label>
                  <input
                    id="shop-max-price"
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="bg-gray-50 border border-gray-250 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </aside>

          <section className="flex-1" aria-labelledby="shop-heading">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h1 id="shop-heading" className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {activeCategory ? `${activeCategory.name} Watches` : search ? `Results for "${search}"` : 'All Watches'}
                </h1>
                {activeCategory?.description && (
                  <p className="text-sm text-gray-600 mt-2 max-w-2xl">{activeCategory.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-sm text-gray-500 whitespace-nowrap">Sort by</label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center items-center min-h-[40vh]" role="status" aria-label="Loading products">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">No products found</h2>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  We couldn&apos;t find any products matching your criteria. Try clearing some filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-block bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
