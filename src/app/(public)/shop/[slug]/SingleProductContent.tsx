import Page from "@/components/common/Page";
import SubscribeNow from "@/components/home/SubscribeNow";
import InstallVideoBlock from "@/components/shop/product-page/InstallVideoBlock";
import ProductDetails from "@/components/shop/product-page/ProductDetails";
import ProductFaq from "@/components/shop/product-page/ProductFaq";
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

          {/* How Install Video */}
          <InstallVideoBlock product={product} />

          {/* Product FAQ */}
          <ProductFaq />

          {/* Subscribe Now */}
          <SubscribeNow />
        </div>
      </Page>
      {/* </main> */}
    </div>
  );
};

export default SingleProductContent;
