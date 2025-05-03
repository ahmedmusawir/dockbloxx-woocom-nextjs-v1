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

      <Page className="py-1" FULL={false}>
        {/* Single Column Layout */}
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col">
            {/* Single Column - Form */}
            <div className="w-full bg-white rounded-lg">
              <div className="h-[3000px]">
                <iframe
                  src="https://link.cyberizegroup.com/widget/form/AScMqJGA4wyMn23PoXX3"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "3px",
                  }}
                  id="inline-AScMqJGA4wyMn23PoXX3"
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="Dealer Application"
                  data-height="3138"
                  data-layout-iframe-id="inline-AScMqJGA4wyMn23PoXX3"
                  data-form-id="AScMqJGA4wyMn23PoXX3"
                  title="Dealer Application"
                ></iframe>
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
