import {
  getAllCategories,
  fetchCategoryProductsPaginated,
} from "@/services/categoryServices";
import SingleCategoryContent from "./SingleCategoryContent";

import { fetchYoastCategorySEOJson } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";

import Script from "next/script";
import { fixUrl } from "@/lib/seoUtils";

/**
 * Dynamically generates SEO metadata for each category page using its slug.
 *
 * @param params - Route params containing catSlug
 * @returns Metadata object mapped from Yoast SEO JSON
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ catSlug: string }>;
}) {
  const { catSlug } = await params;
  const yoast = await fetchYoastCategorySEOJson(catSlug);
  return mapYoastToMetadata(yoast);
}

// Static Params for SSG
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories
    .filter((cat) => cat.slug !== "bloxx")
    .map((cat) => ({ catSlug: cat.slug }));
}

// Category Page Component
const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ catSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { catSlug } = await params;
  const search = await searchParams;

  // ... for SEO handling
  const yoast = await fetchYoastCategorySEOJson(catSlug);
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  const pageNumber = parseInt((search.page as string) || "1", 10);
  const productsPerPage = 12;

  const categories = await getAllCategories();
  const { products, totalProducts } = await fetchCategoryProductsPaginated(
    catSlug,
    pageNumber,
    productsPerPage
  );
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // console.log("products [/category/[catSlug]/page.tsx]", products);

  return (
    <>
      {schema && (
        <script
          id={`yoast-schema-cat-${catSlug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        ></script>
      )}

      <SingleCategoryContent
        catSlug={catSlug}
        categories={categories}
        products={products}
        totalProducts={totalProducts}
        totalPages={totalPages}
      />
    </>
  );
};

export default Page;
