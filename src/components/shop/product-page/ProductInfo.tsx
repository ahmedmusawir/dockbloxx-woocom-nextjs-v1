import { Product } from "@/types/product";
import { PriceDisplay } from "../PriceDisplay";

interface Props {
  product: Product;
}

const ProductInfo = ({ product }: Props) => {
  // reuse the same deals logic
  const isDeal = product.categories.some((cat) => cat.slug === "deals");

  return (
    <>
      {isDeal && (
        <div className="inline-block bg-red-600 text-white text-xl font-bold uppercase px-3 py-1 rounded mb-2">
          On Sale
        </div>
      )}

      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mt-2">
        {product.name}
      </h1>

      <div className="mt-3">
        <h2 className="sr-only">Product information</h2>
        <PriceDisplay product={product} variant="single" />
      </div>
    </>
  );
};

export default ProductInfo;
