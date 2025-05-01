import Link from "next/link";
import parse from "html-react-parser";
import { Product } from "@/types/product";
import Image from "next/image";
import { getFeaturedImage } from "@/lib/utils";

interface Props {
  products: Product[];
  sectionTitle: string;
}

const HomeProductList = async ({ products, sectionTitle }: Props) => {
  // console.log("bestseller [HomeProductList] ", products);
  return (
    <div className="bg-gray-100 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-gray-100 rounded-none overflow-hidden shadow-sm flex flex-col h-full"
              // className="bg-gray-100 rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
            >
              {/* Image Container with Best Seller Badge */}
              <Link href={`/shop/${product.slug}`}>
                {/* <div className="relative aspect-[4/3] overflow-hidden"> */}
                <div className="relative aspect-[4/4]">
                  <img
                    src={getFeaturedImage(product.images)}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-4 left-0 bg-lime-300 text-black px-3 py-1 text-sm font-semibold">
                    {sectionTitle}
                  </div>
                </div>
              </Link>

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
                <div className="flex-grow mb-32">
                  <div className="text-gray-600 h-24">
                    {product.acf.home_product_description}
                  </div>
                </div>

                {/* Button - Always at Bottom */}
                <Link
                  href={`/shop/${product.slug}`}
                  className="block w-full bg-lime-300 hover:bg-lime-500 hover:text-white text-blue-500 text-center py-4 font-semibold transition-colors duration-200"
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

export default HomeProductList;
