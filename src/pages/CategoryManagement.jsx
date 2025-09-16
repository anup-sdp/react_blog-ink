// src/pages/CategoryManagement.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';

function CategoryManagement() {
  const { user } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authApiClient.get('/categories/');
        setCategories(response.data.results);
      } catch (error) {
        toast.addToast('Failed to fetch categories', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const onSubmit = async (data) => {
    try {
      if (isEditing && selectedCategory) {
        // Update existing category
        await authApiClient.patch(`/categories/${selectedCategory.id}/`, data);
        toast.addToast('Category updated successfully', 'success');
      } else {
        // Create new category
        await authApiClient.post('/categories/', data);
        toast.addToast('Category created successfully', 'success');
      }
      
      // Refresh categories list
      const response = await authApiClient.get('/categories/');
      setCategories(response.data.results);
      
      // Reset form
      reset();
      setSelectedCategory(null);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.name?.[0] || 'Failed to save category';
      toast.addToast(errorMessage, 'error');
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    reset({
      name: category.name,
      description: category.description
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await authApiClient.delete(`/categories/${id}/`);
        setCategories(categories.filter(category => category.id !== id));
        toast.addToast('Category deleted successfully', 'success');
      } catch (error) {
        toast.addToast('Failed to delete category', 'error');
      }
    }
  };

  const handleCancel = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setSelectedCategory(null);
            reset();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                {...register('name', { required: 'Category name is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                {isEditing ? 'Update Category' : 'Create Category'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All Categories</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No categories found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{category.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryManagement;