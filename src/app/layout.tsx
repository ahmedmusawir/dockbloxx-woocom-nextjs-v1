/**
 * RootLayout: /app/layout.tsx
 *
 * This layout file is responsible for wrapping all pages within the application.
 * It sets up the ThemeProvider, global styles, and Toaster for notifications.
 * It also handles backend operations during the initial page load, such as
 * generating the ticket types JSON file.
 *
 * The `fetchAndGenerateTicketTypes` function from the services folder is invoked here
 * to ensure that the ticket types data is fetched and generated on the server side
 * before rendering any pages. This operation is cached using Next.js's revalidation
 * mechanism to prevent unnecessary API calls.
 *
 * This approach ensures a non-blocking, efficient process for handling backend
 * operations while keeping the client-side components lightweight.
 */

// src/app/layout.tsx

import { Inter } from "next/font/google";
import "./globals.scss";
import Navbar from "@/components/global/Navbar";
import Main from "@/components/common/Main";
import Footer from "@/components/global/Footer";
import CartSlide from "@/components/cart/CartSlide";
import Script from "next/script";
import { fetchTrackingScripts } from "@/services/trackingSeoServices";

const inter = Inter({ subsets: ["latin"] });

export const stripScriptWrapper = (html: string): string => {
  const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  return match ? match[1].trim() : html.trim();
};

export const stripNoscriptWrapper = (html: string): string => {
  const match = html.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/i);
  return match ? match[1].trim() : html.trim();
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { header, body, footer } = await fetchTrackingScripts();

  const headerJS = stripScriptWrapper(header);
  const bodyHtml = stripNoscriptWrapper(body);
  const footerJS = stripScriptWrapper(footer);

  // console.log("TRACKING SCRIPTS HEADER: [/app/layout.tsx]", headerJS);
  // console.log("TRACKING SCRIPTS BODY: [/app/layout.tsx]", bodyHtml);
  // console.log("ATTRIBUTION SCRIPT FOOTER: [/app/layout.tsx]", footerJS);

  return (
    <html lang="en">
      <head>
        <Script
          id="moose-tracker-head"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: headerJS }}
        />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Main className="flex flex-col">
            {children
              ? children
              : "This is a Layout container. Must have children"}
          </Main>
          <Footer />
          <CartSlide />
        </div>

        <div
          id="moose-tracker-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Coach's Attribution Script */}
        <Script
          id="coach-attribution"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: footerJS }}
        />
      </body>
    </html>
  );
}
