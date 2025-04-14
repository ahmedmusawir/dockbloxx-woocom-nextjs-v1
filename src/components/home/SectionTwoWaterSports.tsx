import { HomeData } from "@/types/page";
import Link from "next/link";
import parse from "html-react-parser";
import Image from "next/image";

interface Props {
  homeData: HomeData;
}

const SectionTwoWaterSports = ({ homeData }: Props) => {
  const sectionData = homeData.sections.find(
    (section) => section.block_id === "BLOCK_2_WATER_SPORTS"
  );

  if (!sectionData) return null;

  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">
                {sectionData?.subtitle}
              </h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {sectionData?.title}
              </p>
              <section className="mt-6 text-lg/8 text-gray-600">
                {parse(sectionData?.content)}
              </section>
            </div>
            <div className="mt-24">
              <Link
                href={sectionData.button_link}
                className="bg-lime-300 text-blue-500 font-bold py-5 px-20 rounded-none hover:bg-lime-500 hover:text-white"
              >
                {sectionData?.button_text}
              </Link>
            </div>
          </div>
          <Image
            alt="Water Sports Products"
            src={sectionData?.image}
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SectionTwoWaterSports;
