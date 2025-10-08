/**
 * Component tests for OrderDetailsDesktop.tsx
 * Tests the order summary display: subtotal, shipping, discount, total.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import OrderDetailsDesktop from "@/components/checkout/right-pane/OrderDetailsDesktop";
import { CheckoutData } from "@/types/checkout";
import { CartItem } from "@/types/cart";

// Mock ApplyCoupon component
jest.mock("@/components/checkout/right-pane/ApplyCoupon", () => {
  return function MockApplyCoupon() {
    return <div data-testid="apply-coupon">Apply Coupon Component</div>;
  };
});

// Mock CheckoutCartItems component
jest.mock("@/components/checkout/right-pane/CheckoutCartItems", () => {
  return function MockCheckoutCartItems({ cartData }: { cartData: CartItem[] }) {
    return (
      <div data-testid="cart-items">
        {cartData.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    );
  };
});

describe("OrderDetailsDesktop Component", () => {
  const mockCartItem: CartItem = {
    id: 123,
    name: "Test Product",
    slug: "test-product",
    price: 50,
    quantity: 2,
    image: "test.jpg",
    categories: [],
    basePrice: 50,
    variations: [],
  };

  const mockCheckoutData: CheckoutData = {
    billing: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 street",
      address_2: "",
      city: "atlanta",
      state: "GA",
      postcode: "30004",
      country: "US",
      email: "test@example.com",
      phone: "4042181998",
    },
    shipping: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 street",
      address_2: "",
      city: "atlanta",
      state: "GA",
      postcode: "30004",
      country: "US",
      email: "test@example.com",
      phone: "4042181998",
    },
    paymentMethod: "stripe",
    shippingMethod: "flat_rate",
    shippingCost: 10,
    cartItems: [mockCartItem],
    coupon: null,
    subtotal: 100,
    discountTotal: 0,
    taxTotal: 0,
    total: 110,
    customerNote: "",
  };

  const mockCartSubtotal = jest.fn(() => 100);
  const mockEditInCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders order summary heading", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByText("Order summary")).toBeInTheDocument();
  });

  test("displays subtotal correctly", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
  });

  test("displays shipping cost correctly", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
  });

  test("displays total correctly", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$110.00")).toBeInTheDocument();
  });

  test("displays discount when coupon is applied", () => {
    const dataWithCoupon = {
      ...mockCheckoutData,
      coupon: {
        id: 1,
        code: "SAVE10",
        description: "10% off",
        discount_type: "percent" as const,
        discount_value: 10,
        free_shipping: false,
        min_spend: "0",
        max_spend: "0",
        products_included: [],
        products_excluded: [],
        categories_included: [],
        categories_excluded: [],
        usage_limit: null,
        usage_count: null,
        usage_limit_per_user: null,
        used_by: [],
        expires_on: "",
        meta_data: [],
      },
      discountTotal: 10,
    };

    render(
      <OrderDetailsDesktop
        checkoutData={dataWithCoupon}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={100}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByText(/Coupon Applied \(SAVE10\):/i)).toBeInTheDocument();
    expect(screen.getByText("-$10.00")).toBeInTheDocument();
    expect(screen.getByText("10% off")).toBeInTheDocument();
  });

  test("does not display discount when no coupon applied", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.queryByText(/Coupon Applied/i)).not.toBeInTheDocument();
  });

  test("calls editInCart when Edit Cart button is clicked", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    const editButton = screen.getByRole("button", { name: /edit cart/i });
    fireEvent.click(editButton);

    expect(mockEditInCart).toHaveBeenCalledTimes(1);
  });

  test("displays coupon message when provided", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
        couponMessage="Subtotal changed, coupon removed"
      />
    );

    expect(screen.getByText("Subtotal changed, coupon removed")).toBeInTheDocument();
  });

  test("renders ApplyCoupon component", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByTestId("apply-coupon")).toBeInTheDocument();
  });

  test("renders cart items", () => {
    render(
      <OrderDetailsDesktop
        checkoutData={mockCheckoutData}
        cartSubtotal={mockCartSubtotal}
        shipping={10}
        total={110}
        editInCart={mockEditInCart}
      />
    );

    expect(screen.getByTestId("cart-items")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });
});
