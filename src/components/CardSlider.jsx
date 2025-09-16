// src/components/CardSlider.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router';
import { FaEye } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function CardSlider({ items, type }) {
  const renderCard = (item) => {
    switch (type) {
      case 'user':
        return (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4">
              <h3 className="font-bold text-lg">{item.username}</h3>
              <p className="text-gray-600">{item.email}</p>
              {item.location && <p className="text-gray-600">{item.location}</p>}
            </div>
          </div>
        );
      case 'category':
        return (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg overflow-hidden h-32 flex items-center justify-center">
            <h3 className="font-bold text-xl text-white">{item.name}</h3>
          </div>
        );
      case 'blog':
        return (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {item.image && (
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <Link 
                  to={`/blog/${item.id}`}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="View blog details"
                >
                  <FaEye />
                </Link>
              </div>
              <p className="text-gray-600 mb-2">By {item.author_username}</p>
              <p className="text-gray-700 line-clamp-3">{item.body}</p>
              {item.is_premium && (
                <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded-full mt-2">
                  Premium
                </span>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={20}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
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
      className="rounded-xl"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          {renderCard(item)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default CardSlider;