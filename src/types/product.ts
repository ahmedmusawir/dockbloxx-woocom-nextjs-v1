/*
Product Types for WooCommerce REST API
Description: Defines the structure of a single product and associated types for shop and product pages.
 - ProductCategory: Represents product categories attached to a product.
 - Product: Represents a single product with all required details.
*/

// Represents a single product category
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

// Represents a single product returned from the WooCommerce REST API
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  price_html: string;
  regular_price?: string;
  sale_price?: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: string;
  description: string;
  short_description: string;
  sku: string;
  categories: ProductCategory[];
  images: Array<{
    id: number | string;
    src: string;
    name: string;
    alt: string;
    vid_id: string;
    type: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  variations: number[];
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  average_rating: string;
  rating_count: number;
  shipping_class_id: number;
  tax_class: string;
}

// Represented product variations for Single Product Details
export interface ProductVariation {
  id: number; // Unique ID of the variation
  price: string; // Current price of the variation
  regular_price: string; // Regular (non-sale) price
  sale_price: string | null; // Sale price, if applicable
  attributes: Array<{
    id: number; // Attribute ID
    name: string; // Attribute name (e.g., Color, Size)
    option: string; // Selected option (e.g., Red, Medium)
  }>; // Array of attributes specific to the variation
  stock_status: "instock" | "outofstock" | "onbackorder"; // Stock status
  sku: string | null; // SKU (if available)
  stock_quantity?: number | null; // Stock quantity (optional, if available)
  manage_stock?: boolean; // Whether stock is managed for this variation
  image?: {
    id: number; // ID of the image
    src: string; // Image URL
    alt: string; // Alt text for the image
  }; // Featured image for the variation (optional)
}

// Represented related products
export interface RelatedProduct {
  id: number; // The unique ID of the product
  name: string; // The name of the product
  slug: string; // The slug for building product URLs
  price_html: string; // The HTML for displaying product price (includes ranges or sale info)
  image: string; // The URL of the product's featured image
}
