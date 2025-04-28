import Page from "@/components/common/Page";
import SubscribeNow from "@/components/home/SubscribeNow";
import InstallVideoBlock from "@/components/shop/product-page/InstallVideoBlock";
import ProductDescription from "@/components/shop/product-page/ProductDescription";
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
      <Page FULL className="sm:px-5 lg:px-20">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          {/* Product */}
          <ProductDetails product={product} />

          {/* Product Long Description */}
          <ProductDescription product={product} />

          {/* Related Products */}
          <RelatedProducts relatedProducts={relatedProducts} />

          {/* How Install Video */}
          {/* <InstallVideoBlock product={product} /> */}
          {product.acf.youtube && <InstallVideoBlock product={product} />}

          {/* Product FAQ */}
          <ProductFaq />

          {/* Subscribe Now */}
          <SubscribeNow />
        </div>
      </Page>
    </div>
  );
};

export default SingleProductContent;
