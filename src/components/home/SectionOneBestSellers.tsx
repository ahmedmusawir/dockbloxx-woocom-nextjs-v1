import { HomeData } from "@/types/page";
import Link from "next/link";
import parse from "html-react-parser";

interface Props {
  homeData: HomeData;
}

const SectionOneBestSellers = ({ homeData }: Props) => {
  const sectionData = homeData.sections.find(
    (section) => section.block_id === "BLOCK_1_BEST_SELLERS"
  );

  if (!sectionData) return null;

  return (
    <div className="relative bg-white">
      <img
        alt=""
        src={sectionData?.image}
        className="h-56 w-full bg-gray-50 object-cover lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2"
      />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-6 pb-16 pt-16 sm:pb-16 sm:pt-20 lg:col-start-2 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
            <h2 className="text-base/8 font-semibold text-indigo-600">
              {sectionData?.subtitle}
            </h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              {sectionData?.title}
            </p>
            <p className="mt-4 text-lg/8 text-gray-600">
              {parse(sectionData?.content)}
            </p>

            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href={sectionData.button_link}
                className="mt-10 bg-lime-300 text-blue-600 font-bold py-5 px-20 rounded-none hover:bg-lime-700"
              >
                {sectionData.button_text}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionOneBestSellers;
