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
    return (
      <div className="mx-auto max-w-7xl px-10 py-24 border-4 text-center my-5 w-full">
        <h2 className="text-3xl font-semibold text-red-500">
          Dealer Page Not Found
        </h2>
      </div>
    );
  }

  return <DealerPageContent data={dealerPageData} />;
}

export async function generateStaticParams() {
  const slugs = await fetchAllDealerSlugs();
  return slugs.map((slug: string) => ({ dealerSlug: slug }));
}
