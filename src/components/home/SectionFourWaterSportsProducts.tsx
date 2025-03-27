"use client";

import Link from "next/link";
import Image from "next/image";

// Product data structure
const products = [
  {
    id: 1,
    name: "EZ Flag Bloxx",
    isBestSeller: true,
    priceRange: {
      min: 69.0,
      max: 99.0,
    },
    description:
      "Make your dock ss you to proudly display your flag, adding a personal touch to your dock or boat slip. It's an essential accessory for every dock or marina slip holder!",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/IMG_3634-scaled.jpg",
    imageAlt: "EZ Flag Bloxx - American flag mounted on dock",
    href: "/product/ez-flag-bloxx",
  },
  {
    id: 2,
    name: "Beverage Bloxx",
    isBestSeller: true,
    priceRange: {
      min: 85.0,
      max: 139.0,
    },
    description:
      "For those who enjoy their beverages while chilling on the dock, Beverage Bloxx is the ideal addition to your dock setup. This customizable dock post accessory provides a secure place for your drinks, preventing spills and adding convenience to your dockside experience.",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/Photoroom_20240429_113149.jpg",
    imageAlt: "Beverage Bloxx - Drink holder mounted on dock",
    href: "/product/beverage-bloxx",
  },
  {
    id: 3,
    name: "HOSE'n Boats",
    isBestSeller: true,
    priceRange: {
      min: 89.0,
      max: 119.0,
    },
    description:
      "Upgrade your dock's aesthetics and safety with our sleek stainless-steel Hose 'N Boats Bloxx! These hose mounts are not only stylish but also practical, keeping tripping hazards off the walkway while adding a touch of elegance to your dock.",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/8-1.jpg",
    imageAlt: "HOSE'n Boats - Hose management system",
    href: "/product/hose-n-boats",
  },
  {
    id: 4,
    name: "Life Saver",
    isBestSeller: true,
    priceRange: {
      min: 99.0,
      max: 179.0,
    },
    description:
      "Make life easier on the dock with the Life Saver, and functional.",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/whos-your-caddie-lead.png",
    imageAlt: "Life Saver - Safety equipment organizer",
    href: "/product/life-saver",
  },
];

const SectionFourWaterSportsProducts = () => {
  return (
    <div className="bg-gray-100 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          WATER SPORTS PRODUCTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-100 rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
            >
              {/* Image Container with Best Seller Badge */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
                {product.isBestSeller && (
                  <div className="absolute top-4 left-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
                    Water Sports
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="pt-6 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h3>

                {/* Price Range */}
                <div className="text-blue-500 font-extrabold text-lg mb-4">
                  ${product.priceRange.min.toFixed(2)} – $
                  {product.priceRange.max.toFixed(2)}
                </div>

                {/* Description - Fixed Height */}
                <div className="flex-grow mb-6">
                  <p className="text-gray-600 line-clamp-4 h-24">
                    {product.description}
                  </p>
                </div>

                {/* Button - Always at Bottom */}
                <Link
                  href={product.href}
                  className="block w-full bg-lime-300 hover:bg-lime-600 text-blue-500 text-center py-4 font-semibold transition-colors duration-200"
                >
                  SELECT OPTION
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionFourWaterSportsProducts;
