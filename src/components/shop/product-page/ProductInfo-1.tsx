import { Product } from "@/types/product";
import { PriceDisplay } from "../PriceDisplay";

interface Props {
  product: Product;
}
const ProductInfo = ({ product }: Props) => {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mt-5">
        {product.name}
      </h1>

      <div className="mt-3">
        <h1 className="sr-only">Product information</h1>
        <p className="font-bold tracking-tight text-blue-400 text-4xl">
          <PriceDisplay product={product} variant="single" />
        </p>
      </div>
    </>
  );
};

export default ProductInfo;
