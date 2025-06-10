"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "@/lib/utils";
import { MobileNavItem } from "./MobileNavItem";

interface MobileNavOverlayProps {
  onClose: () => void;
}

export default function MobileNavOverlay({ onClose }: MobileNavOverlayProps) {
  return (
    <div
      className="
        fixed
        top-0
        left-0
        w-full
        h-screen
        bg-white
        z-50
        overflow-y-auto
      "
    >
      {/* Header (Logo + Close Button) */}
      <div className="flex items-center justify-between p-4 border-b-4 border-gray-200">
        {/* Logo */}
        <Link href="/" onClick={onClose} className="flex items-center">
          <Image
            src={getImageUrl("/wp-content/uploads/Logo@2x.png")}
            alt="DockBloxx"
            width={280}
            height={80}
            className="h-auto w-[280px]"
          />
        </Link>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-blue-600 hover:text-blue-800"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="pt-6 pb-8">
        <nav className="flex flex-col space-y-4 text-xl font-bold pl-[100px]">
          <MobileNavItem href="/shop" onClose={onClose}>
            SHOP ALL
          </MobileNavItem>
          <MobileNavItem href="/category/accessories" onClose={onClose}>
            ACCESSORIES
          </MobileNavItem>
          <MobileNavItem href="/build-a-bloxx" onClose={onClose}>
            BUILD A BLOXX
          </MobileNavItem>
          <MobileNavItem href="/category/deals" onClose={onClose}>
            DEALS
          </MobileNavItem>
          {/* <MobileNavItem href="/shop/gift-card" onClose={onClose}>
            GIFT CARDS
          </MobileNavItem> */}
          <MobileNavItem
            href="https://www.facebook.com/DockBloxx/reviews"
            onClose={onClose}
            isExternal
          >
            REVIEW
          </MobileNavItem>
        </nav>

        <hr className="my-6 border-2 border-gray-300 mx-4" />

        {/* Secondary Nav */}
        <nav className="flex flex-col space-y-3 text-base font-normal pl-[100px]">
          <MobileNavItem href="/search" onClose={onClose}>
            Search Products
          </MobileNavItem>
          <MobileNavItem href="/about" onClose={onClose}>
            Our Story
          </MobileNavItem>
          <MobileNavItem href="/blog" onClose={onClose}>
            Blog
          </MobileNavItem>
          <MobileNavItem href="/dealer-locator" onClose={onClose}>
            Dealer Locator
          </MobileNavItem>
          {/* <MobileNavItem href="/login" onClose={onClose}>
            Login
          </MobileNavItem> */}
          <MobileNavItem href="/how-to" onClose={onClose}>
            How To Videos
          </MobileNavItem>
          <MobileNavItem href="/contact" onClose={onClose}>
            Contact Us
          </MobileNavItem>
          <MobileNavItem href="/terms" onClose={onClose}>
            Our Policy
          </MobileNavItem>
        </nav>
      </div>
    </div>
  );
}

/**
 * Each nav link gets an 'active' style (blue & bold) if the current
 * pathname matches its href. We also call onClose() so the menu closes
 * once you click.
 */
// function MobileNavItem({
//   href,
//   onClose,
//   children,
// }: {
//   href: string;
//   onClose: () => void;
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const isActive = pathname === href;

//   return (
//     <Link
//       href={href}
//       onClick={onClose}
//       className={`
//         ${
//           isActive
//             ? "text-blue-600 font-bold"
//             : "text-gray-800 hover:text-blue-600"
//         }
//       `}
//     >
//       {children}
//     </Link>
//   );
// }
