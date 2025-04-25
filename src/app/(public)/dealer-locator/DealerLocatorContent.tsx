import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { dealers } from "./data";
import {
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdOutlineLanguage,
} from "react-icons/md";

const DealerLocatorContent = () => {
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
          alt="Find a Dealer Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl text-white font-bold">
            Find A Dealer Near You
          </h1>
        </div>
      </div>

      <Page className="py-12" FULL={false}>
        {/* Centered Heading Section */}
        <Row className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Dealer List
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-10">
            If you don't see exactly what you are looking for, contact us and we
            will help you locate the perfect DockBloxx dealer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {dealers.map((dealer, index) => (
              <div
                key={index}
                className="bg-gray-100 p-6 rounded-lg shadow-sm text-left flex flex-col gap-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {dealer.name}
                </h3>

                <div className="flex items-start gap-3 text-gray-700">
                  <MdOutlineLocationOn className="w-10 h-10 text-gray-400" />
                  <p className="mt-2">{dealer.address}</p>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <MdOutlinePhone className="w-10 h-10 text-gray-400" />
                  <p className="mt-2">{dealer.phone}</p>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <MdOutlineLanguage className="w-10 h-10 text-gray-400" />
                  <a
                    href={dealer.website}
                    target="_blank"
                    className="mt-2 border-b-2 border-blue-500"
                  >
                    Click to go to site
                  </a>
                </div>
              </div>
            ))}
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

export default DealerLocatorContent;
