"use client";

import Head from "next/head";

const SubscribeNow = () => {
  return (
    // <div className="flex flex-col justify-center items-center pt-14 bg-gray-500 w-full">
    <div className="flex flex-col justify-center items-center pt-14 bg-white w-full">
      {/* Background Image */}
      <div
        style={{
          backgroundImage: "url('/home-header-bg.jpg')",
        }}
        className="max-w-5xl bg-gray-300 h-64 w-full rounded-lg shadow-md bg-cover bg-center"
      ></div>

      {/* Card */}
      {/* <div className="bg-transparent -mt-[15rem] shadow-md rounded-none overflow-hidden w-full max-w-[50rem] mx-auto"> */}
      <div className="bg-transparent -mt-[15rem]  overflow-hidden w-full max-w-[50rem] mx-auto">
        {/* <div className="items-center justify-between py-10 px-5  shadow-2xl rounded-lg mx-auto text-center"> */}
        <div className="items-center justify-between py-10 px-5  text-center">
          <div className="px-2 -mt-6">
            <h1 className="font-extrabold text-3xl text-gray-200 leading-loose my-3 w-full">
              Subscribe Now!
            </h1>
            <div className="h-[200px]">
              <iframe
                src="https://link.cyberizegroup.com/widget/form/sIcSJa9NAObcQ4MKFiFQ"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "5px",
                }}
                id="inline-sIcSJa9NAObcQ4MKFiFQ"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="Newsletter Subscribe"
                data-height="402"
                data-layout-iframe-id="inline-sIcSJa9NAObcQ4MKFiFQ"
                data-form-id="sIcSJa9NAObcQ4MKFiFQ"
                title="Newsletter Subscribe"
              ></iframe>
              {/* Move script to Head */}
              <Head>
                <script
                  src="https://link.cyberizegroup.com/js/form_embed.js"
                  async
                />
              </Head>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeNow;
