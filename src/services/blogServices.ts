const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
/**
 * Import: GraphQL Query for Fetching a Single Post by Slug
 *
 * ## Purpose
 * - Imports the GraphQL query defined in the `getSinglePostBySlug` file.
 * - The query retrieves details of a single blog post based on its unique slug.
 *
 * ## Use Case
 * - Used in service functions or API endpoints to fetch post data.
 * - Ensures separation of concerns by centralizing query definitions in a dedicated `graphql` folder.
 *
 * ## Benefits
 * - Improves maintainability: Queries are stored in reusable, well-organized files.
 * - Enhances scalability: Centralized query definitions can be updated without modifying multiple files.
 *
 * ## Path
 * - Located in `/graphql/queries/posts/getSinglePostBySlug.ts`.
 *
 * ## Example
 * ```typescript
 * import { GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG } from "@/graphql/queries/posts/getSinglePostBySlug";
 * ```
 */
import { GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG } from "@/graphql/queries/posts/getSinglePostBySlug";

interface PostSlugResponse {
  data: {
    posts: {
      nodes: { slug: string }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: Array<{ message: string }>;
}
// Service function to fetch all post slugs directly
export const fetchAllPostSlugs = async (): Promise<string[]> => {
  const slugs: string[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const response: PostSlugResponse = await fetch(WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY_GET_ALL_POST_SLUGS,
        variables: {
          first: 100,
          after: endCursor,
        },
      }),
    }).then((res) => res.json());

    // Check for GraphQL errors
    if (response.errors) {
      console.error("GraphQL Errors:", response.errors);
      throw new Error("Failed to fetch post slugs");
    }

    const { nodes, pageInfo } = response.data.posts;

    // Add the current batch of slugs to the main array
    slugs.push(...nodes.map((node) => node.slug));

    // Update pagination info
    hasNextPage = pageInfo.hasNextPage;
    endCursor = pageInfo.endCursor;
  }

  return slugs;
};

// ---------------- end of fetchAllPostSlugs ----------------------------------

/**
 * Fetch Blog Posts with Pagination
 *
 * ## Purpose
 * - Retrieve paginated blog posts from the WordPress GraphQL API.
 * - Supports infinite scrolling or "Load More" functionality by fetching posts page by page.
 *
 * ## Features
 * - **Pagination Support**: Fetches posts in batches using `first` and `after` variables.
 * - **Revalidation**: Includes ISR (Incremental Static Regeneration) with a 60-second cache duration.
 * - **Flexible Parameters**:
 *   - `first`: Number of posts to fetch in one request.
 *   - `after`: Cursor for fetching posts after a specific point.
 *
 * ## Parameters
 * - `first` (number): Number of posts to fetch in the current request.
 * - `after` (string | null): Cursor for the next page of posts. Use `null` for the first page.
 *
 * ## Return Value
 * - A Promise that resolves to an object containing:
 *   - `items` (BlogPost[]): Array of blog posts with details such as `title`, `slug`, `author`, etc.
 *   - `hasNextPage` (boolean): Indicates if more posts are available.
 *   - `endCursor` (string | null): Cursor for fetching the next page.
 *
 * ## Example Usage
 * ```typescript
 * const { items, hasNextPage, endCursor } = await fetchBlogPosts(10, null);
 * console.log(items); // Output: [{ id: "1", title: "Post 1", ... }, ...]
 * ```
 *
 * ## Implementation Details
 * - **GraphQL Query**: Uses `posts(first: Int!, after: String)` to fetch paginated data.
 * - **Caching**: Adds a `revalidate` option to cache results for 60 seconds, improving performance.
 * - **Error Handling**: Throws an error if the API request fails or the response is invalid.
 *
 * ## Dependencies
 * - Requires `NEXT_PUBLIC_WORDPRESS_API_URL` environment variable.
 * - GraphQL query is imported from `/graphql/queries/posts/getAllPosts.ts`.
 *
 * ## Use Case
 * - Ideal for server-side rendering (SSR) or client-side data fetching in Next.js blog pages.
 */
import { GRAPHQL_QUERY_GET_ALL_POSTS } from "@/graphql/queries/posts/getAllPosts";
import { BlogPost } from "@/types/blog";

interface BlogPostsResponse {
  items: BlogPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}
export const fetchBlogPosts = async (
  first: number,
  after: string | null
): Promise<BlogPostsResponse> => {
  const response = await fetch(WORDPRESS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY_GET_ALL_POSTS,
      variables: { first, after },
    }),
    next: {
      revalidate: 60, // Revalidate the cached data every 60 seconds
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
  }

  const result = await response.json();

  return {
    items: result?.data?.posts?.nodes || [],
    hasNextPage: result?.data?.posts?.pageInfo?.hasNextPage || false,
    endCursor: result?.data?.posts?.pageInfo?.endCursor || null,
  };
};

// --------------------------- end of fetchBlogPosts ----------------------------

/**
 * Fetch Single Post by Slug from WordPress GraphQL API
 *
 * ## Purpose
 * - Retrieve a single blog post using its unique slug.
 * - Fetches detailed post data, including metadata and associated relationships.
 *
 * ## Features
 * - **Dynamic Query**: Queries the WordPress GraphQL API with the provided slug.
 * - **Comprehensive Data**:
 *   - Post title, content, slug, and publication date.
 *   - Associated categories, featured image, and author information.
 * - **ISR Support**: Includes incremental static regeneration (ISR) with a 60-second revalidation interval.
 *
 * ## Parameters
 * - `slug` (string | null): The unique identifier (slug) of the post. Must not be null.
 *
 * ## Return Value
 * - A Promise resolving to an object containing:
 *   - `post`: The blog post data conforming to the `BlogPost` interface.
 *   - If no post is found, `post` will be `null`.
 *
 * ## Example Usage
 * ```typescript
 * const post = await fetchSinglePostBySlug("example-post-slug");
 * console.log(post);
 * ```
 *
 * ## Implementation Details
 * - **GraphQL Query**: Uses the `GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG` query.
 * - **Data Structure**:
 *   - Post details like `id`, `title`, `slug`, and `content`.
 *   - Metadata such as `categories` and `featuredImage`.
 *   - Author information including the name.
 * - **Revalidation**: Sets a 60-second cache revalidation to improve performance and freshness.
 *
 * ## Dependencies
 * - Requires `WORDPRESS_API_URL` environment variable for the WordPress GraphQL endpoint.
 *
 * ## Error Handling
 * - Throws an error if the API request fails or the response is not `ok`.
 *
 * ## Use Case
 * - Ideal for rendering single blog post pages in Next.js SSR or ISR workflows.
 */
import { GRAPHQL_QUERY_GET_ALL_POST_SLUGS } from "@/graphql/queries/posts/getAllPostSlugs";

interface SinglePostRespone {
  post: BlogPost;
}

export const fetchSinglePostBySlug = async (
  slug: string | null
): Promise<SinglePostRespone> => {
  const response = await fetch(WORDPRESS_API_URL || "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG,
      variables: { slug },
    }),
    next: {
      revalidate: 60, // Revalidate the cached data every 60 seconds
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch single post by slug: ${response.statusText}`
    );
  }

  const result = await response.json();

  return {
    post: result?.data?.post || null,
  };
};

// --------------------------- end of fetchSinglePostBySlug ----------------------------
