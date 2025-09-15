// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CardSlider from '../components/CardSlider';
import Sidebar from '../components/Sidebar';
import useAuthContext from '../hooks/useAuthContext';
import apiClient from '../services/api-client';

function Home() {
  const { user } = useAuthContext();
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [freeBlogs, setFreeBlogs] = useState([]);
  const [premiumBlogs, setPremiumBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);

  useEffect(() => {
    // Fetch data for each section
    const fetchData = async () => {
      try {
        // Fetch admins (staff users)
        const adminsRes = await apiClient.get('/users/', { params: { is_staff: true } });
        setAdmins(adminsRes.data.results);

        // Fetch regular users (non-staff)
        const usersRes = await apiClient.get('/users/', { params: { is_staff: false } });
        setUsers(usersRes.data.results);

        // Fetch categories
        const categoriesRes = await apiClient.get('/categories/');
        setCategories(categoriesRes.data.results);

        // Fetch free blogs
        const freeBlogsRes = await apiClient.get('/posts/free-blogs/');
        setFreeBlogs(freeBlogsRes.data);

        // Fetch premium blogs (if user is subscribed or staff)
        if (user && (user.is_subscribed || user.is_staff)) {
          const premiumBlogsRes = await apiClient.get('/posts/premium-blogs/');
          setPremiumBlogs(premiumBlogsRes.data);
        }

        // Fetch trending blogs (all blogs for now)
        const trendingBlogsRes = await apiClient.get('/posts/');
        setTrendingBlogs(trendingBlogsRes.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex flex-1">
        {user && <Sidebar />}
        
        <main className="flex-1 p-6">
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
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

export default Home;