import { Product } from "@/types/product";
import Link from "next/link";
import React from "react";

const relatedProducts = [
  {
    id: 1,
    name: "Billfold Wallet",
    href: "#",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356460/bxnjpaubvbqedieglq2w.jpg",
    imageAlt: "Front of Billfold Wallet in natural leather.",
    price: "$118",
    color: "Natural",
  },
  {
    id: 2,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Sienna",
    inStock: true,
    size: "Large",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356435/qvg6d7teq8hm1wnbup2a.jpg",
    imageAlt: "Front of men's Basic Tee in sienna.",
  },
  {
    id: 3,
    name: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Black",
    inStock: false,
    leadTime: "3–4 weeks",
    size: "Large",
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356511/kqtfimpi1wbohxxujjkp.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
  },
  {
    id: 4,
    name: "Nomad Tumbler",
    href: "#",
    price: "$35.00",
    color: "White",
    inStock: true,
    imageSrc:
      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1699356684/ite2ep7qmfj8yebjxdhi.jpg",
    imageAlt: "Insulated bottle with white base and black snap lid.",
  },
  // More products...
];

interface Props {
  featuredProducts: Product[];
}

const FeaturedProducts = ({ featuredProducts }: Props) => {
  return (
    <section aria-labelledby="related-heading" className="mt-24">
      <h2
        id="related-heading"
        className="text-2xl font-bold text-gray-900 pb-5"
      >
        Recommended For You&hellip;
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {featuredProducts.map((relatedProduct) => (
          <div key={relatedProduct.id} className="group relative">
            <img
              alt={relatedProduct.name}
              src={relatedProduct.images[1].src}
              className="aspect-square w-full rounded-md object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
            />
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-gray-700">
                  <Link
                    href={`/shop/${relatedProduct.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    <span aria-hidden="true" className="absolute inset-0" />

                    <span className="text-lg font-bold text-black">
                      {relatedProduct.name}
                    </span>
                  </Link>
                </h3>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${relatedProduct.price}.00
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
