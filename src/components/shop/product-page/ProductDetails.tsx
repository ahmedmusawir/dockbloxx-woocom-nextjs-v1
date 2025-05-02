"use client";

import Spinner from "@/components/common/Spinner";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import AdditionalDetailsAccordion from "./AdditionalDetailsAccordion";
import AddToCartButton from "./AddToCartButton";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import BloxxPricing from "./variations/BloxxPricing";
import ComplexVariationPricing from "./variations/ComplexVariationPricing";
import SimplePricing from "./variations/SimplePricing";
import SingleVariationPricing from "./variations/SingleVariationPricing";
import { renderPricingModule } from "@/lib/renderPricingModules";
import CurrentPriceDisplay from "./CurrentPriceDisplay";
import { CartItem } from "@/types/cart";
import ManageQuantity from "./ManageQuantity";
import { useCartStore } from "@/store/useCartStore";
import MobileProductSlider from "./mobile/MobileProductSlider";
import ProductShortDescription from "./ProductShortDescription";
import StaticLogoBlock from "./StaticLogoBlock";

interface Props {
  product: Product;
}

const ProductDetails = ({ product }: Props) => {
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [productCategory, setProductCategory] = useState<{
    type: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Add CartItem state to the component
  const [cartItem, setCartItem] = useState<CartItem>({
    id: product.id,
    name: product.name,
    price: 0, // Default price
    quantity: 1, // Default quantity
    image:
      product.images[0].type === "video"
        ? product.images[1].src
        : product.images[0].src, // some galleries have video
    categories: product.categories,
    basePrice: 0, // Default base price
    variations: [],
    customFields: [],
    metadata: {},
  });

  // Map all category names to CartItem
  useEffect(() => {
    if (product && product.categories.length > 0) {
      setCartItem((prev) => ({
        ...prev,
        category: product.categories.map((cat) => cat.name), // Map all category names
      }));
    }
  }, [product]);

  // Fetch and parse the product category JSON on mount
  useEffect(() => {
    const categoryScript = document.getElementById("product-category-custom");
    if (categoryScript) {
      const data = JSON.parse(categoryScript.textContent || "{}");
      setProductCategory(data);
    }
  }, []);

  // Sync quantity and current price to CartItem
  useEffect(() => {
    setCartItem((prev) => ({
      ...prev,
      quantity,
      price: basePrice ? basePrice * quantity : 0, // Calculate total price
    }));
  }, [quantity, basePrice]);

  if (!productCategory) {
    return <Spinner />; // Show a loading state until the category is fetched
  }

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  // Add this function inside the ProductDetails component
  const handleAddToCart = () => {
    const { setCartItems, setIsCartOpen } = useCartStore.getState();

    /* -------------------- 1 · Pole-size validation -------------------- */
    const poleSizeVariation = cartItem.variations?.find(
      (variation) => variation.name === "Pole Size"
    );

    if (poleSizeVariation?.value === "Other") {
      const hasCustomSize = cartItem.customFields?.length ?? 0;
      if (hasCustomSize === 0) {
        alert("Please enter a custom pole size before adding to cart!");
        return; // abort if custom size missing
      }
    }

    /* -------------------- 2 · Normalise pricing ----------------------- */
    // Force `price` to be the unit price; add basePrice for clarity
    const unitPrice =
      typeof cartItem.basePrice === "number"
        ? cartItem.basePrice
        : cartItem.price / Math.max(cartItem.quantity || 1, 1);

    const itemToStore: CartItem = {
      ...cartItem,
      price: unitPrice, // unit cost ONLY
      basePrice: unitPrice, // explicit copy (optional but helpful)
    };

    /* -------------------- 3 · Push into Zustand ----------------------- */
    setCartItems((prevItems: CartItem[]) => {
      const existing = prevItems.find((i) => i.id === itemToStore.id);

      if (existing) {
        // increment quantity
        return prevItems.map((i) =>
          i.id === itemToStore.id
            ? { ...i, quantity: i.quantity + itemToStore.quantity }
            : i
        );
      }
      // add brand-new item
      return [...prevItems, itemToStore];
    });

    /* -------------------- 4 · Open mini-cart & debug ------------------ */
    setIsCartOpen(true);
    console.log("[AddToCart] stored item:", itemToStore);
  };

  // console.log("[ProductDetails] cartItem", cartItem);

  return (
    <div className="lg:grid lg:grid-cols-[60%_40%] lg:items-start lg:gap-x-8">
      {/* Image gallery :: LEFT COLUMN START*/}
      <div>
        {/* Desktop Image Gallery (Hidden on Mobile) */}
        <div className="hidden lg:block">
          <ProductImageGallery product={product} />
        </div>

        {/* Mobile Slider (Hidden on Desktop) */}
        <div className="block lg:hidden">
          <MobileProductSlider product={product} />
        </div>
      </div>
      {/* LEFT COLUMN ENDS */}

      {/* RIGHT COLUMN STARTS */}
      {/* Product info */}
      <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
        {/* Produt Name & Price */}
        <ProductInfo product={product} />

        {/* Render the appropriate pricing module */}
        {renderPricingModule(
          productCategory,
          setBasePrice,
          cartItem,
          setCartItem,
          {
            SimplePricing,
            SingleVariationPricing,
            ComplexVariationPricing,
            BloxxPricing,
          }
        )}

        {/* Current Price Display */}
        <CurrentPriceDisplay basePrice={basePrice} quantity={quantity} />

        {/* The Quantity & Add to Cart button block */}
        <div className="flex items-center space-x-8 my-10">
          {/* Quantity Selector */}
          <ManageQuantity
            quantity={quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />

          {/* Add to Cart Button */}
          <AddToCartButton
            cartItem={cartItem}
            handleAddToCart={handleAddToCart}
          />
        </div>

        {/* Product Short Description */}
        <ProductShortDescription product={product} />

        {/* Static Logo Block */}
        <StaticLogoBlock />

        {/* Additional Details w/ Accordion */}
        <AdditionalDetailsAccordion product={product} />
      </div>
      {/* RIGHT COLUMN ENDS */}
    </div>
  );
};

export default ProductDetails;
