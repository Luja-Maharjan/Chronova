import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form toggle
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [discount, setDiscount] = useState('0');
  const [countInStock, setCountInStock] = useState('10');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // Keep track of current image path for edits
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLatest, setIsLatest] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      await Promise.resolve(); // Defer execution to make it asynchronous
      setLoading(true);
      const { data } = await api.get('/product');
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/category');
      setCategories(data);
      // Automatically select first category if none is currently selected
      if (data.length > 0) {
        setCategory((prev) => prev || data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    fetchCategories();
  }, []);

  const handleEditClick = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setDiscount((prod.discount || 0).toString());
    
    // Safely extract the category ID regardless of whether it's populated as an object or a string ID
    const catId = typeof prod.category === 'object' ? prod.category?._id || '' : prod.category || '';
    setCategory(catId);
    
    setCountInStock(prod.countInStock.toString());
    setIsFeatured(prod.isFeatured);
    setIsLatest(prod.isLatest);
    setImageUrl(prod.image);
    setImageFile(null); // Reset file picker
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory(categories[0]?._id || '');
    setDiscount('0');
    setCountInStock('10');
    setIsFeatured(false);
    setIsLatest(true);
    setImageUrl('');
    setImageFile(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !category || !description) {
      toast.error('Please enter all fields');
      return;
    }

    setSubmitting(true);

    try {
      const discountNum = Number(discount) || 0;
      if (discountNum < 0 || discountNum > 100) {
        toast.error('Discount must be between 0 and 100');
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('discount', discountNum);
      formData.append('countInStock', countInStock);
      formData.append('isFeatured', isFeatured);
      formData.append('isLatest', isLatest);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image', imageUrl); // Send current image url back if not updated
      }

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (editingId) {
        await api.put(`/product/${editingId}`, formData, config);
        toast.success('Product updated successfully');
      } else {
        await api.post('/product', formData, config);
        toast.success('Product created successfully');
      }

      handleCloseForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/product/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Dashboard</span>
          <h1 className="text-3xl font-extrabold text-gray-950 mt-1">Manage Products</h1>
        </div>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <FiPlus size={16} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-150 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Product details' : 'Add New Product'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. Chronova Chronograph"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="199.99"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                {categories.length === 0 ? (
                  <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 flex flex-col gap-1">
                    <span>No categories found. A category is required to create a product.</span>
                    <Link to="/admin/categories" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                      Go to Manage Categories to create one first
                    </Link>
                  </div>
                ) : (
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity in Stock</label>
                <input
                  type="number"
                  required
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="10"
                />
              </div>

              {/* Discount (%) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-250 cursor-pointer"
                />
                {imageUrl && !imageFile && (
                  <p className="text-xxs text-gray-400 mt-1">Current image: {imageUrl}</p>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 mt-6 md:mt-0 pt-4 md:pt-0">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isLatest}
                    onChange={(e) => setIsLatest(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                </label>
              </div>

            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 sm:text-sm"
                rows={4}
                placeholder="Write detailed specifications of the watch..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="bg-white border border-gray-150 rounded-xl p-6 min-h-[400px] flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Product Catalog</h2>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider w-16">Image</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xxs font-bold text-gray-400 uppercase tracking-wider">Badges</th>
                  <th className="px-4 py-3 text-right text-xxs font-bold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <img
                        src={prod.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-950">{prod.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{prod.category?.name || 'Uncategorized'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                      {prod.discount > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">Rs. {(prod.price * (1 - prod.discount / 100)).toFixed(2)}</span>
                          <span className="text-xxs text-gray-400 line-through">Rs. {prod.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">Rs. {prod.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{prod.countInStock}</td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-1">
                      {prod.isFeatured && (
                        <span className="bg-purple-50 text-purple-700 text-xxs px-2 py-0.5 rounded border border-purple-200">Featured</span>
                      )}
                      {prod.isLatest && (
                        <span className="bg-blue-50 text-blue-700 text-xxs px-2 py-0.5 rounded border border-blue-200 font-medium">Arrival</span>
                      )}
                      {prod.discount > 0 && (
                        <span className="bg-red-50 text-red-700 text-xxs px-2 py-0.5 rounded border border-red-200 font-semibold">-{prod.discount}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-semibold space-x-3">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        <FiEdit2 className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="text-red-600 hover:text-red-950 cursor-pointer"
                      >
                        <FiTrash2 className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-12">
            <p className="text-sm">No products in the catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
