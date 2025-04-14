import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
import SectionOneBestSellers from "@/components/home/SectionOneBestSellers";
import SectionOneBestSellersProducts from "@/components/home/SectionOneBestSellersProducts";
import SectionThreeWaterSports from "@/components/home/SectionThreeWaterSports";
import SectionThreeWaterSportsProducts from "@/components/home/SectionThreeWaterSportsProducts";
import { fetchCategoryProductsForHomePage } from "@/services/categoryServices";
import { fetchHomePageData } from "@/services/pageServices";
import Head from "next/head";

const HomePageContent = async () => {
  const homeData = await fetchHomePageData();
  console.log("Home Page Content Data:", homeData);

  const bestSellers = await fetchCategoryProductsForHomePage("best-sellers");
  // console.log("Best Sellers [SectionTwoBestSellers.tsx]", bestSellers);

  return (
    <>
      <Head>
        <title>HomePageContent</title>
        <meta name="description" content="This is the home page" />
      </Head>
      <Page className={"border border-gray-300"} FULL={false}>
        <Hero />

        <SectionOneBestSellers homeData={homeData} />

        <SectionOneBestSellersProducts bestSellers={bestSellers} />

        <SectionThreeWaterSports homeData={homeData} />

        <SectionThreeWaterSportsProducts />
      </Page>
    </>
  );
};

export default HomePageContent;
