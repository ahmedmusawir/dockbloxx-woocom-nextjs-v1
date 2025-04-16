import parse from "html-react-parser";
import { Product } from "@/types/product";

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
        <p className="text-4xl tracking-tight text-blue-400 font-extrabold">
          {parse(product.price_html)}
        </p>
      </div>
    </>
  );
};

export default ProductInfo;
