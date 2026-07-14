import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/user');
        setUsers(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Dashboard</span>
        <h1 className="text-3xl font-extrabold text-gray-950 mt-1">Registered Users</h1>
      </div>

      <div className="bg-white border border-gray-150 rounded-xl p-6 min-h-[400px] flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accounts Directory</h2>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                      {u._id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-950">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.isAdmin ? (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xxs font-semibold px-2.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xxs font-semibold px-2.5 py-0.5 rounded-full">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-12">
            <p className="text-sm">No registered user profiles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
