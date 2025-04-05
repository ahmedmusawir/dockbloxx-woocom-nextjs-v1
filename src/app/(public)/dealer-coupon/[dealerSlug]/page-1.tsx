import {
  fetchAllDealerSlugs,
  fetchDealerPageData,
} from "@/services/dealerServices";
import DealerPageContent from "./DealerPageContent";

// Instead of destructuring dealerSlug inline, we accept (props: any)
export default async function DealerCouponPage(props: any) {
  const { params } = props;
  const dealerSlug = params.dealerSlug;

  const dealerPageData = await fetchDealerPageData(dealerSlug);

  if (!dealerPageData) {
    return <div>Dealer Page Not Found.</div>;
  }

  return <DealerPageContent data={dealerPageData} />;
}

export async function generateStaticParams() {
  const slugs = await fetchAllDealerSlugs();
  return slugs.map((slug: string) => ({ dealerSlug: slug }));
}
