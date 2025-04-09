"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import parse from "html-react-parser";

interface Props {
  product: Product;
}

const ProductListItem = ({ product }: Props) => {
  // console.log("featured img [ProductListItem]:", product.images[1]?.src);

  const featuredImage =
    product.images[0].id === "youtube_video"
      ? product.images[1]?.src || "/placeholder.jpg"
      : product.images[0].src || "/placeholder.jpg";

  return (
    <div key={product.id} className="group relative my-5">
      <Link href={`/shop/${product.slug}`}>
        <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
          <Image
            src={featuredImage}
            alt={product.name}
            className="object-cover w-full h-full rounded-lg"
            width={300}
            height={300}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="/placeholder.jpg" // Ensure this is correctly pointed
            loading="eager" // Load critical images immediately
            priority={true} // Prioritize this image for LCP
          />
        </div>
      </Link>
      <section className="">
        <h3 className="mt-4 mb-2 text-xl text-gray-700">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {product.categories
            .filter((cat) => cat.name !== "DockBloxx")
            .map((cat) => (
              <span
                key={cat.name}
                className="mt-1 inline-flex items-center rounded-full bg-lime-200 px-2 py-1 text-[10px] font-bold text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2"
              >
                {cat.name}
              </span>
            ))}
        </p>

        <p className="text-xl font-bold text-blue-700 float-right mt-10">
          {parse(product.price_html)}
        </p>

        <Link href={`/shop/${product.slug}`}>
          <button
            type="button"
            className="mt-8 rounded-none bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:mb-10 w-full"
          >
            SELECT OPTIONS
          </button>
        </Link>
      </section>
    </div>
  );
};

export default ProductListItem;
