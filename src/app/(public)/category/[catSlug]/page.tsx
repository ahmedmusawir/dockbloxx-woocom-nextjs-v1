import {
  getAllCategories,
  fetchCategoryProductsPaginated,
} from "@/services/categoryServices";
import SingleCategoryContent from "./SingleCategoryContent";

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
  const pageNumber = parseInt(searchParams?.page || "1", 10);
  const productsPerPage = 12;

  const categories = await getAllCategories();
  const { products, totalProducts } = await fetchCategoryProductsPaginated(
    catSlug,
    pageNumber,
    productsPerPage
  );
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <SingleCategoryContent
      catSlug={catSlug}
      categories={categories}
      products={products}
      totalProducts={totalProducts}
      totalPages={totalPages}
    />
  );
};

export default Page;
