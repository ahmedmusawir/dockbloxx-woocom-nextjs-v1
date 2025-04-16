import CartItems from "@/components/cart/cart-page/CartItems";
import FeaturedProducts from "@/components/cart/cart-page/FeaturedProducts";
import { fetchFeaturedProducts } from "@/services/productServices";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Head from "next/head";

const CartPageContent = async () => {
  const results = await fetchFeaturedProducts();
  const featuredProducts = results;

  console.log("featured products [CartPageContent]", featuredProducts);
  return (
    <div className="bg-white">
      <Head>
        <title>Build-a-Bloxx - Custom Dock Accessories</title>
        <meta
          name="description"
          content="Shopping Cart: Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
        />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Shopping Cart Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Shopping Cart
          </h1>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-0 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Cart Items */}
        <CartItems />

        {/* Featured products */}
        <FeaturedProducts featuredProducts={featuredProducts} />
      </main>
    </div>
  );
};

export default CartPageContent;
