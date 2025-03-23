export async function fetchAllDealerSlugs() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEALER_COUPON_CPT_URL}?_fields=slug`
    );

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DEALER_COUPON_CPT_URL}?slug=${dealerSlug}`,
      {
        next: { revalidate: 600 }, // ISR: revalidate every 10 mins
      }
    );

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
