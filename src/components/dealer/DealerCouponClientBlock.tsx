"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchCouponByCode } from "@/services/checkoutServices";
import { Coupon } from "@/types/coupon";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import SpinnerLarge from "../common/SpinnerLarge";

const DealerCouponClientBlock = () => {
  const searchParams = useSearchParams();
  const couponCode = searchParams.get("coupon") || "";

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const applyCouponToStore = useCheckoutStore((state) => state.applyCoupon);

  if (status === "idle" && !couponCode) {
    return (
      <div className="mx-auto max-w-7xl px-10 py-24 border-4 text-center my-5">
        <h2 className="text-3xl font-semibold text-orange-500">
          Missing coupon code.
        </h2>
      </div>
    );
  }

  useEffect(() => {
    const applyCouponFromURL = async () => {
      if (!couponCode) return;
      setStatus("loading");
      const coupon = await fetchCouponByCode(couponCode);
      if (coupon) {
        applyCouponToStore(coupon);
        setAppliedCoupon(coupon);
        setStatus("success");
      } else {
        setStatus("error");
      }
    };

    applyCouponFromURL();
  }, [couponCode, applyCouponToStore]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-10 py-24 border-4 text-center">
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Validating coupon...
        </h2>
        <SpinnerLarge />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-7xl px-10 py-24 border-4 text-center my-5">
        <h2 className="text-3xl font-semibold text-red-500">
          Invalid or expired coupon.
        </h2>
      </div>
    );
  }

  if (status !== "success" || !appliedCoupon) return null;

  return (
    <div className="mx-auto max-w-7xl px-10 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8  border-4 my-5">
      <section>
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl mb-12">
          Your Coupon is Ready!
        </h2>
        <Link
          href="/shop"
          className="rounded-none bg-blue-600 px-12 py-4 text-xl font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Happy Shopping
        </Link>
      </section>
      <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
        <div className="mt-2 flex items-center border border-lime-300 p-5 rounded-none bg-lime-300">
          <span className="text-xl font-medium text-gray-900">
            Coupon Applied: {appliedCoupon.code}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DealerCouponClientBlock;
