import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

const DealerLocatorContent = () => {
  const dealers = [
    {
      name: "OpenAI",
      address: "123 AI Way, San Francisco, CA 94110",
      phone: "(415) 555-0101",
    },
    {
      name: "Anthropic",
      address: "456 Ethics Blvd, Berkeley, CA 94704",
      phone: "(510) 555-0202",
    },
    {
      name: "Google DeepMind",
      address: "789 Quantum St, Mountain View, CA 94043",
      phone: "(650) 555-0303",
    },
    {
      name: "Stability AI",
      address: "321 Diffusion Ln, London, UK W1T 1JY",
      phone: "+44 20 7946 0958",
    },
    {
      name: "Meta AI",
      address: "1 Social Plaza, Menlo Park, CA 94025",
      phone: "(650) 555-0404",
    },
    {
      name: "Mistral",
      address: "88 Research Row, Paris, France 75000",
      phone: "+33 1 44 55 66 77",
    },
    {
      name: "Cohere",
      address: "987 Vector Dr, Toronto, ON M5H 2N2",
      phone: "(416) 555-0606",
    },
    {
      name: "Hugging Face",
      address: "654 Token Blvd, Brooklyn, NY 11201",
      phone: "(718) 555-0707",
    },
    {
      name: "xAI",
      address: "42 Neural Net Ave, Austin, TX 73301",
      phone: "(512) 555-0808",
    },
  ];

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
                  <Image
                    src="/images/Map_Pin_icon.png"
                    alt="Location Icon"
                    width={20}
                    height={20}
                  />
                  <p>{dealer.address}</p>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <Image
                    src="/images/Phone_Call_Icon.png"
                    alt="Phone Icon"
                    width={30}
                    height={30}
                  />
                  <p>{dealer.phone}</p>
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
