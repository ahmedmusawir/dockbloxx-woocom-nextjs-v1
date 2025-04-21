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
 */
export async function generateMetadata({
  params,
}: {
  params: { catSlug: string };
}) {
  const yoast = await fetchYoastCategorySEOJson(params.catSlug);
  return mapYoastToMetadata(yoast);
}

// Static Params for SSG
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories
    .filter((cat) => cat.slug !== "bloxx")
    .map((cat) => ({ catSlug: cat.slug }));
}

// No manual param typing, destructure inside the function body
const Page = async (props: any) => {
  const { params, searchParams } = props;
  const catSlug = params.catSlug;

  // ... for SEO handling
  const yoast = await fetchYoastCategorySEOJson(catSlug);
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  const pageNumber = parseInt(searchParams?.page || "1", 10);
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
