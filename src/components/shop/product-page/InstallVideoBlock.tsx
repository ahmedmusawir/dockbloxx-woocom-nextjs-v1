import React from "react";
import Image from "next/image";
import { Product, RelatedProduct } from "@/types/product";
import parse from "html-react-parser";
import Link from "next/link";

interface Props {
  product: Product;
}
const InstallVideoBlock = ({ product }: Props) => {
  return (
    <section
      aria-labelledby="related-heading"
      className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0"
    >
      <h2
        id="related-heading"
        className="text-4xl font-extrabold text-gray-600 text-center"
      >
        How To Install
      </h2>

      <div className="mt-8">
        <div className="max-w-xl mx-auto w-full h-[250px] sm:h-[360px]">
          <iframe
            className="w-full h-full rounded-lg shadow-lg"
            src={`https://www.youtube.com/embed/${product.acf.youtube}`}
            title="DockBloxx Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>

    // <section
    //   aria-labelledby="related-heading"
    //   className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0"
    // >
    //   <h2
    //     id="related-heading"
    //     className="text-4xl font-extrabold text-gray-600 text-center"
    //   >
    //     How To Install
    //   </h2>

    //   <div className="mt-8">
    //     <div className="h-[400px]">
    //       <iframe
    //         className="w-full h-full"
    //         src="https://www.youtube.com/embed/llfJVpopOyw"
    //         title="DockBloxx Video"
    //         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //         allowFullScreen
    //       />
    //     </div>
    //   </div>
    // </section>
  );
};

export default InstallVideoBlock;
