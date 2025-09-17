// src/components/sections/AdminsSection.jsx
import SwiperSlider from '../SwiperSlider';
import UserCard from '../UserCard';

function AdminsSection({ admins }) {
  const renderAdminCard = (admin) => <UserCard user={admin} />;

  return (
    <section className="bg-blue-50 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Our Admins</h2>
      </div>
      {admins.length > 0 ? (
        <SwiperSlider 
          items={admins} 
          renderItem={renderAdminCard}
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
        <p className="text-center text-gray-500 py-8">No admins found</p>
      )}
    </section>
  );
}

export default AdminsSection;