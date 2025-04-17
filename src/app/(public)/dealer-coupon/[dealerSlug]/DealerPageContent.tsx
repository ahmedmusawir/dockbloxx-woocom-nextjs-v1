import { DealerCoupon } from "@/types/dealer-coupon";
import DealerCTA from "@/components/dealer/DealerCTA";
import DealerCouponClientBlock from "@/components/dealer/DealerCouponClientBlock";
import Head from "next/head";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Page from "@/components/common/Page";

interface Props {
  data: DealerCoupon;
}

const DealerPageContent = ({ data }: Props) => {
  // console.log("dealer data [DealerPageContent]", data);
  return (
    <>
      <Head>
        <title>Build-a-Bloxx - Custom Dock Accessories</title>
        <meta
          name="description"
          content="Custom dock accessories and solutions - Build your perfect dock setup with DockBloxx"
        />
      </Head>

      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] w-full">
        <Image
          src={getImageUrl("/wp-content/uploads/header-img.jpg")}
          alt="Custom Services Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            {/* This is a Dockbloxx Page Template */}
          </h1>
        </div>
      </div>
      <Page className="-mt-[15rem] relative" FULL={false}>
        <DealerCouponClientBlock data={data} />
      </Page>
      {/* <DealerCTA data={data} /> */}
    </>
  );
};

export default DealerPageContent;
