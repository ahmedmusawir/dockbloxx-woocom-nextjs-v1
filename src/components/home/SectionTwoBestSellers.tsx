import Link from "next/link";
import parse from "html-react-parser";
import { Product } from "@/types/product";
import Image from "next/image";

interface Props {
  bestSellers: Product[];
}

const SectionTwoBestSellers = async ({ bestSellers }: Props) => {
  console.log("bestseller [SectionTwoBestSellers] ", bestSellers);
  return (
    <div className="bg-gray-100 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">BEST SELLERS</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.name}
              className="bg-gray-100 rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
            >
              {/* Image Container with Best Seller Badge */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.images[1].src}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
                <div className="absolute top-4 left-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
                  Best Seller
                </div>
              </div>

              {/* Content Container */}
              <div className="pt-6 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h3>

                {/* Price Range - Using regular price if available */}
                <div className="text-blue-500 font-extrabold text-lg mb-4">
                  {parse(product.price_html)}
                </div>

                {/* Description - Fixed Height */}
                <div className="flex-grow mb-6">
                  <div className="text-gray-600 line-clamp-4 h-24">
                    {parse(product.short_description)}
                  </div>
                </div>

                {/* Button - Always at Bottom */}
                <Link
                  href={`/shop/${product.slug}`}
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

export default SectionTwoBestSellers;
