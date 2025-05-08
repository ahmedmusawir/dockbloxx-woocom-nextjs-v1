import { Coupon } from "@/types/coupon";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { trackEvent } from "@/lib/analytics";

export const useCouponTracking = () => {
  const { checkoutData } = useCheckoutStore();

  const trackApplyCoupon = (coupon: Coupon) => {
    trackEvent({
      event: "apply_coupon",
      coupon_code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      user_email: checkoutData.billing?.email || "guest",
    });
  };

  return { trackApplyCoupon };
};
