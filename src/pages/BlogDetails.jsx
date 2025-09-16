// src/pages/BlogDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { FaEdit, FaArrowLeft, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import useToast from '../hooks/useToast';
import Layout from '../components/Layout';

function BlogDetails() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        // Fetch blog details
        const blogResponse = await authApiClient.get(`/posts/${id}/`);
        setBlog(blogResponse.data);
/*
get https://drf-blog-ink.vercel.app/api/v1/posts/1
{
    "id": 1,
    "title": "How i learned python",
    "body": "my python learning journey is a long way ...",
    "image": null,
    "video_url": "",
    "author": 2,
    "author_username": "anup",
    "category": 1,
    "category_name": "Programming",
    "created_at": "2025-08-13T15:15:22.648352Z",
    "updated_at": "2025-08-13T15:15:22.648352Z",
    "is_active": true,
    "is_premium": false
}
*/		
        
        // Fetch comments
        const commentsResponse = await authApiClient.get(`/posts/${id}/comments/`);
        setComments(commentsResponse.data.results);
/*
get https://drf-blog-ink.vercel.app/api/v1/posts/1/comments/
{
    "count": 0,
    "next": null,
    "previous": null,
    "results": []
}
*/
        
        // Check if user liked this post
        if (user) {
          const likesResponse = await authApiClient.get(`/posts/${id}/likes/`);
          const userLike = likesResponse.data.find(like => like.user === user.id);
          setLiked(!!userLike);
          setLikesCount(likesResponse.data.length);
        } else {
          // For non-authenticated users, just get the count
          const likesResponse = await authApiClient.get(`/posts/${id}/likes/`);
          setLikesCount(likesResponse.data.length);
        }
      } catch (error) {
        toast.addToast('Failed to fetch blog details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id, user, toast]);

  const handleLike = async () => {
    if (!user) {
      toast.addToast('Please login to like posts', 'error');
      return;
    }

    try {
      await authApiClient.post(`/posts/${id}/likes/`, {post_pk:id}); // ------------------------------------
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      toast.addToast('Failed to update like status', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.addToast('Please login to comment', 'error');
      return;
    }

    if (!newComment.trim()) {
      toast.addToast('Comment cannot be empty', 'error');
      return;
    }

    try {
      const response = await authApiClient.post(`/posts/${id}/comments/`, { // ------------ fixed
		post : id,
        body: newComment
      });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.addToast('Comment added successfully', 'success');
    } catch (error) {
      toast.addToast('Failed to add comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await authApiClient.delete(`/posts/${id}/comments/${commentId}/`);
        setComments(comments.filter(comment => comment.id !== commentId));
        toast.addToast('Comment deleted successfully', 'success');
      } catch (error) {
        toast.addToast('Failed to delete comment', 'error');
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

  if (!blog) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
          <Link to="/" className="text-blue-500 hover:underline">
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  const isAuthor = user && user.id === blog.author;
  const canEdit = isAuthor || (user && user.is_staff);

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/" className="flex items-center text-blue-500 hover:underline">
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {blog.image && (
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-64 md:h-96 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{blog.title}</h1>
            {blog.is_premium && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                Premium
              </span>
            )}
          </div>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span>By {blog.author_username}</span>
            <span className="mx-2">•</span>
            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {blog.category_name}
            </span>
            {canEdit && (
              <Link 
                to={`/edit-blog/${blog.id}`}
                className="ml-auto flex items-center text-blue-500 hover:text-blue-700"
              >
                <FaEdit className="mr-1" /> Edit
              </Link>
            )}
          </div>
          
          <div className="prose max-w-none mb-8">
            {blog.video_url && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Video</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src={blog.video_url.replace('watch?v=', 'embed/')}
                    title={blog.title}
                    className="w-full h-64 md:h-96"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            
            <div className="whitespace-pre-line">{blog.body}</div>
          </div>
          
          <div className="flex items-center border-t border-b border-gray-200 py-4">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
            >
              {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              <span>{likesCount}</span>
            </button>
            
            <div className="flex items-center space-x-1 ml-6 text-gray-600">
              <FaComment />
              <span>{comments.length}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Post Comment
                </button>
              </form>
            )}
            
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between">
                      <div className="font-semibold">{comment.author_username}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.body}</p>
                    {(user && (user.id === comment.author || user.is_staff)) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BlogDetails;