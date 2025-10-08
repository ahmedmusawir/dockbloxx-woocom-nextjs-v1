/**
 * Unit tests for utils.ts
 * Tests utility functions for image handling, price formatting, date formatting, and product categorization.
 */

import {
  getFeaturedImage,
  cleanPriceHtml,
  formatDateString,
  detectProductCategory,
  getApiUrl,
} from "@/lib/utils";
import { Product, ProductVariation } from "@/types/product";

describe("getFeaturedImage", () => {
  test("returns first image src when available", () => {
    const images = [
      { id: 123, src: "https://example.com/image1.jpg", alt: "Product" },
      { id: 124, src: "https://example.com/image2.jpg", alt: "Product 2" },
    ];

    const result = getFeaturedImage(images as Product["images"]);

    expect(result).toBe("https://example.com/image1.jpg");
  });

  test("skips youtube_video and returns second image", () => {
    const images = [
      { id: "youtube_video", src: "https://youtube.com/video", alt: "Video" },
      { id: 124, src: "https://example.com/image2.jpg", alt: "Product" },
    ];

    const result = getFeaturedImage(images as any);

    expect(result).toBe("https://example.com/image2.jpg");
  });

  test("returns placeholder when images array is empty", () => {
    const images: any[] = [];

    const result = getFeaturedImage(images);

    expect(result).toBe("/placeholder.jpg");
  });

  test("returns placeholder when images is undefined", () => {
    const result = getFeaturedImage(undefined as any);

    expect(result).toBe("/placeholder.jpg");
  });

  test("returns placeholder when youtube_video is only image", () => {
    const images = [
      { id: "youtube_video", src: "https://youtube.com/video", alt: "Video" },
    ];

    const result = getFeaturedImage(images as any);

    expect(result).toBe("/placeholder.jpg");
  });
});

describe("cleanPriceHtml", () => {
  test("removes screen-reader-text spans", () => {
    const html = '<span class="screen-reader-text">Original price was: </span>$119.00';

    const result = cleanPriceHtml(html);

    expect(result).toBe("$119.00");
    expect(result).not.toContain("screen-reader-text");
  });

  test("removes aria-hidden attributes", () => {
    const html = '<del aria-hidden="true">$119.00</del>';

    const result = cleanPriceHtml(html);

    expect(result).toBe("<del>$119.00</del>");
    expect(result).not.toContain("aria-hidden");
  });

  test("removes both screen-reader-text and aria-hidden", () => {
    const html =
      '<span class="screen-reader-text">Original: </span><del aria-hidden="true">$119.00</del>';

    const result = cleanPriceHtml(html);

    expect(result).toBe("<del>$119.00</del>");
    expect(result).not.toContain("screen-reader-text");
    expect(result).not.toContain("aria-hidden");
  });

  test("returns unchanged string if no matches", () => {
    const html = "<span>$119.00</span>";

    const result = cleanPriceHtml(html);

    expect(result).toBe("<span>$119.00</span>");
  });
});

describe("formatDateString", () => {
  test("formats valid ISO date string correctly", () => {
    const result = formatDateString("2024-10-21T07:11:23");

    expect(result).toBe("Oct 21, 2024");
  });

  test("formats date without time correctly", () => {
    const result = formatDateString("2024-12-25");

    expect(result).toBe("Dec 25, 2024");
  });

  test("returns 'Invalid Date' for invalid date string", () => {
    const result = formatDateString("not-a-date");

    expect(result).toBe("Invalid Date");
  });

  test("returns 'Invalid Date' for empty string", () => {
    const result = formatDateString("");

    expect(result).toBe("Invalid Date");
  });

  test("handles different year correctly", () => {
    const result = formatDateString("2025-01-01");

    expect(result).toBe("Jan 01, 2025");
  });
});

describe("detectProductCategory", () => {
  test("detects giftcard by slug", () => {
    const product = {
      name: "Gift Card",
      slug: "gift-card",
      variations: [],
      attributes: [],
      price: 50,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("giftcard");
  });

  test("detects giftcard by name (case insensitive)", () => {
    const product = {
      name: "Gift Card",
      slug: "some-slug",
      variations: [],
      attributes: [],
      price: 50,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("giftcard");
  });

  test("detects simple product with no variations", () => {
    const product = {
      name: "Simple Product",
      slug: "simple-product",
      variations: [],
      attributes: [],
      price: 100,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("simple");
    expect(result.price).toBe(100);
  });

  test("detects single-variation product", () => {
    const product = {
      name: "T-Shirt",
      slug: "t-shirt",
      variations: [
        {
          id: 1,
          attributes: [{ name: "Color", option: "Red" }],
        } as ProductVariation,
      ],
      attributes: [{ name: "Color", options: ["Red", "Blue", "Green"] }],
      price: 25,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("single-variation");
    expect(result.defaultSelections).toEqual({ Color: "Red" });
  });

  test("detects bloxx category with Pole Shape and Pole Size", () => {
    const product = {
      name: "Dog Bloxx",
      slug: "dog-bloxx",
      variations: [
        {
          id: 1,
          attributes: [
            { name: "Pole Shape", option: "Square" },
            { name: "Pole Size", option: '2"' },
            { name: "Version", option: "Single Sided" },
          ],
        } as ProductVariation,
      ],
      attributes: [
        { name: "Pole Shape", options: ["Square", "Octagon"] },
        { name: "Pole Size", options: ['2"', '4"'] },
        { name: "Version", options: ["Single Sided", "Double Sided"] },
      ],
      price: 119,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("bloxx");
    expect(result.defaultSelections).toEqual({
      "Pole Shape": "Square",
      "Pole Size": '2"',
      Version: "Single Sided",
    });
    expect(result.filtering).toEqual({
      "Pole Shape": ["Pole Size", "Version"],
    });
  });

  test("detects complex-variation for multi-attribute products", () => {
    const product = {
      name: "Complex Product",
      slug: "complex-product",
      variations: [
        {
          id: 1,
          attributes: [
            { name: "Size", option: "M" },
            { name: "Color", option: "Red" },
          ],
        } as ProductVariation,
      ],
      attributes: [
        { name: "Size", options: ["S", "M", "L"] },
        { name: "Color", options: ["Red", "Blue"] },
      ],
      price: 50,
    };

    const result = detectProductCategory(product);

    expect(result.type).toBe("complex-variation");
    expect(result.defaultSelections).toEqual({
      Size: "S",
      Color: "Red",
    });
  });
});

describe("getApiUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;

  beforeEach(() => {
    // Set a test backend URL
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
  });

  afterEach(() => {
    // Restore original env
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

  test("constructs URL with leading slash", () => {
    const result = getApiUrl("/products");

    expect(result).toBe("https://api.example.com/products");
  });

  test("constructs URL without leading slash", () => {
    const result = getApiUrl("products");

    expect(result).toBe("https://api.example.com/products");
  });

  test("throws error if NEXT_PUBLIC_BACKEND_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;

    expect(() => getApiUrl("/products")).toThrow(
      "NEXT_PUBLIC_BACKEND_URL is missing."
    );
  });
});
