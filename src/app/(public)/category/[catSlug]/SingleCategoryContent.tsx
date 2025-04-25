import Head from "next/head";
import Page from "@/components/common/Page";
import ProductList from "@/components/shop/ProductList";
import NumberedPagination from "@/components/common/NumberedPagination";
import ShopPageReset from "@/components/shop/ShopPageReset";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

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

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Custom Services Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold capitalize">
            {catSlug.replace(/-/g, " ")}
          </h1>
        </div>
      </div>

      <Page className={""} FULL={false}>
        <div className="bg-white">
          {/* <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-8 lg:max-w-7xl lg:px-1"> */}
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-8 md:max-w-7xl lg:max-w-7xl lg:px-1">
            <div className="md:flex md:items-center md:justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
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
