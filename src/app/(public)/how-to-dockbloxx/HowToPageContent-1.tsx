import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import VideoSelector from "@/components/how-to/VideoSelect";

const HowToPageContent = () => {
  return (
    <>
      <Head>
        <title>How to Dockbloxx</title>
        <meta
          name="description"
          content="Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
        />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Custom Services Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            How To Dockbloxx
          </h1>
        </div>
      </div>

      <Page className="py-1" FULL={false}>
        {/* Two Column Layout */}
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Left Column - Image Gallery */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-3 sm:p-4 lg:p-20 rounded-lg">
              {/* Main Wide Image */}
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Master Your Dockbloxx Installation
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Ready to get the most out of your DockBloxx accessories? Our
                easy-to-follow how-to guides will help you master the use of our
                products, ensuring you enjoy the ultimate boating experience.
                Learn installation tips, maintenance tricks, and more!
              </p>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 bg-white rounded-lg">
              {/* Video Selector */}
              <VideoSelector />
              {/* Video Column */}
              <div className="h-[400px] mt-5">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/llfJVpopOyw"
                  title="DockBloxx Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Row>
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div style={{ position: "relative", width: "100%", height: "700px" }}>
            <Image
              src="/images/how-to-dockbloxx-img.jpg"
              alt="Custom Services Background"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </Row>
      </Page>

      {/* Move script to Head */}
      <Head>
        <script src="https://link.cyberizegroup.com/js/form_embed.js" async />
      </Head>
    </>
  );
};

export default HowToPageContent;
