import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import Script from "next/script";
import Image from "next/image";

const BuildABloxxPageContent = () => {
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
      <div className="relative h-[300px] w-full">
        <Image
          src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/header-img.jpg"
          alt="Custom Services Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Custom Services
          </h1>
        </div>
      </div>

      <Page className="py-12" FULL={false}>
        {/* Centered Heading Section */}
        <Row className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Build-a-Bloxx
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            If you don't see exactly what you are looking for, contact us and we
            will be happy to help you get what you want!
          </p>
        </Row>

        {/* Two Column Layout */}
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Left Column - Image Gallery */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg">
              {/* Main Wide Image */}
              <div className="mb-4 lg:mb-6">
                <div className="relative h-[250px] sm:h-[300px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-1.jpg"
                    alt="Main Gallery Image"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Grid of Square Images - Single column on mobile, 2 columns on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-7.jpg"
                    alt="Gallery Image 2"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-6.jpg"
                    alt="Gallery Image 3"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-5.jpg"
                    alt="Gallery Image 4"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-4.jpg"
                    alt="Gallery Image 5"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-3.jpg"
                    alt="Gallery Image 6"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="relative h-[320px]">
                  <Image
                    src="https://dockbloxx.mystagingwebsite.com/wp-content/uploads/gallery-img-2.jpg"
                    alt="Gallery Image 7"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 bg-white rounded-lg">
              <div className="h-[987px]">
                <iframe
                  src="https://link.cyberizegroup.com/widget/form/ocqfE7QzKa480G7ywQSN"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "3px",
                  }}
                  id="inline-ocqfE7QzKa480G7ywQSN"
                  data-layout={`{'id':'INLINE'}`}
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="Build-a-Bloxx"
                  data-height="987"
                  data-layout-iframe-id="inline-ocqfE7QzKa480G7ywQSN"
                  data-form-id="ocqfE7QzKa480G7ywQSN"
                  title="Build-a-Bloxx"
                />
              </div>
            </div>
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

export default BuildABloxxPageContent;
