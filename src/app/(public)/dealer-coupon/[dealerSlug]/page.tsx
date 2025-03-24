import {
  fetchAllDealerSlugs,
  fetchDealerPageData,
} from "@/services/dealerServices";
import DealerPageContent from "./DealerPageContent";

export default async function DealerCouponPage({
  params: { dealerSlug },
}: {
  params: { dealerSlug: string };
}) {
  const dealerPageData = await fetchDealerPageData(dealerSlug);
  console.log(
    "dealer data [dealer-coupon/dealer-slug/page.tsx]",
    dealerPageData
  );

  if (!dealerPageData) {
    return <div>Dealer Page Not Found.</div>;
  }

  return <DealerPageContent data={dealerPageData} />;
}

export async function generateStaticParams() {
  const slugs = await fetchAllDealerSlugs();
  return slugs.map((slug: string) => ({ dealerSlug: slug }));
}
