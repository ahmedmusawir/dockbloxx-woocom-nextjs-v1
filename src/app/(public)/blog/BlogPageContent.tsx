import BlogPostItems from "@/components/blog/BlogPostItems";
import LoadMoreButton from "@/components/common/LoadMoreButton";
import { fetchBlogPosts } from "@/services/blogServices";

const BlogPageContent = async () => {
  const {
    items: initialPosts, // Simply Renaming the items var to initialPosts
    endCursor,
    hasNextPage,
  } = await fetchBlogPosts(6, null); // Fetch first 6 posts

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            From the blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600">
            Learn how to grow your business with our expert advice.
          </p>
        </div>
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
