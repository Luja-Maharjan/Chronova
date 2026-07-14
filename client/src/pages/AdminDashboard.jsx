import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FiShoppingBag, FiLayers, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, statsRes, userRes] = await Promise.all([
          api.get('/product'),
          api.get('/category'),
          api.get('/order/stats'),
          api.get('/user'),
        ]);

        setStats({
          totalSales: statsRes.data.totalRevenue,
          totalOrders: statsRes.data.totalOrders,
          totalProducts: prodRes.data.length,
          totalUsers: userRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Sales',
      value: `Rs. ${stats.totalSales.toFixed(2)}`,
      icon: <FiDollarSign size={24} className="text-green-600" />,
      bg: 'bg-green-50 border-green-200',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiShoppingBag size={24} className="text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Products Stocked',
      value: stats.totalProducts,
      icon: <FiLayers size={24} className="text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      icon: <FiUsers size={24} className="text-orange-600" />,
      bg: 'bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Control Panel</span>
          <h1 className="text-3xl font-extrabold text-gray-950 mt-1">Dashboard</h1>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-6 flex items-center justify-between shadow-sm ${card.bg}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Administration Links Grid */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/admin/products"
          className="bg-white border border-gray-150 rounded-xl p-6 hover:border-indigo-500 hover:shadow-sm transition-all text-center"
        >
          <FiLayers size={28} className="mx-auto text-indigo-600 mb-3" />
          <h3 className="font-bold text-gray-900">Manage Products</h3>
          <p className="text-xs text-gray-500 mt-1">Add, update, or delete catalog items</p>
        </Link>
        <Link
          to="/admin/categories"
          className="bg-white border border-gray-150 rounded-xl p-6 hover:border-indigo-500 hover:shadow-sm transition-all text-center"
        >
          <FiLayers size={28} className="mx-auto text-indigo-600 mb-3" />
          <h3 className="font-bold text-gray-900">Manage Categories</h3>
          <p className="text-xs text-gray-500 mt-1">Configure groups for navigation</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-white border border-gray-150 rounded-xl p-6 hover:border-indigo-500 hover:shadow-sm transition-all text-center"
        >
          <FiShoppingBag size={28} className="mx-auto text-indigo-600 mb-3" />
          <h3 className="font-bold text-gray-900">Manage Orders</h3>
          <p className="text-xs text-gray-500 mt-1">Track payments and delivery states</p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white border border-gray-150 rounded-xl p-6 hover:border-indigo-500 hover:shadow-sm transition-all text-center"
        >
          <FiUsers size={28} className="mx-auto text-indigo-600 mb-3" />
          <h3 className="font-bold text-gray-900">View Users</h3>
          <p className="text-xs text-gray-500 mt-1">Browse registered shopper list</p>
        </Link>
      </div>
    </div>
  );
}
