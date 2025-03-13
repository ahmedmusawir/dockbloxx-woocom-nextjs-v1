import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
import SectionFourWaterSportsProducts from "@/components/home/SectionFourWaterSportsProducts";
import SectionOne from "@/components/home/SectionOne";
import SectionThreeWaterSports from "@/components/home/SectionThreeWaterSports";
import SectionTwoBestSellers from "@/components/home/SectionTwoBestSellers";
import Head from "next/head";
import React, { ReactNode } from "react";

const HomePageContent = () => {
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

        <SectionThreeWaterSports />

        <SectionFourWaterSportsProducts />
      </Page>
    </>
  );
};

export default HomePageContent;
