import { DEALER_REST_COUPONS } from "@/constants/apiEndpoints";

export async function fetchAllDealerSlugs() {
  try {
    const response = await fetch(`${DEALER_REST_COUPONS}?_fields=slug`);

    if (!response.ok) throw new Error("Failed to fetch dealer slugs");

    const slugs = await response.json();

    return slugs.map((item: { slug: string }) => item.slug);
  } catch (error) {
    console.error("[fetchAllDealerSlugs] Error:", error);
    return [];
  }
}

export async function fetchDealerPageData(dealerSlug: string) {
  try {
    const response = await fetch(`${DEALER_REST_COUPONS}?slug=${dealerSlug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 1 min
    });

    if (!response.ok)
      throw new Error(`Failed to fetch data for dealer: ${dealerSlug}`);

    const data = await response.json();

    // console.log("dealer data [dealerServices]", data[0].acf.company_image);

    return data[0]; // Extract only ACF fields for easy consumption
  } catch (error) {
    console.error("[fetchDealerPageData] Error:", error);
    return null;
  }
}
