import { HomeData } from "@/types/page";
import Link from "next/link";
import parse from "html-react-parser";

interface Props {
  homeData: HomeData;
}

const SectionThreeWaterSports = ({ homeData }: Props) => {
  const section3 = homeData.section_3[0];
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">
                {section3.subtitle}
              </h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                {section3.title}
              </p>
              <section className="mt-6 text-lg/8 text-gray-600">
                {parse(section3.content)}
              </section>
            </div>
            <div className="mt-24">
              <Link
                href="/blog"
                className="bg-lime-300 text-blue-500 font-bold py-5 px-20 rounded-none hover:bg-lime-700"
              >
                {section3.button_text}
              </Link>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src={section3.image}
            // src="/home-section_3_water_sports.jpg"
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SectionThreeWaterSports;
