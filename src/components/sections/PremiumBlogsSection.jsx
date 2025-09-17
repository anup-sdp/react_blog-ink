// src/components/sections/PremiumBlogsSection.jsx
import SwiperSlider from '../SwiperSlider';
import BlogCard from '../BlogCard';

function PremiumBlogsSection({ premiumBlogs, user }) {
  const renderBlogCard = (blog) => <BlogCard blog={blog} />;

  if (!user || (!user.is_subscribed && !user.is_staff)) {
    return (
      <section className="bg-gray-100 p-6 rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Premium Blogs</h2>
          <p className="text-gray-600 mb-4">This section is only available to premium members and staff.</p>
          <p className="text-gray-600">Upgrade to premium to access exclusive content!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-purple-50 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Premium Blogs</h2>
        <span className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded-full">
          Only for premium members and staff
        </span>
      </div>
      {premiumBlogs.length > 0 ? (
        <SwiperSlider 
          items={premiumBlogs} 
          renderItem={renderBlogCard}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        />
      ) : (
        <p className="text-center text-gray-500 py-8">No premium blogs found</p>
      )}
    </section>
  );
}

export default PremiumBlogsSection;