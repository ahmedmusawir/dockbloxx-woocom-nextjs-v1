import { notFound } from "next/navigation";
import SinglePostContent from "./SinglePostContent";
import {
  fetchAllPostSlugs,
  fetchSinglePostBySlug,
} from "@/services/blogServices";

// Generate static params for SSG
export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

// Single post page component
const SinglePost = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const data = await fetchSinglePostBySlug(slug);
  const post = data.post;
  // console.log("Single Post [/blog/[slug]/page.tsx]", post);

  // Handle 404 with ISR
  if (!post) {
    notFound();
  }

  return <SinglePostContent post={post} />;
};

export default SinglePost;
