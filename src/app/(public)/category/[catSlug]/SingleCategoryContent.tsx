import Head from "next/head";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import ProductList from "@/components/shop/ProductList";
import NumberedPagination from "@/components/common/NumberedPagination";
import ShopPageReset from "@/components/shop/ShopPageReset";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface Props {
  catSlug: string;
  categories: Category[];
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

const SingleCategoryContent = ({
  catSlug,
  categories,
  products,
  totalProducts,
  totalPages,
}: Props) => {
  return (
    <>
      <Head>
        <title>{`Shop Category: ${catSlug}`}</title>
        <meta
          name="description"
          content={`Explore products under ${catSlug}`}
        />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="text-center capitalize">
            {catSlug.replace(/-/g, " ")}
          </h1>
        </Row>
        <div className="bg-white">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-8 lg:max-w-7xl lg:px-1">
            <div className="md:flex md:items-center md:justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Category Products
              </h2>
              <CategoryFilter categories={categories} />
            </div>

            <ShopPageReset
              initialProducts={products}
              totalProducts={totalProducts}
            />

            <div className="">
              <ProductList
                initialProducts={products}
                totalProducts={totalProducts}
              />
            </div>
          </div>

          <NumberedPagination totalPages={totalPages} />
        </div>
      </Page>
    </>
  );
};

export default SingleCategoryContent;
