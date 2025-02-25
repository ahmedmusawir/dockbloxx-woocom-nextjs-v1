import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
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
      </Page>
    </>
  );
};

export default HomePageContent;
