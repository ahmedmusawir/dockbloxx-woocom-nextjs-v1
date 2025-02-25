/**
 * LoadMoreButton Component
 * =========================
 * A reusable button for loading more paginated data. This component interacts
 * with the generic pagination Zustand store to fetch additional data and update the state.
 *
 * ## Features
 * - Dynamically fetches more items when clicked using the `after` cursor.
 * - Displays a spinner while loading.
 * - Disables or hides when there are no more pages (`hasNextPage` is false).
 *
 * ## Usage
 * - Integrate this button into pages like Blog Index or Product List for
 *   seamless "Load More" functionality.
 *
 * ## Props
 * - `endpoint`: The API endpoint for fetching data (e.g., `/api/get-all-posts`).
 * - `type`: The type of data to be fetched (e.g., `posts` or `products`).
 */

"use client";

import { usePaginationStore } from "@/store/usePaginationStore";
import { fetchBlogPosts } from "@/services/blogServices";
import { Button } from "../ui/button";
import Spinner from "./Spinner";

interface LoadMoreButtonProps {
  initialEndCursor: string | null;
}

const LoadMoreButton = ({ initialEndCursor }: LoadMoreButtonProps) => {
  const { hasNextPage, fetchNextPage, isLoading } = usePaginationStore();

  const handleLoadMore = async () => {
    await fetchNextPage((cursor) =>
      fetchBlogPosts(6, cursor || initialEndCursor)
    );
  };

  if (!hasNextPage) return null;

  return (
    <div className="text-center mt-10">
      {hasNextPage && (
        <Button
          className="w-75"
          size={"lg"}
          onClick={handleLoadMore}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner /> Loading
            </>
          ) : (
            "Load More"
          )}
        </Button>
      )}
    </div>
  );
};

export default LoadMoreButton;
