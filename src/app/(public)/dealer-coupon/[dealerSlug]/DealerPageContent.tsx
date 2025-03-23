import Link from "next/link";
import DealerCTA from "./DealerCTA";
import { DealerCoupon } from "@/types/dealer-coupon";

interface Props {
  data: DealerCoupon;
}

const DealerPageContent = ({ data }: Props) => {
  // console.log("dealer data [DealerPageContent]", data);
  return (
    <div className="bg-white">
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
              Coupon Applied: FREE2025
            </span>
          </div>
        </div>
      </div>
      <DealerCTA data={data} />
    </div>
  );
};

export default DealerPageContent;
