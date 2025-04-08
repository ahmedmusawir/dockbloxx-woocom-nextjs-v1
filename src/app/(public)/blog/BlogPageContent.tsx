import BlogPostItems from "@/components/blog/BlogPostItems";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import { getImageUrl } from "@/lib/utils";
import { fetchBlogPosts } from "@/services/blogServices";
import Head from "next/head";
import Image from "next/image";

const BlogPageContent = async () => {
  const {
    items: initialPosts, // Simply Renaming the items var to initialPosts
    endCursor,
    hasNextPage,
  } = await fetchBlogPosts(6, null); // Fetch first 6 posts

  console.log("posts [BlogPageContent.tsx]", initialPosts);

  return (
    <div className="pb-16">
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
          alt="Dockbloxx Blog Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold">
            Our Blog
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Render the posts */}
        <BlogPostItems
          initialPosts={initialPosts}
          hasNextPage={hasNextPage}
          endCursor={endCursor}
        />
        {/* Pass props to LoadMoreButton */}
        {hasNextPage && <LoadMoreButton initialEndCursor={endCursor} />}
      </div>
    </div>
  );
};

export default BlogPageContent;
