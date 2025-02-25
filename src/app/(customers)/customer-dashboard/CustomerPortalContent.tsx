import BackButton from "@/components/common/BackButton";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const CustomerPortalContent = () => {
  return (
    <>
      <Head>
        <title>CustomerPortalContent</title>
        <meta name="description" content="This is the template page" />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose">
          <h1>This is the Customer Portal Dashboard Page</h1>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolores
            molestias corrupti eius possimus iure, reiciendis reprehenderit fuga
            officia accusantium tempora quos, beatae harum quia officiis, ut
            porro natus sequi veniam.
          </p>
        </Row>
      </Page>
    </>
  );
};

export default CustomerPortalContent;
