import React from "react";
import DealerPageContent from "./DealerPageContent";
import { fetchAllDealerSlugs } from "@/services/dealerServices";

export async function generateStaticParams() {
  const slugs = await fetchAllDealerSlugs();
  return slugs.map((slug: string) => ({ dealerSlug: slug }));
}

const DealerPage = () => {
  return (
    <>
      <DealerPageContent />
    </>
  );
};

export default DealerPage;
