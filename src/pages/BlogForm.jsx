import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';
import Layout from '../components/Layout';

function BlogForm() {
  const { user } = useAuthContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authApiClient.get('/categories/');
        setCategories(response.data.results);
      } catch (error) {
        toast.addToast('Failed to fetch categories', 'error');
      }
    };

    fetchCategories();

    // If editing, fetch blog data
    if (id) {
      setIsEditing(true);
      const fetchBlog = async () => {
        try {
          const response = await authApiClient.get(`/posts/${id}/`);
          const blog = response.data;
          reset({
            title: blog.title,
            body: blog.body,
            category: blog.category,
            video_url: blog.video_url || '',
            is_premium: blog.is_premium,
            is_active: blog.is_active
          });
        } catch (error) {
          toast.addToast('Failed to fetch blog data', 'error');
          navigate('/my-blogs');
        }
      };

      fetchBlog();
    }
  }, [id, navigate, reset, toast]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await authApiClient.patch(`/posts/${id}/`, data);
        toast.addToast('Blog updated successfully', 'success');
      } else {
        await authApiClient.post('/posts/', data);
        toast.addToast('Blog created successfully', 'success');
      }
      navigate('/my-blogs');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} blog`;
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit Blog' : 'Create New Blog'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            {...register('body', { required: 'Content is required' })}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          {errors.body && (
            <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Video URL (YouTube)</label>
          <input
            type="text"
            {...register('video_url')}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_premium"
              {...register('is_premium')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_premium" className="ml-2 block text-sm text-gray-700">
              Premium Content
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              defaultChecked
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/my-blogs')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-6 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default BlogForm;