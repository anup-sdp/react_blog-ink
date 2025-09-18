// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import CardSlider from '../components/CardSlider';
import useAuthContext from '../hooks/useAuthContext';
import { useDataCache } from '../context/DataCacheContext';
import Layout from '../components/Layout';

function Home() {
  const { user } = useAuthContext();
  const { fetchHomeData } = useDataCache();
  const [data, setData] = useState({
    admins: [],
    users: [],
    categories: [],
    freeBlogs: [],
    premiumBlogs: [],
    trendingBlogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const homeData = await fetchHomeData(user);
        setData(homeData);
      } catch (error) {
        console.error('Error loading home data:', error);
        
        if (error.response?.status === 401) {
          console.log("Received 401 error, clearing tokens");
          localStorage.removeItem("authTokens");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, user?.is_subscribed, user?.is_staff, fetchHomeData]); // Only re-run when user changes

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
      <div className="space-y-6 md:space-y-8 w-full">
        {/* All your existing JSX remains the same, just using data from state */}
        
        {/* Blogging History Section */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 md:p-8 rounded-2xl shadow-xl w-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">The History of Blogging</h2>
          <p className="mb-4 text-gray-700 text-sm md:text-base">
            Blogging has evolved significantly since its inception in the late 1990s. 
            The first blogs were primarily online diaries where individuals shared their personal thoughts and experiences. 
            Justin Hall, who began personal blogging in 1994 while a student at Swarthmore College, 
            is generally recognized as one of the earliest bloggers.
          </p>
          <p className="text-gray-700 text-sm md:text-base">
            As the internet grew, so did blogging platforms. 
            In 1999, platforms like LiveJournal and Blogger emerged, making it easier for people without technical skills to start blogs. 
            The early 2000s saw the rise of political blogs and the birth of the term "blogosphere." 
            Today, blogging encompasses a wide range of formats and topics, 
            from personal journals to professional news sites and corporate blogs.
          </p>
        </section>

        {/* Admins Section */}
        <section className="bg-blue-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Our Admins</h2>
          <div className="w-full overflow-hidden">
            <CardSlider items={data.admins} type="user" />
          </div>
        </section>

        {/* Users Section */}
        <section className="bg-green-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Our Users</h2>
          <div className="w-full overflow-hidden">
            <CardSlider items={data.users} type="user" />
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-yellow-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Categories</h2>
          <div className="w-full overflow-hidden">
            <CardSlider items={data.categories} type="category" />
          </div>
        </section>

        {/* Free Blogs Section */}
        <section className="bg-pink-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Free Blogs</h2>
          <div className="w-full overflow-hidden">
            <CardSlider items={data.freeBlogs} type="blog" />
          </div>
        </section>

        {/* Premium Blogs Section (only if user is subscribed or staff) */}
        {user && (user.is_subscribed || user.is_staff) ? (
          <section className="bg-purple-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Premium Blogs</h2>
              <span className="bg-purple-200 text-purple-800 text-xs sm:text-sm px-3 py-1 rounded-full w-fit">
                Only for premium members and staff
              </span>
            </div>
            <div className="w-full overflow-hidden">
              <CardSlider items={data.premiumBlogs} type="blog" />
            </div>
          </section>
        ) : (
          <section className="bg-gray-100 p-4 md:p-6 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 w-full">
            <div className="text-center py-6 md:py-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Premium Blogs</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">This section is only available to premium members and staff.</p>
              <p className="text-gray-600 text-sm md:text-base">Upgrade to premium to access exclusive content!</p>
            </div>
          </section>
        )}

        {/* Trending Blogs Section */}
        <section className="bg-indigo-50 p-4 md:p-6 rounded-2xl shadow-lg w-full overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Trending Blogs</h2>
          <div className="w-full overflow-hidden">
            <CardSlider items={data.trendingBlogs} type="blog" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Home;

/*
Here are all the valid ways to use useDataCache():

Method 1: Destructuring 
const { fetchHomeData, isLoading, clearCache, refreshData } = useDataCache();

Method 2: Single object 
const udc = useDataCache();
udc.fetchHomeData(user)
udc.isLoading('categories')
udc.clearCache(['users'])
udc.refreshData('freeBlogs')

Method 3: Mixed approach
const dataCache = useDataCache();
const { fetchHomeData } = dataCache; // Destructure only what you use frequently

All Available Functions from DataCacheContext:
const allFunctions = useDataCache();
// Available functions:
allFunctions.fetchHomeData(user)           // Main function to get home page data
allFunctions.fetchWithCache(key, fn, deps) // Generic caching function
allFunctions.clearCache(keys)              // Clear specific or all cache
allFunctions.refreshData(key, deps)        // Force refresh specific data
allFunctions.isLoading(key, deps)          // Check if data is being fetched
allFunctions.isCached(key, deps)           // Check if data exists in cache
*/


/*
Step: Optional - Add cache invalidation to other components
For example, in MyPayments.jsx, you can refresh payment-related cache:

In any component that modifies data:
const { clearCache, refreshData } = useDataCache();

After successful payment:
refreshData('premiumBlogs', [user.is_subscribed, user.is_staff]);

After user subscription changes:
clearCache(['premiumBlogs', 'users']);
*/