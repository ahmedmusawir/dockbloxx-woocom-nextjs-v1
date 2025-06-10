"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"; // Or any icons you prefer

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  currentQuery: string;
  // We won't pass onPageChange directly if links update URL
  // The parent (SearchPageContent) will react to URL changes
}

const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  currentQuery,
}) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const MAX_VISIBLE_PAGES = 5; // Max number of page links to show (e.g., 1 ... 4 5 6 ... 10)

  // Helper to generate the href for pagination links
  const getPageHref = (page: number) => {
    return `/search?q=${encodeURIComponent(currentQuery)}&page=${page}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <Link key={i} href={getPageHref(i)} passHref legacyBehavior>
            <Button
              asChild
              variant={currentPage === i ? "default" : "outline"}
              size="icon"
              className={currentPage === i ? "font-bold" : ""}
            >
              <a>{i}</a>
            </Button>
          </Link>
        );
      }
    } else {
      // Logic for more complex pagination (e.g., with ellipses)
      let startPage = Math.max(
        1,
        currentPage - Math.floor(MAX_VISIBLE_PAGES / 2)
      );
      let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

      if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
      }

      if (startPage > 1) {
        pageNumbers.push(
          <Link key={1} href={getPageHref(1)} passHref legacyBehavior>
            <Button asChild variant="outline" size="icon">
              <a>1</a>
            </Button>
          </Link>
        );
        if (startPage > 2) {
          pageNumbers.push(
            <span key="start-ellipsis" className="px-2 py-1">
              ...
            </span>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <Link
            key={i}
            href={getPageHref(i)}
            passHref
            legacyBehavior
            scroll={true}
          >
            <Button
              asChild
              variant={currentPage === i ? "default" : "outline"}
              size="icon"
              className={currentPage === i ? "font-bold" : ""}
            >
              <a>{i}</a>
            </Button>
          </Link>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push(
            <span key="end-ellipsis" className="px-2 py-1">
              ...
            </span>
          );
        }
        pageNumbers.push(
          <Link
            key={totalPages}
            href={getPageHref(totalPages)}
            passHref
            legacyBehavior
          >
            <Button asChild variant="outline" size="icon">
              <a>{totalPages}</a>
            </Button>
          </Link>
        );
      }
    }
    return pageNumbers;
  };

  return (
    <nav
      aria-label="Search results pagination"
      className="mt-8 flex items-center justify-center space-x-2"
    >
      {currentPage > 1 && (
        <Link href={getPageHref(currentPage - 1)} passHref legacyBehavior>
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label="Previous page"
          >
            <a>
              <ChevronLeftIcon className="h-4 w-4" />
            </a>
          </Button>
        </Link>
      )}

      {renderPageNumbers()}

      {currentPage < totalPages && (
        <Link href={getPageHref(currentPage + 1)} passHref legacyBehavior>
          <Button asChild variant="outline" size="icon" aria-label="Next page">
            <a>
              <ChevronRightIcon className="h-4 w-4" />
            </a>
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default SearchPagination;
