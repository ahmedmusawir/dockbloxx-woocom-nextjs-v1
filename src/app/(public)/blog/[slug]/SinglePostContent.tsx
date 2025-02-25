import React from "react";
import styles from "./Single.module.scss";
import Row from "@/components/common/Row";
import Page from "@/components/common/Page";
import Head from "next/head";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types/blog";

interface Props {
  post: BlogPost;
}
const SinglePostContent = async ({ post }: Props) => {
  // If no post is found, show a 404 page
  if (!post) {
    notFound();
  }

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={`Post: ${post.title}`} />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose max-w-3xl mx-auto bg-gray-200">
          <div
            className={styles["wp-content"]}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Row>
      </Page>
    </>
  );
};

export default SinglePostContent;
