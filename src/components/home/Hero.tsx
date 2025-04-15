import { getImageUrl } from "@/lib/utils";
import { HomeData } from "@/types/page";
import Link from "next/link";
import parse from "html-react-parser";

interface Props {
  homeData: HomeData;
}

const Hero = ({ homeData }: Props) => {
  const sectionData = homeData.sections.find(
    (section) => section.block_id === "HERO_HEADER"
  );

  if (!sectionData) return null;

  return (
    <div className="bg-white">
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 py-2 sm:py-4 lg:px-8 lg:py-5 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl pb-10">
                <div className="hidden sm:mb-10 sm:flex">
                  <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                    Checkout our Blog...{" "}
                    <Link
                      href="/blog"
                      className="whitespace-nowrap font-semibold text-indigo-600"
                    >
                      <span aria-hidden="true" className="absolute inset-0" />
                      Read more <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
                <h1 className="text-pretty text-4xl font-extrabold sm:text-5xl tracking-tight text-blue-600">
                  {sectionData.title}
                </h1>
                <section className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                  {parse(sectionData.content)}
                </section>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href={sectionData.button_link}
                    className="mt-10 bg-lime-300 text-blue-600 font-bold py-5 px-20 rounded-none hover:bg-lime-400 hover:text-white"
                  >
                    {sectionData.button_text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            alt=""
            src={sectionData.image}
            className="aspect-[3/2] object-cover lg:aspect-auto lg:size-full"
          />
        </div>
      </div>
    </div>
  );
};
export default Hero;
