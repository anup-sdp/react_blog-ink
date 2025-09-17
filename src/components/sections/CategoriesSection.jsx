// src/components/sections/CategoriesSection.jsx
import SwiperSlider from '../SwiperSlider';
import CategoryCard from '../CategoryCard';

function CategoriesSection({ categories }) {
  const renderCategoryCard = (category) => <CategoryCard category={category} />;

  return (
    <section className="bg-yellow-50 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
      </div>
      {categories.length > 0 ? (
        <SwiperSlider 
          items={categories} 
          renderItem={renderCategoryCard}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
        />
      ) : (
        <p className="text-center text-gray-500 py-8">No categories found</p>
      )}
    </section>
  );
}

export default CategoriesSection;