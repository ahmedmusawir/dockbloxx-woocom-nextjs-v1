import { fetchCategoryProducts } from "@/services/categoryServices";
import Link from "next/link";
import parse from "html-react-parser";

const SectionTwoBestSellers = async () => {
  const bestSellers = await fetchCategoryProducts("best-sellers");
  console.log("Best Sellers [SectionTwoBestSellers.tsx]", bestSellers);

  return (
    <div className="bg-gray-100  pb-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
          <h2 className="text-2xl font-bold text-gray-900">BEST SELLERS</h2>

          <div className="mt-6 space-y-12 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:space-y-0 ">
            {bestSellers.map((callout) => (
              <div key={callout.name} className="group relative">
                <img
                  alt={callout.name}
                  src={callout.images[1].src}
                  className="w-full h-full rounded-lg bg-white object-cover group-hover:opacity-75 max-sm:h-80 sm:aspect-[2/1] "
                />
                <h3 className="mt-6 text-lg text-gray-500">
                  {/* <h3 className="mt-6 text-sm text-gray-500"> */}
                  <Link href={`/shop/${callout.slug}`}>
                    <span className="absolute inset-0" />
                    {callout.name}
                  </Link>
                </h3>
                <span className="text-sm font-normal text-gray-900">
                  {parse(callout.short_description.slice(0, 145) + "...")}
                  {/* {parse(callout.short_description.slice(0, 200) + "...")} */}
                  {/* {parse(
                    callout.short_description.length > 100
                      ? callout.short_description.slice(0, 100) + "..."
                      : callout.short_description
                  )} */}
                </span>
                <div className="mt-10">
                  <Link
                    href="/shop"
                    className="bg-lime-300 text-blue-600 font-bold py-5 px-20 rounded-none hover:bg-lime-700"
                  >
                    SELECT OPTIONS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SectionTwoBestSellers;
