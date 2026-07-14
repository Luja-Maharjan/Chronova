import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';
import { SITE_KEYWORDS } from '../config/seo';
import { getOrganizationSchema, getBreadcrumbSchema } from '../utils/structuredData';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <SEOHead
        title="Contact Chronova — Customer Support"
        description="Contact Chronova for order help, product questions, or partnership inquiries. Our team responds to all customer messages promptly."
        keywords={`${SITE_KEYWORDS}, contact Chronova, customer support, watch store help`}
        canonical="/contact"
        ogType="website"
      />
      <StructuredData
        data={[
          getOrganizationSchema(),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Contact Us
          </h1>
          <p className="text-gray-600 mt-4">
            Have a question about an order, product, or delivery? Reach out and our team will help you.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h2>
            <address className="not-italic text-gray-600 space-y-3 text-sm">
              <p><strong className="text-gray-900">Email:</strong> support@chronova.com</p>
              <p><strong className="text-gray-900">Phone:</strong> +977-1-5550123</p>
              <p><strong className="text-gray-900">Location:</strong> Kathmandu, Nepal</p>
              <p><strong className="text-gray-900">Hours:</strong> Sun–Fri, 10:00 AM – 6:00 PM</p>
            </address>

            <nav className="mt-6" aria-label="Related pages">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Links</h3>
              <ul className="space-y-1 text-sm">
                <li><Link to="/shop" className="text-indigo-600 hover:underline">Browse Watches</Link></li>
                <li><Link to="/cart" className="text-indigo-600 hover:underline">View Shopping Cart</Link></li>
                <li><Link to="/profile" className="text-indigo-600 hover:underline">My Account & Orders</Link></li>
                <li><Link to="/about" className="text-indigo-600 hover:underline">About Chronova</Link></li>
              </ul>
            </nav>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>
      </article>
    </>
  );
}
