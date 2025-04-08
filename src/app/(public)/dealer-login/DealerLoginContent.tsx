import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

const DealerLoginContent = () => {
  return (
    <>
      <Head>
        <title>Build-a-Bloxx - Custom Dock Accessories</title>
        <meta name="description" content="Dealer Login DockBloxx" />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Dealer Login Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Coming Soon
          </h1>
        </div>
      </div>

      <Page className="py-12" FULL={false}>
        {/* Centered Heading Section */}
        {/* <Row className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Please copy me ...
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            If you don't see exactly what you are looking for, contact us and we
            will be happy to help you get what you want!
          </p>
        </Row> */}

        {/* Two Column Layout */}
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* <div className="flex flex-col lg:flex-row gap-4 lg:gap-8"> */}
          <div className="flex flex-col">
            {/* Left Column - Image Gallery */}

            {/* Right Column - Form */}
            {/* <div className="w-full lg:w-1/2 bg-white rounded-lg"> */}
            <div className="w-full bg-white rounded-lg">
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

export default DealerLoginContent;
