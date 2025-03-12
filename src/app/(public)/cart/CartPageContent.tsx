import CartItems from "@/components/cart/cart-page/CartItems";
import FeaturedProducts from "@/components/cart/cart-page/FeaturedProducts";
import { fetchFeaturedProducts } from "@/services/productServices";

const CartPageContent = async () => {
  const results = await fetchFeaturedProducts();
  const featuredProducts = results.products;

  console.log("featured products [CartPageContent]", featuredProducts);
  return (
    <div className="bg-white">
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl text-center font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>

        {/* Cart Items */}
        <CartItems />

        {/* Featured products */}
        <FeaturedProducts featuredProducts={featuredProducts} />
      </main>
    </div>
  );
};

export default CartPageContent;
