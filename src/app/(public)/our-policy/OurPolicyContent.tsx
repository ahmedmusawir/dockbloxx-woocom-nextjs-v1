"use client"; // Add this directive to make it a Client Component

import { useState } from "react"; // Import useState for state management
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { policies } from "./content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const OurPolicyContent = () => {
  // State to track the active policy section
  const [activeSection, setActiveSection] = useState(policies[0].id); // Default to the first policy

  // Find the currently active policy object
  const currentPolicy =
    policies.find((p) => p.id === activeSection) || policies[0];

  return (
    <>
      <Head>
        <title>Our Policy - DockBloxx</title> {/* Updated Title */}
        <meta
          name="description"
          content="Review the terms, privacy, refund, and warranty policies for DockBloxx." // Updated Description
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
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          {" "}
          {/* Added subtle overlay */}
          <h1 className="text-4xl md:text-5xl text-white font-bold text-center px-4">
            {" "}
            {/* Centered text */}
            Our Policy
          </h1>
        </div>
      </div>

      <Page className="lg:py-16" FULL={false}>
        {" "}
        {/* Added more padding */}
        {/* Two Column Layout */}
        <Row className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Consistent padding */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column - Navigation */}
            {/* Corrected width: lg:w-1/4 */}
            <div className="w-full lg:w-1/4">
              <div className="sticky top-24 bg-gray-50 p-4 sm:p-6 rounded-lg shadow">
                {" "}
                {/* Added sticky, shadow */}
                {/* Active Section Title */}
                <h2 className="text-2xl font-extrabold mb-6 uppercase text-blue-600">
                  {currentPolicy.title}
                </h2>
                {/* Navigation Menu */}
                <nav>
                  <ul className="space-y-3">
                    {policies.map((policy) => (
                      <li key={policy.id}>
                        <button
                          onClick={() => setActiveSection(policy.id)}
                          className={`w-full text-left px-3 py-2 rounded transition-colors duration-200 ${
                            activeSection === policy.id
                              ? "font-semibold text-blue-700 border-b-4 border-blue-600 pb-1" // Active style with thick underline
                              : "text-gray-600 hover:bg-gray-200" // Inactive style
                          }`}
                        >
                          {policy.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
            {/* Right Column - Content */}
            <div className="w-full lg:w-3/4 bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow">
              {/* Applied prose styles to a container div */}
              <div className="prose prose-lg max-w-none text-gray-700 break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentPolicy.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </Row>
      </Page>
    </>
  );
};

export default OurPolicyContent;
