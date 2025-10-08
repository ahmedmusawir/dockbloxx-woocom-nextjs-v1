/**
 * Component tests for CartSlide.tsx
 * Tests the cart drawer UI: open/close, display items, quantity controls, remove items.
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import CartSlide from "@/components/cart/CartSlide";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cart";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => React.createElement("img", props),
}));

// Helper to create a test cart item
function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 123,
    name: "Test Product",
    slug: "test-product",
    price: 50,
    quantity: 1,
    image: "test.jpg",
    categories: [],
    basePrice: 50,
    variations: [],
    ...overrides,
  };
}

describe("CartSlide Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mocks
    mockPush.mockClear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Reset cart store
    useCartStore.setState({
      cartItems: [],
      isCartOpen: false,
      isLoading: false,
    });
  });

  test("does not render when isCartOpen is false", () => {
    useCartStore.setState({ isCartOpen: false });

    render(<CartSlide />);

    // Dialog should not be visible
    expect(screen.queryByText("Shopping Cart")).not.toBeInTheDocument();
  });

  test("renders when isCartOpen is true", () => {
    useCartStore.setState({ isCartOpen: true });

    render(<CartSlide />);

    // Dialog title should be visible
    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
  });

  test("shows empty cart message when no items", () => {
    useCartStore.setState({ isCartOpen: true, cartItems: [] });

    render(<CartSlide />);

    expect(screen.getByText("The Shopping Cart is empty!")).toBeInTheDocument();
  });

  test("displays cart items correctly", () => {
    const items = [
      createCartItem({ id: 1, name: "Product 1", price: 50, quantity: 2 }),
      createCartItem({ id: 2, name: "Product 2", price: 30, quantity: 1 }),
    ];

    useCartStore.setState({ isCartOpen: true, cartItems: items });

    render(<CartSlide />);

    // Check if product names are displayed
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();

    // Check if prices are displayed (without .00)
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$30")).toBeInTheDocument();
  });

  test("displays correct subtotal", () => {
    const items = [
      createCartItem({ id: 1, price: 50, basePrice: 50, quantity: 2 }), // 100
      createCartItem({ id: 2, price: 30, basePrice: 30, quantity: 1 }), // 30
    ];

    useCartStore.setState({ isCartOpen: true, cartItems: items });

    render(<CartSlide />);

    // Subtotal should be $130 (subtotal() uses price * quantity)
    expect(screen.getByText("$130")).toBeInTheDocument();
  });

  test("closes cart when close button is clicked", () => {
    useCartStore.setState({ isCartOpen: true });

    render(<CartSlide />);

    // Find and click the close button (X icon)
    const closeButton = screen.getByRole("button", { name: /close panel/i });
    fireEvent.click(closeButton);

    // Cart should be closed
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  test("increases quantity when + button is clicked", () => {
    const item = createCartItem({ id: 1, name: "Product 1", quantity: 1 });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Find the + button by its text content
    const increaseButton = screen.getByRole("button", { name: "+" });
    fireEvent.click(increaseButton);

    // Quantity should increase to 2
    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });

  test("decreases quantity when - button is clicked", () => {
    const item = createCartItem({ id: 1, name: "Product 1", quantity: 2 });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Find the - button by its text content
    const decreaseButton = screen.getByRole("button", { name: "-" });
    fireEvent.click(decreaseButton);

    // Quantity should decrease to 1
    expect(useCartStore.getState().cartItems[0].quantity).toBe(1);
  });

  test("removes item when quantity is 1 and - button is clicked", () => {
    const item = createCartItem({ id: 1, name: "Product 1", quantity: 1 });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Find the - button by its text content
    const decreaseButton = screen.getByRole("button", { name: "-" });
    fireEvent.click(decreaseButton);

    // Item should be removed
    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  test("removes item when remove button is clicked", () => {
    const item = createCartItem({ id: 1, name: "Product 1", quantity: 2 });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Find the remove button
    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    // Item should be removed
    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  test("navigates to /shop when last item is removed", () => {
    const item = createCartItem({ id: 1, name: "Product 1", quantity: 1 });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Remove the item
    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    // Should navigate to /shop
    expect(mockPush).toHaveBeenCalledWith("/shop");
  });

  test("checkout button navigates to /checkout", () => {
    const item = createCartItem({ id: 1, name: "Product 1" });
    useCartStore.setState({ isCartOpen: true, cartItems: [item] });

    render(<CartSlide />);

    // Find and click the checkout button
    const checkoutButton = screen.getByRole("link", { name: /checkout/i });
    
    // Check that it has the correct href
    expect(checkoutButton).toHaveAttribute("href", "/checkout");
  });
});
