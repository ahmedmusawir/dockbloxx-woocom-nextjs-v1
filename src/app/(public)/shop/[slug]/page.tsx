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

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs();
    // console.log("Fetched product slugs:", slugs);
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }
}

// Single product page component
const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const singleProduct = await fetchProductBySlug(slug);

  // TESTING ACF POLES STYLES
  // const poleImages = await fetchPoleShapeStyles();
  // console.log("Pole Styles [Single Product page.tsx]", poleImages);

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
    related_products: await fetchRelatedProductsById(singleProduct.related_ids),
  };

  // console.log("varions [SingleProduct Page]", productWithVariations.variations);

  const relatedProducts = productWithVariations.related_products;

  console.log("singleProduct [SingleProduct page]", singleProduct);
  console.log("relatedProduct [SingleProduct page]", relatedProducts);

  // Detect the product category
  const customCategory = detectProductCategory(productWithVariations);
  console.log(
    "Product Variations [SingleProduct page]",
    productWithVariations.variations
  );
  // console.log("custom Category [SingleProduct page]", customCategory);

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
      <SingleProductContent
        singleProduct={singleProduct}
        relatedProducts={relatedProducts}
      />
    </div>
  );
};

export default SingleProductPage;
