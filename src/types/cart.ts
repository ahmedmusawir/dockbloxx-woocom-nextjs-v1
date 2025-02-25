// Unified CartItem data type
export interface CartItem {
  id: number; // Product ID
  name: string; // Product Name
  price: number; // Total Price (basePrice * quantity)
  quantity: number; // Quantity added to the cart
  image: string; // Main image of the product
  categories: Array<{
    id: number; // Category ID
    name: string; // Category Name
    slug: string; // Category Slug
  }>; // Match the structure of product.categories
  basePrice: number; // Base price of the product
  variation_id?: number;
  variations: Array<{
    name: string; // Variation name (e.g., "Pole Shape", "Size")
    value: string; // Selected variation value
  }>; // Dynamic variations
  customFields?: Array<{
    name: string; // Custom field name (e.g., "Custom Size")
    value: string; // User-entered value
  }>; // User-defined fields
  metadata?: Record<string, any>; // Additional metadata (e.g., SKU, stock info)
}
