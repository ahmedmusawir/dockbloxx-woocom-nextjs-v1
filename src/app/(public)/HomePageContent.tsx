import Page from "@/components/common/Page";
import Hero from "@/components/home/Hero";
import HomeProductList from "@/components/home/HomeProductList";
import SectionFourSportsman from "@/components/home/SectionFourSportsman";
import SectionOneBestSellers from "@/components/home/SectionOneBestSellers";
import SectionThreeEntertainments from "@/components/home/SectionThreeEntertainments";
import SectionTwoWaterSports from "@/components/home/SectionTwoWaterSports";
import { fetchCategoryProductsForHomePage } from "@/services/categoryServices";
import { fetchHomePageData } from "@/services/pageServices";
import Head from "next/head";

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
        <title>Home Page Content</title>
        <meta name="description" content="This is the home page" />
      </Head>
      <Page className={"border border-gray-300"} FULL={false}>
        <Hero homeData={homeData} />

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
