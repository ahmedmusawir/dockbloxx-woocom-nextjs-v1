import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
import SectionFourWaterSportsProducts from "@/components/home/SectionFourWaterSportsProducts";
import SectionOne from "@/components/home/SectionOne";
import SectionThreeWaterSports from "@/components/home/SectionThreeWaterSports";
import SectionTwoBestSellers from "@/components/home/SectionTwoBestSellers";
import { fetchHomePageData } from "@/services/pageServices";
import { fetchTestPageData } from "@/services/testServices";
import Head from "next/head";
import React from "react";

const HomePageContent = async () => {
  const homeData = await fetchHomePageData();
  // console.log("Home Page Data:", homeData);

  // const testData = await fetchTestPageData("best-sellers");
  // console.log("Home Page Data: [HomePageContent.tsx]", testData);

  return (
    <>
      <Head>
        <title>HomePageContent</title>
        <meta name="description" content="This is the home page" />
      </Head>
      <Page className={"border border-gray-300"} FULL={false}>
        <Hero />

        <SectionOne />

        <SectionTwoBestSellers />

        <SectionThreeWaterSports homeData={homeData} />

        <SectionFourWaterSportsProducts />
      </Page>
    </>
  );
};

export default HomePageContent;
