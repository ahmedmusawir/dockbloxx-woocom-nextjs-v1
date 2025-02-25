/**
 * GraphQL Query: Get All Post Slugs
 *
 * ## Purpose
 * - Retrieve all post slugs from the WordPress GraphQL API for use in static site generation (SSG) or other purposes.
 * - Supports pagination to handle large datasets efficiently.
 *
 * ## Features
 * - **Paginated Fetching**:
 *   - Uses `first` to specify the number of posts to retrieve per request.
 *   - Utilizes `after` to fetch the next page of results, ensuring scalability.
 * - **Lightweight Response**:
 *   - Only fetches the `slug` field for each post.
 *   - Includes `pageInfo` for managing pagination efficiently.
 *
 * ## Parameters (Variables)
 * - `first` (Int): Number of posts to retrieve per request.
 * - `after` (String, optional): Cursor for fetching the next page of results. Use `null` for the initial request.
 *
 * ## Return Value
 * - The query returns an object with the following structure:
 *   - `nodes`: Array of objects, each containing:
 *     - `slug`: The unique slug of the post.
 *   - `pageInfo`:
 *     - `hasNextPage` (boolean): Indicates if more pages are available.
 *     - `endCursor` (string | null): The cursor for the next page, or `null` if there are no more pages.
 *
 * ## Example Usage
 * ```graphql
 * query GetAllPostSlugs($first: Int!, $after: String) {
 *   posts(first: $first, after: $after) {
 *     nodes {
 *       slug
 *     }
 *     pageInfo {
 *       hasNextPage
 *       endCursor
 *     }
 *   }
 * }
 * ```
 *
 * ## Use Case
 * - Ideal for SSG workflows in Next.js to generate static parameters for dynamic routes.
 * - Can be used to pre-fetch all post slugs during build time for a blog or e-commerce platform.
 *
 * ## Implementation Details
 * - The query iterates through pages of results using `pageInfo.hasNextPage` and `pageInfo.endCursor`.
 * - Adjust `first` to optimize API usage and performance based on the dataset size.
 */
export const GRAPHQL_QUERY_GET_ALL_POST_SLUGS = `
          query GetAllPostSlugs($first: Int!, $after: String) {
            posts(first: $first, after: $after) {
              nodes {
                slug
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `;
