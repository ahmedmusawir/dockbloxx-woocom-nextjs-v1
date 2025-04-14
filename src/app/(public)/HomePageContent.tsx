import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
import SectionOneBestSellers from "@/components/home/SectionOneBestSellers";
import SectionOneBestSellersProducts from "@/components/home/SectionOneBestSellersProducts";
import SectionThreeWaterSports from "@/components/home/SectionTwoWaterSports";
import SectionThreeWaterSportsProducts from "@/components/home/old";
import { fetchCategoryProductsForHomePage } from "@/services/categoryServices";
import { fetchHomePageData } from "@/services/pageServices";
import Head from "next/head";
import SectionTwoWaterSports from "@/components/home/SectionTwoWaterSports";
import SectionTwoWaterSportsProducts from "@/components/home/SectionTwoWaterSportsProducts";
import SectionThreeEntertainments from "@/components/home/SectionThreeEntertainments";
import HomeProductList from "@/components/home/HomeProductList";
import SectionFourSportsman from "@/components/home/SectionFourSportsman";

const HomePageContent = async () => {
  const homeData = await fetchHomePageData();
  // console.log("Home Page Content Data:", homeData);

  const bestSellers = await fetchCategoryProductsForHomePage("best-sellers");
  const bestSellersSectionTitle = "BEST SELLERS";
  // console.log("Best Sellers [SectionTwoBestSellers.tsx]", bestSellers);

  const waterSports = await fetchCategoryProductsForHomePage("water-sports");
  const waterSportsSectionTitle = "WATER SPORTS";

  const entertainments = await fetchCategoryProductsForHomePage(
    "entertainments"
  );
  const entertainmentsSectionTitle = "ENTERTAINMENTS";

  const sportsman = await fetchCategoryProductsForHomePage("sportsman");
  const sportsmanSectionTitle = "SPORTSMAN";

  const dockEssentials = await fetchCategoryProductsForHomePage(
    "dock-essentials"
  );
  const dockEssentialsSectionTitle = "DOCK ESSENTIALS";

  return (
    <>
      <Head>
        <title>HomePageContent</title>
        <meta name="description" content="This is the home page" />
      </Head>
      <Page className={"border border-gray-300"} FULL={false}>
        <Hero />

        <SectionOneBestSellers homeData={homeData} />

        <HomeProductList
          products={bestSellers}
          sectionTitle={bestSellersSectionTitle}
        />

        <SectionTwoWaterSports homeData={homeData} />

        <HomeProductList
          products={waterSports}
          sectionTitle={waterSportsSectionTitle}
        />

        <SectionThreeEntertainments homeData={homeData} />

        <HomeProductList
          products={entertainments}
          sectionTitle={entertainmentsSectionTitle}
        />

        <SectionFourSportsman homeData={homeData} />
      </Page>
    </>
  );
};

export default HomePageContent;
