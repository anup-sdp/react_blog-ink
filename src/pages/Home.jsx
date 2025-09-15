import { useEffect, useState } from 'react';
import CardSlider from '../components/CardSlider';
import useAuthContext from '../hooks/useAuthContext';
import authApiClient from '../services/auth-api-client';
import { isAuthenticated } from '../utils/auth';
import Layout from '../components/Layout';

function Home() {
  const { user } = useAuthContext();
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [freeBlogs, setFreeBlogs] = useState([]);
  const [premiumBlogs, setPremiumBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Only fetch user data if user is authenticated
        if (isAuthenticated()) {
          console.log("User is authenticated, fetching user data...");
          
          // Fetch admins (staff users)
          const adminsRes = await authApiClient.get('/users/', { params: { is_staff: true } });
          console.log("Admins data:", adminsRes.data);
          setAdmins(adminsRes.data.results);

          // Fetch regular users (non-staff)
          const usersRes = await authApiClient.get('/users/', { params: { is_staff: false } });
          console.log("Users data:", usersRes.data);
          setUsers(usersRes.data.results);
        } else {
          console.log("User is not authenticated, skipping user data fetch");
          setAdmins([]);
          setUsers([]);
        }
        
        // Fetch categories (public data)
        const categoriesRes = await authApiClient.get('/categories/');
        console.log("Categories data:", categoriesRes.data);
        setCategories(categoriesRes.data.results);

        // Fetch free blogs (public data)
        const freeBlogsRes = await authApiClient.get('/posts/free-blogs/');
        console.log("Free blogs data:", freeBlogsRes.data);
        setFreeBlogs(freeBlogsRes.data);

        // Fetch premium blogs (if user is subscribed or staff)
        if (user && (user.is_subscribed || user.is_staff)) {
          const premiumBlogsRes = await authApiClient.get('/posts/premium-blogs/');
          console.log("Premium blogs data:", premiumBlogsRes.data);
          setPremiumBlogs(premiumBlogsRes.data);
        }

        // Fetch trending blogs (public data)
        const trendingBlogsRes = await authApiClient.get('/posts/');
        console.log("Trending blogs data:", trendingBlogsRes.data);
        setTrendingBlogs(trendingBlogsRes.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // If we get a 401 error, clear the tokens and redirect to login
        if (error.response?.status === 401) {
          console.log("Received 401 error, clearing tokens");
          localStorage.removeItem("authTokens");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Blogging History Section */}
      <section className="mb-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-4">The History of Blogging</h2>
        <p className="mb-4">
          Blogging has evolved significantly since its inception in the late 1990s. 
          The first blogs were primarily online diaries where individuals shared their personal thoughts and experiences. 
          Justin Hall, who began personal blogging in 1994 while a student at Swarthmore College, 
          is generally recognized as one of the earliest bloggers.
        </p>
        <p>
          As the internet grew, so did blogging platforms. 
          In 1999, platforms like LiveJournal and Blogger emerged, making it easier for people without technical skills to start blogs. 
          The early 2000s saw the rise of political blogs and the birth of the term "blogosphere." 
          Today, blogging encompasses a wide range of formats and topics, 
          from personal journals to professional news sites and corporate blogs.
        </p>
      </section>

      {/* Admins Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Admins</h2>
        <CardSlider items={admins} type="user" />
      </section>

      {/* Users Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Users</h2>
        <CardSlider items={users} type="user" />
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Categories</h2>
        <CardSlider items={categories} type="category" />
      </section>

      {/* Free Blogs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Free Blogs</h2>
        <CardSlider items={freeBlogs} type="blog" />
      </section>

      {/* Premium Blogs Section (only if user is subscribed or staff) */}
      {user && (user.is_subscribed || user.is_staff) && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Premium Blogs</h2>
          <CardSlider items={premiumBlogs} type="blog" />
        </section>
      )}

      {/* Trending Blogs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Trending Blogs</h2>
        <CardSlider items={trendingBlogs} type="blog" />
      </section>
    </Layout>
  );
}

export default Home;