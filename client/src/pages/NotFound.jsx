import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead
        title="Page Not Found — 404"
        description="The page you are looking for does not exist. Return to Chronova to browse premium watches and timepieces."
        canonical="/404"
        noindex
      />

      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 — Page Not Found</h1>
        <p className="text-gray-600 mt-4">
          Sorry, we could not find the page you requested. It may have been moved or removed.
        </p>
        <nav className="mt-8 flex flex-col sm:flex-row gap-3 justify-center" aria-label="Helpful links">
          <Link
            to="/"
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg text-sm"
          >
            Go to Homepage
          </Link>
          <Link
            to="/shop"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg text-sm"
          >
            Browse Watches
          </Link>
        </nav>
      </section>
    </>
  );
}
