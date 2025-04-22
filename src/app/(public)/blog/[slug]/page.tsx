import { notFound } from "next/navigation";
import SinglePostContent from "./SinglePostContent";
import {
  fetchAllPostSlugs,
  fetchSinglePostBySlug,
} from "@/services/blogServices";
import { fetchPostSEOBySlug, fixUrl } from "@/lib/seoUtils";
import { mapYoastToMetadata } from "@/lib/yoastMapper";

// Generate static params for SSG
export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

// --------------------------------------------
// SEO Metadata for single blog post
// --------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // first wait for the proxy to resolve
  const { slug } = await params;

  const yoast = await fetchPostSEOBySlug(slug);
  return yoast ? mapYoastToMetadata(yoast) : {};
}

// --------------------------------------------
// Single post page component
// --------------------------------------------
const SinglePost = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const data = await fetchSinglePostBySlug(slug);
  const post = data.post;
  // console.log("Single Post [/blog/[slug]/page.tsx]", post);

  // Fetch SEO data and schema from WP Yoast JSON
  const yoast = await fetchPostSEOBySlug(slug);
  let schema = yoast?.schema ? JSON.stringify(yoast.schema) : null;
  if (schema) {
    schema = fixUrl(schema);
  }

  // Handle 404 with ISR
  if (!post) {
    notFound();
  }

  // return <SinglePostContent post={post} />;

  return (
    <>
      {schema && (
        <script
          id={`yoast-schema-post-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <SinglePostContent post={post} />
    </>
  );
};

export default SinglePost;
