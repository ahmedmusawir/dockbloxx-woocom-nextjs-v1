import Head from "next/head";
import Page from "@/components/common/Page";
import ProductList from "@/components/shop/ProductList";
import { fetchInitialProducts } from "@/services/productServices";
import NumberedPagination from "@/components/common/NumberedPagination";
import ShopPageReset from "@/components/shop/ShopPageReset";
import CategoryFilter from "@/components/shop/filters/CategoryFilter";
import { getAllCategories } from "@/services/categoryServices";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

const ShopPageContent = async () => {
  const productsPerPage = 12;
  // Fetching the first 12 products
  const { products, totalProducts } = await fetchInitialProducts(1, 12);

  // Calculate total pages based on total products
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Fetching all the categories
  const categories = await getAllCategories();

  return (
    <>
      <Head>
        <title>Build-a-Bloxx - Custom Dock Accessories</title>
        <meta
          name="description"
          content="Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
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
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            The Shop
          </h1>
        </div>
      </div>

      <Page className={""} FULL={false}>
        <div className="bg-white">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-8 md:max-w-7xl lg:max-w-7xl lg:px-1">
            <div className="md:flex md:items-center md:justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Trending products
              </h2>
              <hr />

              <CategoryFilter categories={categories} />
            </div>
            <ShopPageReset
              initialProducts={products}
              totalProducts={totalProducts}
            />
            {/* <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-2 md:gap-y-0 lg:gap-x-8"> */}
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

export default ShopPageContent;
