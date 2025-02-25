import { CartItem } from "@/types/cart";

export const renderPricingModule = (
  productCategory: { type: string; price?: number } | null,
  setBasePrice: React.Dispatch<React.SetStateAction<number | null>>,
  cartItem: CartItem,
  setCartItem: React.Dispatch<React.SetStateAction<CartItem>>, // New props
  components: {
    SimplePricing: React.ComponentType<{
      productPrice: number;
      onPriceChange: (price: number | null) => void;
      cartItem: CartItem; // Include cartItem prop
      setCartItem: React.Dispatch<React.SetStateAction<CartItem>>;
    }>;
    SingleVariationPricing: React.ComponentType<{
      onPriceChange: (price: number | null) => void;
      cartItem: CartItem;
      setCartItem: React.Dispatch<React.SetStateAction<CartItem>>;
    }>;
    ComplexVariationPricing: React.ComponentType<{
      onPriceChange: (price: number | null) => void;
      cartItem: CartItem;
      setCartItem: React.Dispatch<React.SetStateAction<CartItem>>;
    }>;
    BloxxPricing: React.ComponentType<{
      onPriceChange: (price: number | null) => void;
      cartItem: CartItem;
      setCartItem: React.Dispatch<React.SetStateAction<CartItem>>;
    }>;
  }
) => {
  if (!productCategory) {
    return <div>Error: Could not determine product category.</div>;
  }

  const { type, price } = productCategory;
  const {
    SimplePricing,
    SingleVariationPricing,
    ComplexVariationPricing,
    BloxxPricing,
  } = components;

  switch (type) {
    case "simple":
      if (price === undefined) {
        return <div>Error: Missing price for simple product.</div>;
      }
      return (
        <SimplePricing
          productPrice={price}
          onPriceChange={setBasePrice}
          cartItem={cartItem}
          setCartItem={setCartItem}
        />
      );
    case "single-variation":
      return (
        <SingleVariationPricing
          onPriceChange={setBasePrice}
          cartItem={cartItem}
          setCartItem={setCartItem}
        />
      );
    case "complex-variation":
      return (
        <ComplexVariationPricing
          onPriceChange={setBasePrice}
          cartItem={cartItem}
          setCartItem={setCartItem}
        />
      );
    case "bloxx":
      return (
        <BloxxPricing
          onPriceChange={setBasePrice}
          cartItem={cartItem}
          setCartItem={setCartItem}
        />
      );
    default:
      return null;
  }
};
