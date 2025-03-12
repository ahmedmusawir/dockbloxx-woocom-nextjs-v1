import Page from "@/components/common/Page";
import ProductDetails from "@/components/shop/product-page/ProductDetails";
import RelatedProducts from "@/components/shop/product-page/RelatedProducts";
import { Product, RelatedProduct } from "@/types/product";

interface Props {
  singleProduct: Product;
  relatedProducts: RelatedProduct[];
}

const SingleProductContent = ({
  singleProduct: product,
  relatedProducts,
}: Props) => {
  return (
    <div className="bg-white">
      {/* <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8"> */}
      <Page FULL className="sm:px-5 lg:px-20">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          {/* Product */}
          <ProductDetails product={product} />

          {/* Related Products */}
          <RelatedProducts relatedProducts={relatedProducts} />
        </div>
      </Page>
      {/* </main> */}
    </div>
  );
};

export default SingleProductContent;
