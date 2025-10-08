/**
 * Component tests for ApplyCoupon.tsx
 * Tests the coupon input UI: validation, apply/remove, error messages.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ApplyCoupon from "@/components/checkout/right-pane/ApplyCoupon";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { fetchCouponByCode } from "@/services/checkoutServices";
import { Coupon } from "@/types/coupon";

// Set required environment variables
process.env.NEXT_PUBLIC_BACKEND_URL = "https://test-api.example.com";

// Mock the services
jest.mock("@/services/checkoutServices");
jest.mock("@/hooks/useCouponTracking", () => ({
  useCouponTracking: () => ({
    trackApplyCoupon: jest.fn(),
  }),
}));

// Helper to create a test coupon
function createCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    code: "TEST10",
    description: "Test coupon",
    discount_type: "percent",
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
    ...overrides,
  };
}

describe("ApplyCoupon Component", () => {
  beforeEach(() => {
    // Reset checkout store
    useCheckoutStore.setState({
      checkoutData: {
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
        cartItems: [],
        coupon: null,
        subtotal: 100,
        discountTotal: 0,
        taxTotal: 0,
        total: 110,
        customerNote: "",
      },
      enableRegistration: false,
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  test("renders coupon input field when no coupon applied", () => {
    render(<ApplyCoupon />);

    expect(screen.getByPlaceholderText("Enter coupon code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  test("shows error when applying empty coupon code", async () => {
    render(<ApplyCoupon />);

    const applyButton = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a coupon code.")).toBeInTheDocument();
    });
  });

  test("applies valid coupon successfully", async () => {
    const mockCoupon = createCoupon({ code: "SAVE10" });
    (fetchCouponByCode as jest.Mock).mockResolvedValue(mockCoupon);

    render(<ApplyCoupon />);

    const input = screen.getByPlaceholderText("Enter coupon code");
    const applyButton = screen.getByRole("button", { name: /apply/i });

    // Type coupon code
    fireEvent.change(input, { target: { value: "SAVE10" } });
    fireEvent.click(applyButton);

    // Wait for coupon to be applied
    await waitFor(() => {
      expect(screen.getByText(/Coupon Applied: SAVE10/i)).toBeInTheDocument();
    });

    // Input should be hidden, remove button should appear
    expect(screen.queryByPlaceholderText("Enter coupon code")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  test("shows error for invalid coupon", async () => {
    (fetchCouponByCode as jest.Mock).mockResolvedValue(null);

    render(<ApplyCoupon />);

    const input = screen.getByPlaceholderText("Enter coupon code");
    const applyButton = screen.getByRole("button", { name: /apply/i });

    fireEvent.change(input, { target: { value: "INVALID" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid or expired coupon.")).toBeInTheDocument();
    });
  });

  test("shows error when email is missing", async () => {
    // Set checkout data with no email
    useCheckoutStore.setState({
      checkoutData: {
        ...useCheckoutStore.getState().checkoutData,
        billing: {
          ...useCheckoutStore.getState().checkoutData.billing,
          email: "",
        },
      },
    });

    const mockCoupon = createCoupon({ code: "TEST10" });
    (fetchCouponByCode as jest.Mock).mockResolvedValue(mockCoupon);

    render(<ApplyCoupon />);

    const input = screen.getByPlaceholderText("Enter coupon code");
    const applyButton = screen.getByRole("button", { name: /apply/i });

    fireEvent.change(input, { target: { value: "TEST10" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
  });

  test("removes coupon when remove button is clicked", async () => {
    const mockCoupon = createCoupon({ code: "SAVE10" });
    
    // Set coupon as already applied
    useCheckoutStore.setState({
      checkoutData: {
        ...useCheckoutStore.getState().checkoutData,
        coupon: mockCoupon,
      },
    });

    render(<ApplyCoupon />);

    // Coupon should be displayed
    expect(screen.getByText(/Coupon Applied: SAVE10/i)).toBeInTheDocument();

    // Click remove button
    const removeButton = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeButton);

    // Coupon should be removed, input should reappear
    await waitFor(() => {
      expect(screen.queryByText(/Coupon Applied:/i)).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter coupon code")).toBeInTheDocument();
    });
  });

  test("shows loading state while applying coupon", async () => {
    const mockCoupon = createCoupon({ code: "SAVE10" });
    (fetchCouponByCode as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCoupon), 100))
    );

    render(<ApplyCoupon />);

    const input = screen.getByPlaceholderText("Enter coupon code");
    const applyButton = screen.getByRole("button", { name: /apply/i });

    fireEvent.change(input, { target: { value: "SAVE10" } });
    fireEvent.click(applyButton);

    // Should show loading state
    expect(screen.getByRole("button", { name: /applying.../i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /applying.../i })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/Coupon Applied: SAVE10/i)).toBeInTheDocument();
    });
  });

  test("clears input field after successful application", async () => {
    const mockCoupon = createCoupon({ code: "SAVE10" });
    (fetchCouponByCode as jest.Mock).mockResolvedValue(mockCoupon);

    render(<ApplyCoupon />);

    const input = screen.getByPlaceholderText("Enter coupon code") as HTMLInputElement;
    const applyButton = screen.getByRole("button", { name: /apply/i });

    fireEvent.change(input, { target: { value: "SAVE10" } });
    expect(input.value).toBe("SAVE10");

    fireEvent.click(applyButton);

    // After successful application, input should be hidden (coupon applied state)
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Enter coupon code")).not.toBeInTheDocument();
    });
  });
});
