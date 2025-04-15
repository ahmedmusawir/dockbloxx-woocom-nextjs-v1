import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Faq from "@/components/contact/Faq";

const ContactUsContent = () => {
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
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Contact Us Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Contact Us
          </h1>
        </div>
      </div>

      <Page className="py-12" FULL={false}>
        {/* Two Column Layout */}
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Left Column - Image Gallery */}
            <div className="w-full lg:w-1/2 bg-white rounded-lg">
              <div className="h-[750px]">
                <iframe
                  src="https://link.cyberizegroup.com/widget/form/knpfOzoJn54MiHtF8iLG"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "3px",
                  }}
                  id="inline-knpfOzoJn54MiHtF8iLG"
                  data-layout={`{'id':'INLINE'}`}
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name="DockBloxx Contact Form"
                  data-height="577"
                  data-layout-iframe-id="inline-knpfOzoJn54MiHtF8iLG"
                  data-form-id="knpfOzoJn54MiHtF8iLG"
                  title="DockBloxx Contact Form"
                />
              </div>
              {/* Move script to Head */}
              <Head>
                <script
                  src="https://link.cyberizegroup.com/js/form_embed.js"
                  async
                />
              </Head>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 bg-gray-50 px-8 py-20 rounded-lg sm:p-20 lg:p-10 xl:p-20">
              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-500 mb-10">
                Get In Touch With DockBloxx
              </h2>
              <p className="text-gray-700 text-xl leading-relaxed mb-16">
                At DockBloxx, we're committed to providing exceptional customer
                service. Whether you have questions about our products or need
                help choosing the perfect size, our customer satisfaction team
                is here to help. Get in touch with us today and we will assist
                any way we can.
              </p>

              {/* Address */}
              <div className="flex items-start gap-4 mb-8">
                <Image
                  src="/images/Map_Pin_icon.png"
                  alt="Location Icon"
                  width={50}
                  height={50}
                />
                <div>
                  <p className="font-bold text-gray-500 sm:text-2xl text-base">
                    2349 Centennial Dr.
                  </p>
                  <p className="text-gray-700 text-base">
                    Gainesville, GA 30504
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 mb-8">
                <Image
                  src="/images/Phone_Call_Icon.png"
                  alt="Phone Icon"
                  width={60}
                  height={60}
                />
                <p className="text-gray-500 font-bold text-base sm:text-2xl">
                  404-220-9641
                </p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 mb-16">
                <Image
                  src="/images/Message_icon.png"
                  alt="Email Icon"
                  width={70}
                  height={70}
                />
                <p className="text-gray-500 font-bold text-base sm:text-2xl">
                  support@dockbloxx.com
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-6">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/Facebook.png"
                    alt="Facebook"
                    width={40}
                    height={40}
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/Twitter.png"
                    alt="Twitter"
                    width={40}
                    height={40}
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/Linkedin.png"
                    alt="LinkedIn"
                    width={40}
                    height={40}
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/Pinterest.png"
                    alt="Pinterest"
                    width={40}
                    height={40}
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/Youtube.png"
                    alt="YouTube"
                    width={40}
                    height={40}
                  />
                </a>
              </div>
            </div>
          </div>
        </Row>
        <Row className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 bg-gray-50">
          {/* THE DOCKBLOXX FAQ */}
          <Faq />
        </Row>
      </Page>
    </>
  );
};

export default ContactUsContent;
