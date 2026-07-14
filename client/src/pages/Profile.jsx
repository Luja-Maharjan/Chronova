import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';

export default function Profile() {
  const { user, updateProfile } = useApp();

  // Profile Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Sync state if user context loads late
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Fetch user orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const { data } = await api.get('/order/myorders');
        setOrders(data);
      } catch (error) {
        console.error('Error fetching my orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmittingProfile(true);
    try {
      await updateProfile(name, email, password || undefined);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // errors handled by context
    } finally {
      setSubmittingProfile(false);
    }
  };

  return (
    <>
      <SEOHead
        title="My Account & Order History"
        description="Manage your Chronova account, update profile details, and view your complete order history and payment status."
        keywords="my account, order history, profile, Chronova customer"
        canonical="/profile"
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Edit Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Update Profile</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="border-t border-gray-100 pt-4 mt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Change Password</h3>
                <p className="text-xxs text-gray-400 mb-3">Leave blank if you don't want to change password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  {submittingProfile ? 'Saving updates...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-150 rounded-xl p-6 min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order History</h2>

            {loadingOrders ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Paid</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Delivered</th>
                      <th className="px-4 py-3 text-right text-xxs font-bold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-sm">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-medium text-xs text-gray-900">
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
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
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {order.isDelivered ? 'Delivered' : order.orderStatus || 'Processing'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
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
                <p className="text-sm">You haven't placed any orders yet.</p>
                <Link to="/shop" className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">
                  Browse products &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
      </div>
    </>
  );
}
