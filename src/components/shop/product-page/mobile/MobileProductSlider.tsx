"use client";

import { useState } from "react";
import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import Image from "next/image";
import { Product } from "@/types/product";
interface Props {
  product: Product;
}

const MobileProductSlider = ({ product }: Props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  // Filter out videos (assuming video files have known extensions like .mp4, .webm, etc.)
  const imageSlides =
    product?.images?.filter(
      (image) => image.src && !image.src.match(/\.(mp4|webm|ogg)$/i)
    ) || [];

  if (!imageSlides.length) return null; // Prevent render if no valid images

  return (
    <div className="w-full">
      {/* Main Image Swiper */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Navigation, Thumbs]}
        className="w-full rounded-lg"
      >
        {imageSlides.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full aspect-square flex justify-center items-center">
              <Image
                src={image.src}
                alt={product.name || "Product Image"}
                width={600}
                height={600}
                className="object-cover w-full h-full rounded-lg"
                priority={index === 0} // Lazy-load except first image
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Swiper */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        watchSlidesProgress
        modules={[Thumbs]}
        className="mt-4 w-full"
      >
        {imageSlides.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="cursor-pointer border-2 border-transparent hover:border-indigo-500 rounded-lg">
              <Image
                src={image.src}
                alt={`Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="object-cover w-full h-full rounded-md"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MobileProductSlider;
