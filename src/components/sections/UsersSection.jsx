// src/components/sections/UsersSection.jsx
import SwiperSlider from '../SwiperSlider';
import UserCard from '../UserCard';

function UsersSection({ users }) {
  const renderUserCard = (user) => <UserCard user={user} />;

  return (
    <section className="bg-green-50 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Our Users</h2>
      </div>
      {users.length > 0 ? (
        <SwiperSlider 
          items={users} 
          renderItem={renderUserCard}
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
        <p className="text-center text-gray-500 py-8">No users found</p>
      )}
    </section>
  );
}

export default UsersSection;