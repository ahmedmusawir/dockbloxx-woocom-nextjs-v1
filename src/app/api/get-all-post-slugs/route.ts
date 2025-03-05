/**
 * API Endpoint: Get All Post Slugs
 *
 * ## Purpose
 * - Fetches all slugs from WordPress using GraphQL.
 * - Designed for generating static paths dynamically (e.g., for SSG).
 *
 * ## Details
 * - Method: GET
 * - Route: `/api/get-all-post-slugs`
 * - Output: Array of post slugs for SSG or other needs.
 *
 * ## Usage Example
 * - Test via browser: `/api/get-all-post-slugs`
 * - Use in `generateStaticParams` to dynamically generate pages.
 *
 * ## Query Variables
 * - `first`: Number of slugs to fetch (default: 100).
 */

import { NextResponse } from "next/server";

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;
const GRAPHQL_QUERY = `
  query GetAllSlugs($first: Int!) {
    posts(first: $first) {
      nodes {
        slug
      }
    }
  }
`;

export async function GET() {
  try {
    // Set the fetch variables
    const variables = { first: 100 };

    // Make the GraphQL request
    const response = await fetch(WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables,
      }),
      next: {
        revalidate: 300, // Revalidate cache every 60 seconds
      },
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      console.error("GraphQL Error:", data.errors || response.statusText);
      return NextResponse.json(
        {
          error: "Failed to fetch slugs.",
          details: data.errors || response.statusText,
        },
        { status: 500 }
      );
    }

    const slugs = data.data.posts.nodes.map(
      (node: { slug: string }) => node.slug
    );

    return NextResponse.json(slugs, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
