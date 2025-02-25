import parse from "html-react-parser";
import { Product } from "@/types/product";

interface Props {
  product: Product;
}
const ProductInfo = ({ product }: Props) => {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {product.name}
      </h1>

      <div className="mt-3">
        <h2 className="sr-only">Product information</h2>
        <p className="text-3xl tracking-tight text-gray-900">
          {parse(product.price_html)}
        </p>
      </div>
    </>
  );
};

export default ProductInfo;
