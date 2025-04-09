import { getImageUrl } from "@/lib/utils";
import Link from "next/link";

const SectionOne = () => {
  return (
    <div className="relative bg-white">
      <img
        alt=""
        // src="/home-section-1.jpg"
        src={getImageUrl("/wp-content/uploads/2-10.png")}
        className="h-56 w-full bg-gray-50 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2"
      />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-6 pb-16 pt-16 sm:pb-16 sm:pt-20 lg:col-start-2 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
            <h2 className="text-base/8 font-semibold text-indigo-600">
              Our Popular Products
            </h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Best Sellers
            </p>
            <p className="mt-4 text-lg/8 text-gray-600">
              Discover the DockBloxx products that customers love the most! Our
              Best Sellers category features the most popular no-drill dock
              accessories, designed for effortless installation and secure
              storage. Whether you’re storing paddle boards, securing fishing
              rods, or setting up the perfect dockside setup these top-rated
              solutions help you keep your dock organized, functional, and ready
              for adventure. Shop our best sellers and experience why boaters,
              anglers, and lake lovers trust DockBloxx for their dockside needs!
            </p>

            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/shop"
                className="mt-10 bg-lime-300 text-blue-600 font-bold py-5 px-20 rounded-none hover:bg-lime-700"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionOne;
