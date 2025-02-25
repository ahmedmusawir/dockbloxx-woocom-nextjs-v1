/**
 * GraphQL Query: Get Single Post by Slug
 *
 * ## Purpose
 * - Retrieve detailed information about a single blog post using its slug.
 * - Ideal for building blog post detail pages in a Next.js application.
 *
 * ## Features
 * - **Dynamic Query**: Fetches a single post using the `slug` as an identifier.
 * - **Detailed Data**:
 *   - Includes `title`, `slug`, `date`, `content`, and `categories`.
 *   - Fetches associated `featuredImage` and `author` details.
 *
 * ## Parameters
 * - `slug` (ID!): The unique slug of the post to retrieve. This is used as the `id` for the query.
 *
 * ## Example Usage
 * ```typescript
 * const query = GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG;
 * const variables = { slug: "example-post-slug" };
 * const response = await fetchGraphQL(query, variables);
 * console.log(response);
 * ```
 *
 * ## Implementation Details
 * - **GraphQL Query**: Uses `post(id: $slug, idType: SLUG)` to fetch the post.
 * - **Data Structure**:
 *   - `id` and `slug` for unique identification.
 *   - `content` for the full post body.
 *   - `categories` and `featuredImage` for metadata.
 *   - `author` for the post creator’s details.
 *
 * ## Dependencies
 * - Should be used with a GraphQL client or fetch function that supports variables.
 *
 * ## Use Case
 * - Ideal for rendering single blog post pages in SSR or SSG workflows.
 */
export const GRAPHQL_QUERY_GET_SINGLE_POST_BY_SLUG = `
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
