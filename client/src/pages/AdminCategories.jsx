import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/category');
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Edit category
        await api.put(`/category/${editingId}`, { name, description });
        toast.success('Category updated successfully');
      } else {
        // Create category
        await api.post('/category', { name, description });
        toast.success('Category created successfully');
      }
      // Reset form
      setName('');
      setDescription('');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/category/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Dashboard</span>
        <h1 className="text-3xl font-extrabold text-gray-950 mt-1">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form (Create/Edit) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-gray-150 rounded-xl p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h2>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mechanical Watches"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Fine timepieces crafted with moving weights and springs"
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  {editingId ? null : <FiPlus size={16} />}
                  <span>{submitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Categories List */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-150 rounded-xl p-6 min-h-[400px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category List</h2>

            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-150">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Slug</th>
                      <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xxs font-bold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-sm">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-950">{cat.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">{cat.slug}</td>
                        <td className="px-4 py-3 text-gray-600 line-clamp-1 max-w-[200px]">{cat.description || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-semibold space-x-3">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          >
                            <FiEdit2 size={15} className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="text-red-600 hover:text-red-950 cursor-pointer"
                          >
                            <FiTrash2 size={15} className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-12">
                <p className="text-sm">No categories created yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
