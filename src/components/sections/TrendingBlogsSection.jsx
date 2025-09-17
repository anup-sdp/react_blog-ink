// src/components/sections/TrendingBlogsSection.jsx
import SwiperSlider from '../SwiperSlider';
import BlogCard from '../BlogCard';

function TrendingBlogsSection({ trendingBlogs }) {
  const renderBlogCard = (blog) => <BlogCard blog={blog} />;

  return (
    <section className="bg-indigo-50 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Trending Blogs</h2>
      </div>
      {trendingBlogs.length > 0 ? (
        <SwiperSlider 
          items={trendingBlogs} 
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
        <p className="text-center text-gray-500 py-8">No trending blogs found</p>
      )}
    </section>
  );
}

export default TrendingBlogsSection;