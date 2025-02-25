import { fetchPaginatedProducts } from "@/services/productServices";
import ShopPageContent from "./ShopPageContent";

const Shop = async () => {
  // Test the REST API service function
  // const products = await fetchPaginatedProducts(1, 12);

  return <ShopPageContent />;
};

export default Shop;
