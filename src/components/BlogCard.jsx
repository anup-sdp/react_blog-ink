// src/components/BlogCard.jsx
import { Link } from 'react-router';
import { FaEye } from 'react-icons/fa';

const BlogCard = ({ blog }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-96 flex flex-col">
      {blog.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{blog.title}</h3>
          <Link 
            to={`/blog/${blog.id}`}
            className="text-blue-500 hover:text-blue-700"
            aria-label="View blog details"
          >
            <FaEye />
          </Link>
        </div>
        <p className="text-gray-600 text-sm mb-2">By {blog.author_username}</p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
          {blog.body}
        </p>
        <div className="flex justify-between items-center">
          {blog.is_premium && (
            <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Premium
            </span>
          )}
          <span className="text-xs text-gray-500">
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;