/**
 * @file /src/app/api/get-post-by-slug/route.ts
 * @description API route to fetch a single blog post by its slug using GraphQL.
 *              Returns detailed information about the blog post, including ID, title, date, content, categories,
 *              featured image, and author details.
 *
 * ## Features
 * - Fetches a single blog post by its slug for precise targeting.
 * - Includes the post's metadata, content, categories, featured image, and author details.
 * - Designed for dynamic rendering of single post pages in a headless CMS architecture.
 *
 * ## Query Parameters
 * - `slug` (required): The slug of the blog post to fetch (e.g., ?slug=example-post-slug).
 *
 * ## Usage
 * - Testable via browser or API tools:
 *   https://my-app.com/api/get-post-by-slug?slug=boost-your-dental-practice-with-a-professional-seo-company
 *
 * ## Notes
 * - Ensure the `NEXT_PUBLIC_WORDPRESS_API_URL` environment variable is properly configured in `.env.local`.
 * - Validates the presence of the `slug` query parameter and returns an error if missing.
 * - Graceful error handling for unexpected issues, such as invalid slugs or server errors.
 */

import { NextResponse } from "next/server";

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const GRAPHQL_QUERY = `
          query GetSinglePostBySlug($slug: ID!) {
            post(id: $slug, idType: SLUG) {
              id
              databaseId
              title
              slug
              date
              content
              categories {
                nodes {
                  name
                }
              }
              featuredImage {
                node {
                  sourceUrl
                }
              }
              author {
                node {
                  name
                }
              }
            }
          }
        `;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: 'The "slug" parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(WORDPRESS_API_URL || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { slug },
      }),
      next: {
        revalidate: 60, // Revalidate the cached data every 60 seconds
      },
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error("GraphQL Error:", data.errors || response.statusText);
      return NextResponse.json(
        {
          error: "Failed to fetch the post.",
          details: data.errors || response.statusText,
        },
        { status: 500 }
      );
    }

    if (!data.data.post) {
      return NextResponse.json(
        { error: "Post not found. Check the slug and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json(data.data.post);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
