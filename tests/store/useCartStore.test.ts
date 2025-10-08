/**
 * Unit tests for useCartStore.ts
 * Tests the Zustand cart store logic: adding, updating, removing items, and calculating totals.
 */

import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cart";

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

// Reset store before each test
beforeEach(() => {
  useCartStore.setState({ cartItems: [], isCartOpen: false });
});

describe("useCartStore - Basic Operations", () => {
  test("initial state is empty cart", () => {
    const { cartItems } = useCartStore.getState();

    expect(cartItems).toEqual([]);
  });

  test("setCartItems updates cart", () => {
    const items = [createCartItem({ id: 1 }), createCartItem({ id: 2 })];

    useCartStore.getState().setCartItems(items);

    expect(useCartStore.getState().cartItems).toHaveLength(2);
  });

  test("clearCart empties the cart", () => {
    useCartStore.setState({ cartItems: [createCartItem()] });

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  test("setIsCartOpen toggles cart drawer", () => {
    expect(useCartStore.getState().isCartOpen).toBe(false);

    useCartStore.getState().setIsCartOpen(true);

    expect(useCartStore.getState().isCartOpen).toBe(true);
  });
});

describe("useCartStore - addOrUpdateCartItem", () => {
  test("adds new item to empty cart", () => {
    const item = createCartItem({ id: 123, name: "Dog Bloxx", quantity: 1 });

    useCartStore.getState().addOrUpdateCartItem(item);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].name).toBe("Dog Bloxx");
    expect(cartItems[0].quantity).toBe(1);
  });

  test("increments quantity for same item (no variations)", () => {
    const item = createCartItem({ id: 123, quantity: 1 });

    useCartStore.getState().addOrUpdateCartItem(item);
    useCartStore.getState().addOrUpdateCartItem(item);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].quantity).toBe(2); // 1 + 1
  });

  test("adds separate line item for different variations", () => {
    const item1 = createCartItem({
      id: 123,
      variations: [{ name: "Color", value: "Red" }],
      quantity: 1,
    });
    const item2 = createCartItem({
      id: 123,
      variations: [{ name: "Color", value: "Blue" }],
      quantity: 1,
    });

    useCartStore.getState().addOrUpdateCartItem(item1);
    useCartStore.getState().addOrUpdateCartItem(item2);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(2); // Two separate line items
  });

  test("increments quantity for same variation", () => {
    const item = createCartItem({
      id: 123,
      variations: [{ name: "Color", value: "Red" }],
      quantity: 1,
    });

    useCartStore.getState().addOrUpdateCartItem(item);
    useCartStore.getState().addOrUpdateCartItem(item);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].quantity).toBe(2);
  });

  test("adds separate line item for different custom fields", () => {
    const item1 = createCartItem({
      id: 123,
      customFields: [{ name: "Engraving", value: "John" }],
      quantity: 1,
    });
    const item2 = createCartItem({
      id: 123,
      customFields: [{ name: "Engraving", value: "Jane" }],
      quantity: 1,
    });

    useCartStore.getState().addOrUpdateCartItem(item1);
    useCartStore.getState().addOrUpdateCartItem(item2);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(2); // Different custom fields = different items
  });
});

describe("useCartStore - Quantity Management", () => {
  test("increaseCartQuantity adds 1 to existing item", () => {
    const item = createCartItem({ id: 123, quantity: 2 });
    useCartStore.setState({ cartItems: [item] });

    useCartStore.getState().increaseCartQuantity(item);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(3);
  });

  test("decreaseCartQuantity subtracts 1 from existing item", () => {
    const item = createCartItem({ id: 123, quantity: 3 });
    useCartStore.setState({ cartItems: [item] });

    useCartStore.getState().decreaseCartQuantity(item);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });

  test("decreaseCartQuantity removes item when quantity reaches 0", () => {
    const item = createCartItem({ id: 123, quantity: 1 });
    useCartStore.setState({ cartItems: [item] });

    useCartStore.getState().decreaseCartQuantity(item);

    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  test("getItemQuantity returns correct quantity", () => {
    const item = createCartItem({ id: 123, quantity: 5 });
    useCartStore.setState({ cartItems: [item] });

    const quantity = useCartStore.getState().getItemQuantity(123);

    expect(quantity).toBe(5);
  });

  test("getItemQuantity returns 0 for non-existent item", () => {
    const quantity = useCartStore.getState().getItemQuantity(999);

    expect(quantity).toBe(0);
  });
});

describe("useCartStore - removeCartItem", () => {
  test("removes correct item from cart", () => {
    const item1 = createCartItem({ id: 1, name: "Item 1" });
    const item2 = createCartItem({ id: 2, name: "Item 2" });
    useCartStore.setState({ cartItems: [item1, item2] });

    useCartStore.getState().removeCartItem(item1);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].id).toBe(2);
  });

  test("removes correct variation from cart", () => {
    const item1 = createCartItem({
      id: 123,
      variations: [{ name: "Color", value: "Red" }],
    });
    const item2 = createCartItem({
      id: 123,
      variations: [{ name: "Color", value: "Blue" }],
    });
    useCartStore.setState({ cartItems: [item1, item2] });

    useCartStore.getState().removeCartItem(item1);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].variations?.[0].value).toBe("Blue");
  });
});

describe("useCartStore - subtotal", () => {
  test("calculates subtotal correctly for single item", () => {
    const item = createCartItem({ basePrice: 50, quantity: 2 });
    useCartStore.setState({ cartItems: [item] });

    const total = useCartStore.getState().subtotal();

    expect(total).toBe(100); // 50 * 2
  });

  test("calculates subtotal correctly for multiple items", () => {
    const item1 = createCartItem({ id: 1, price: 50, basePrice: 50, quantity: 2 });
    const item2 = createCartItem({ id: 2, price: 30, basePrice: 30, quantity: 1 });
    useCartStore.setState({ cartItems: [item1, item2] });

    const total = useCartStore.getState().subtotal();

    expect(total).toBe(130); // (50 * 2) + (30 * 1)
  });

  test("returns 0 for empty cart", () => {
    const total = useCartStore.getState().subtotal();

    expect(total).toBe(0);
  });
});

describe("useCartStore - getCartDetails", () => {
  test("returns all cart items", () => {
    const items = [
      createCartItem({ id: 1 }),
      createCartItem({ id: 2 }),
    ];
    useCartStore.setState({ cartItems: items });

    const details = useCartStore.getState().getCartDetails();

    expect(details).toHaveLength(2);
    expect(details[0].id).toBe(1);
    expect(details[1].id).toBe(2);
  });
});
