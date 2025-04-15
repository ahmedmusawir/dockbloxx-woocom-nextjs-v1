import Head from "next/head";
import React from "react";

const page = () => {
  return (
    <div>
      <h1 className="text-center mt-12">The Return Authorization Form</h1>
      <div className="h-[800px]">
        <iframe
          src="https://link.cyberizegroup.com/widget/form/e14w3jBY1DcbJDWt4lwd"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "3px",
          }}
          id="inline-e14w3jBY1DcbJDWt4lwd"
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Return Authorization Form"
          data-height="658"
          data-layout-iframe-id="inline-e14w3jBY1DcbJDWt4lwd"
          data-form-id="e14w3jBY1DcbJDWt4lwd"
          title="Return Authorization Form"
        ></iframe>
        {/* <script src="https://link.cyberizegroup.com/js/form_embed.js"></script> */}
      </div>
      {/* Move script to Head */}
      <Head>
        <script src="https://link.cyberizegroup.com/js/form_embed.js" async />
      </Head>
    </div>
  );
};

export default page;
