// src/components/SwiperSlider.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function SwiperSlider({ items, renderItem, breakpoints = {} }) {
  const defaultBreakpoints = {
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
  };

  const mergedBreakpoints = { ...defaultBreakpoints, ...breakpoints };

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      breakpoints={mergedBreakpoints}
      className="my-4 px-4"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id} className="flex justify-center">
          <div className="w-full max-w-xs">
            {renderItem(item)}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default SwiperSlider;