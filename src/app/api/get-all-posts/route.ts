/**
 * @file get-all-posts.ts
 * @description API endpoint to fetch all blog posts with pagination support using GraphQL.
 * This endpoint is designed to work seamlessly with WordPress as a headless CMS, providing post data for the frontend.
 *
 * ## Functionality
 * - Fetches paginated blog posts from the WordPress GraphQL API.
 * - Supports query variables (`first` and `after`) to manage pagination.
 * - Returns detailed information about each post, including:
 *   - `id`: Unique identifier of the post.
 *   - `title`: Title of the post.
 *   - `date`: Publication date.
 *   - `excerpt`: Short excerpt from the post content.
 *   - `content`: Full post content.
 *   - `featuredImage`: URL of the post's featured image.
 *   - `categories`: Categories associated with the post.
 *   - `author`: Information about the author, including name and description.
 * - Designed for testing without caching to verify Next.js 15's non-caching behavior.
 *
 * ## Query Variables
 * - `first`: Number of posts to fetch per request.
 * - `after`: Cursor for the next page, supporting infinite scrolling or "load more" functionality.
 *
 * ## Usage
 * - This API endpoint is intended for use in a headless frontend to dynamically display paginated blog posts.
 * - Testable via the browser by appending query parameters for pagination.
 *   Example:
 *   - Fetch the first 6 posts:
 *     https://my-app.com/api/get-all-posts?first=6
 *   - Fetch the next 6 posts using a cursor:
 *     https://my-app.com/api/get-all-posts?first=6&after=[END_CURSOR]
 * - Replace `[END_CURSOR]` with the `endCursor` value from the previous response to load subsequent pages.
 *
 * ## Future Enhancements
 * - Add support for SSG and ISR to optimize performance.
 * - Implement robust error handling and logging for production.
 *
 * ## Author
 * - The Moose
 */

import { NextResponse } from "next/server";

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const GRAPHQL_QUERY = `
  query GetBlogPosts($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        slug
        title
        date
        excerpt
        content
        featuredImage {
          node {
            sourceUrl
          }
        }
        categories {
          nodes {
            name
          }
        }
        author {
          node {
            name
            description
          }
        }
      }
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = parseInt(searchParams.get("first") || "6", 10); // Default to 6 posts per page
  const after = searchParams.get("after") || null; // Default to null for the first page

  try {
    const response = await fetch(WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { first, after },
      }),
      next: {
        revalidate: 60, // Revalidate the cached data every 60 seconds
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from GraphQL API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
