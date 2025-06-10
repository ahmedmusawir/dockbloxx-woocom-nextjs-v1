// File: /src/app/sitemap.xml/route.ts

import { NextResponse } from "next/server";
import { fetchAllProductSlugs } from "@/services/productServices";
import { generateProductSitemapUrls } from "@/lib/utils";

export async function GET() {
  const staticUrls = `
  <url><loc>https://dockbloxx.com/</loc></url>
  <url><loc>https://dockbloxx.com/shop</loc></url>
  <url><loc>https://dockbloxx.com/category/accessories</loc></url>
  <url><loc>https://dockbloxx.com/category/deals</loc></url>
  <url><loc>https://dockbloxx.com/category/best-sellers</loc></url>
  <url><loc>https://dockbloxx.com/category/dock-essentials</loc></url>
  <url><loc>https://dockbloxx.com/category/entertainment</loc></url>
  <url><loc>https://dockbloxx.com/category/sportsman</loc></url>
  <url><loc>https://dockbloxx.com/category/water-sports</loc></url>
  <url><loc>https://dockbloxx.com/build-a-bloxx</loc></url>
  <url><loc>https://dockbloxx.com/about</loc></url>
  <url><loc>https://dockbloxx.com/blog</loc></url>
  <url><loc>https://dockbloxx.com/dealer-locator</loc></url>
  <url><loc>https://dockbloxx.com/dealer-login</loc></url>
  <url><loc>https://dockbloxx.com/how-to</loc></url>
  <url><loc>https://dockbloxx.com/contact</loc></url>
  <url><loc>https://dockbloxx.com/terms</loc></url>
  <url><loc>https://dockbloxx.com/privacy</loc></url>
  <url><loc>https://dockbloxx.com/returns</loc></url>
  <url><loc>https://dockbloxx.com/warranty</loc></url>
  `.trim();

  const productSlugs = await fetchAllProductSlugs();
  const productUrls = generateProductSitemapUrls(productSlugs);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${productUrls}
</urlset>`.trim();

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
