import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/order');
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeliver = async (id) => {
    if (!window.confirm('Are you sure you want to mark this order as delivered?')) return;

    try {
      await api.put(`/order/${id}/deliver`);
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Dashboard</span>
        <h1 className="text-3xl font-extrabold text-gray-950 mt-1">Manage Orders</h1>
      </div>

      <div className="bg-white border border-gray-150 rounded-xl p-6 min-h-[400px] flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Customer Transactions</h2>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Paid</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xxs font-bold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-medium text-xs text-gray-900">
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-950">{order.user?.name || 'Deleted User'}</div>
                      <div className="text-xxs text-gray-400">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-905">
                      Rs. {order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span
                          className={`text-xxs font-semibold px-2 py-0.5 rounded-full border w-fit ${
                            order.isPaid
                              ? 'bg-green-50 text-green-700 border-green-150'
                              : 'bg-red-50 text-red-700 border-red-150'
                          }`}
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          {order.paymentMethod === 'eSewa' ? 'eSewa' : 'COD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xxs font-semibold px-2 py-0.5 rounded-full border ${
                          order.isDelivered
                            ? 'bg-blue-50 text-blue-700 border-blue-150'
                            : order.orderStatus === 'Pending Payment'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-yellow-50 text-yellow-750 border-yellow-200'
                        }`}
                      >
                        {order.isDelivered ? 'Delivered' : order.orderStatus || 'Processing'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-semibold space-x-3">
                      {!order.isDelivered && (
                        <button
                          onClick={() => handleDeliver(order._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded text-xxs cursor-pointer"
                        >
                          Deliver
                        </button>
                      )}
                      <Link
                        to={`/order/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-12">
            <p className="text-sm">No customer transactions available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
