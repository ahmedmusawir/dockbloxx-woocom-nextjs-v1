import { DealerCoupon } from "@/types/dealer-coupon";
import DealerCTA from "@/components/dealer/DealerCTA";
import DealerCouponClientBlock from "@/components/dealer/DealerCouponClientBlock";

interface Props {
  data: DealerCoupon;
}

const DealerPageContent = ({ data }: Props) => {
  // console.log("dealer data [DealerPageContent]", data);
  return (
    <div className="bg-white">
      <DealerCouponClientBlock />
      <DealerCTA data={data} />
    </div>
  );
};

export default DealerPageContent;
