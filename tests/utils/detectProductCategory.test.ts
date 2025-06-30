import { detectProductCategory } from "@/lib/utils";

describe("detectProductCategory", () => {
  it("should return type 'giftcard' for a product with slug 'gift-card'", () => {
    const fakeProduct = {
      variations: [],
      attributes: [],
      price: 123,
      slug: "gift-card",
      name: "Gift Card",
    };

    const category = detectProductCategory(fakeProduct as any);
    expect(category.type).toBe("giftcard");
  });
});
