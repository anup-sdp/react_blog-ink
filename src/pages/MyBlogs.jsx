// src/pages/MyBlogs.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';
import Layout from '../components/Layout';

function MyBlogs() {
  const { user } = useAuthContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await authApiClient.get('/posts/', {
          params: { author: user.id }
        });
        setBlogs(response.data.results);
      } catch (error) {
        toast.addToast('Failed to fetch your blogs', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [user, toast]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await authApiClient.delete(`/posts/${id}/`);
        setBlogs(blogs.filter(blog => blog.id !== id));
        toast.addToast('Blog deleted successfully', 'success');
      } catch (error) {
        toast.addToast('Failed to delete blog', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
        <Link
          to="/create-blog"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Create New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't created any blogs yet.</p>
          <Link
            to="/create-blog"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
          >
            <FaPlus className="mr-2" /> Create Your First Blog
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{blog.category_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      blog.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {blog.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      blog.is_premium ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.is_premium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/edit-blog/${blog.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default MyBlogs;