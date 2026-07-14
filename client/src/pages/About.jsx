import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { SITE_DESCRIPTION, SITE_KEYWORDS } from '../config/seo';
import { getOrganizationSchema, getWebsiteSchema, getBreadcrumbSchema } from '../utils/structuredData';

export default function About() {
  return (
    <>
      <SEOHead
        title="About Chronova — Premium Watch Store"
        description="Learn about Chronova, Nepal's destination for premium watches. We curate luxury, smart, and classic timepieces with quality you can trust."
        keywords={`${SITE_KEYWORDS}, about Chronova, watch store Nepal`}
        canonical="/about"
        ogType="website"
      />
      <StructuredData
        data={[
          getOrganizationSchema(),
          getWebsiteSchema(),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            About Chronova
          </h1>
          <p className="text-gray-600 mt-4 text-lg leading-relaxed">
            {SITE_DESCRIPTION}
          </p>
        </header>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Chronova was founded with a simple belief: everyone deserves access to beautifully crafted
              timepieces. From classic analog watches to modern smart watches, we handpick each product
              for quality, design, and value.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Curated collections of mens and womens watches</li>
              <li>Smart watches with modern features</li>
              <li>Secure checkout with eSewa and Cash on Delivery</li>
              <li>Fast delivery across Nepal</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Explore Our Store</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Browse our full catalog or shop by category to find your perfect timepiece.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                Shop All Watches →
              </Link>
              <Link to="/wishlist" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                View Wishlist →
              </Link>
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                Contact Us →
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
