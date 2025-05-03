import MeetTheTeam from "@/components/about/MeetTheTeam";
import VideoBlock from "@/components/about/VideoBlock";
import Page from "@/components/common/Page";
import { getImageUrl } from "@/lib/utils";
import Head from "next/head";
import Image from "next/image";

const AboutPageContent = () => {
  return (
    <>
      <Head>
        <title>Build-a-Bloxx - Custom Dock Accessories</title>
        <meta
          name="description"
          content="Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
        />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative">
        {/* Background Image */}
        <div className="relative h-[500px] w-full">
          <Image
            src={getImageUrl("/wp-content/uploads/header-img.jpg")}
            alt="Custom Services Background"
            fill
            className="object-cover"
            priority
          />
          {/* <div className="absolute inset-0 bg-black/60" /> */}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-8 text-white space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                  DockBloxx is a game-changing product designed for boaters, by
                  boaters.
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white leading-snug sm:leading-normal">
                  Born from a love of the water and a need for smarter dock
                  solutions, DockBloxx delivers innovative, no-drill dock
                  accessories that keep your waterfront life organized and
                  hassle-free. Built for boaters, by boaters, every DockBloxx
                  product is designed to install easily, hold strong, and adapt
                  to whatever your dock life brings. Whether you’re securing
                  gear, entertaining guests, or just kicking back, DockBloxx
                  adds true value and helps you make the most of your time on
                  the dock.
                </p>
                {/* <p className="text-base sm:text-lg md:text-xl text-white leading-snug sm:leading-normal">
                  DockBloxx are designed to give you a clean, strong, mounting
                  surface for all your boating/docking accessories. Our
                  Patent-Pending design "Cinches" tight to your dock post giving
                  you the ability to keep your dock and accessories organized
                  and clutter free.
                </p> */}
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                  No more unsightly Zip Ties, Bungees, or Hose Clamps!
                </p>
              </div>

              {/* Right Column - Images (hidden on medium and smaller screens) */}
              <div className="hidden lg:block lg:col-span-4 relative h-[500px] overflow-visible">
                <div className="absolute -right-32 top-0 h-[600px] flex mt-2">
                  <Image
                    src={getImageUrl("/wp-content/uploads/Product-Image.png")}
                    alt="DockBloxx Product"
                    width={650}
                    height={1300}
                    className="object-contain relative z-10 h-full w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Team Section */}
      <Page className="" FULL={true}>
        <MeetTheTeam />
        <VideoBlock />
      </Page>
    </>
  );
};

export default AboutPageContent;
