import { notFound } from "next/navigation";
import SingleProductContent from "./SingleProductContent";
import {
  fetchAllProductSlugs,
  fetchPoleShapeStyles,
  fetchProductBySlug,
  fetchProductVariationsById,
  fetchRelatedProductsById,
} from "@/services/productServices";
import { detectProductCategory } from "@/lib/utils";
import { fetchProductSEOBySlug, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs();
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }
}

// --------------------------------------------
// SEO Metadata for single product
// --------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const yoast = await fetchProductSEOBySlug(slug);
  return yoast ? mapYoastToMetadata(yoast) : {};
}

// Single product page component
const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const singleProduct = await fetchProductBySlug(slug);

  // console.log("Single Product only [shop/[slug]/page.tsx]", singleProduct);

  // Run this somewhere in a server-side context (e.g., inside an API route or a page)
  const yoast = await fetchProductSEOBySlug(slug);

  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;

  if (schema) {
    schema = fixUrl(schema);
  }

  // console.log("[YoastSEO] Product SEO JSON:", seo);

  // Handle 404 with ISR
  if (!singleProduct) {
    notFound();
  }

  const productWithVariations = {
    ...singleProduct,
    price: parseFloat(singleProduct.price),
    variations: await fetchProductVariationsById(
      singleProduct.id,
      singleProduct.variations
    ),
    related_products: await fetchRelatedProductsById(
      singleProduct.related_ids.slice(0, 4) // Brings only 4 related products
    ),
  };

  // console.log("varions [SingleProduct Page]", productWithVariations.variations);

  const relatedProducts = productWithVariations.related_products;

  // console.log("singleProduct [SingleProduct page]", singleProduct);
  // console.log("relatedProduct [SingleProduct page]", relatedProducts);

  // Detect the product category
  const customCategory = detectProductCategory(productWithVariations);

  // Fetch pole styles for Bloxx category
  const poleStyles =
    customCategory.type === "bloxx" ? await fetchPoleShapeStyles() : null;

  // Augment the custom category JSON with pole styles
  const augmentedCategory = {
    ...customCategory,
    ...(poleStyles && { poleStyles }),
  };
  // console.log("augmentedCategory [SingleProduct page]", augmentedCategory);

  return (
    <div>
      {/* Embeded variations data as JSON */}
      <script
        id="product-variations"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productWithVariations.variations),
        }}
      />
      {/* Embed category data as JSON */}
      <script
        id="product-category-custom"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(augmentedCategory),
        }}
      />
      {schema && (
        <script
          id={`yoast-schema-product-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <SingleProductContent
        singleProduct={singleProduct}
        relatedProducts={relatedProducts}
      />
    </div>
  );
};

export default SingleProductPage;
