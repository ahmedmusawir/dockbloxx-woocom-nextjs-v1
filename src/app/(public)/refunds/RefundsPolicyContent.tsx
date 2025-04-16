"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { getImageUrl } from "@/lib/utils";
import { policies } from "./content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const RefundsPolicyContent = () => {
  const termsData = policies.find((policy) => policy.id === "refund");

  if (!termsData) return null;

  return (
    <>
      <Head>
        <title>Refund and Returns Policy - DockBloxx</title>
        <meta
          name="description"
          content="Learn about DockBloxx's refund and returns policy."
        />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Policy Header Image"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <h1 className="text-4xl md:text-5xl text-white font-bold text-center px-4">
            Our Policy
          </h1>
        </div>
      </div>

      <Page className="lg:py-16" FULL={false}>
        <Row className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Static Sidebar Navigation */}
            <div className="w-full lg:w-1/4">
              <div className="sticky top-24 bg-gray-50 p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-2xl font-extrabold mb-6 uppercase text-blue-600">
                  REFUNDS
                </h2>
                <nav>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/terms"
                        className={`block px-3 py-2 rounded transition-colors duration-200 ${
                          termsData.id === "terms"
                            ? "font-semibold text-blue-700 border-b-4 border-blue-600 pb-1"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className={`block px-3 py-2 rounded transition-colors duration-200 ${
                          termsData.id === "privacy"
                            ? "font-semibold text-blue-700 border-b-4 border-blue-600 pb-1"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/refunds"
                        className={`block px-3 py-2 rounded transition-colors duration-200 ${
                          termsData.id === "refund"
                            ? "font-semibold text-blue-700 border-b-4 border-blue-600 pb-1"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Refund and Returns Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/warranty"
                        className={`block px-3 py-2 rounded transition-colors duration-200 ${
                          termsData.id === "warranty"
                            ? "font-semibold text-blue-700 border-b-4 border-blue-600 pb-1"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Warranty Policy
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="w-full lg:w-3/4 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow">
              <div className="prose prose-lg max-w-none text-gray-700 break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {termsData.content}
                </ReactMarkdown>
              </div>
              <div>
                <h1 className="text-center mt-12">
                  The Return Authorization Form
                </h1>
                <div className="h-[800px]">
                  <iframe
                    src="https://link.cyberizegroup.com/widget/form/e14w3jBY1DcbJDWt4lwd"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: "3px",
                    }}
                    id="inline-e14w3jBY1DcbJDWt4lwd"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Return Authorization Form"
                    data-height="658"
                    data-layout-iframe-id="inline-e14w3jBY1DcbJDWt4lwd"
                    data-form-id="e14w3jBY1DcbJDWt4lwd"
                    title="Return Authorization Form"
                  ></iframe>
                  {/* <script src="https://link.cyberizegroup.com/js/form_embed.js"></script> */}
                </div>
                {/* Move script to Head */}
                <Head>
                  <script
                    src="https://link.cyberizegroup.com/js/form_embed.js"
                    async
                  />
                </Head>
              </div>
            </div>
          </div>
        </Row>
      </Page>
    </>
  );
};

export default RefundsPolicyContent;
