"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MenuIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const { getCartDetails } = useCartStore();

  useEffect(() => {
    setCartCount(getCartDetails().length);
  }, [getCartDetails]);

  // Reusable NavLink
  const NavLink = ({
    href,
    children,
    className = "",
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 hover:text-blue-600 ${
          isActive
            ? "border-b-0 border-blue-600 text-blue-600"
            : "border-b-0 border-transparent text-gray-700"
        } ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white">
      {/* Row 1: Logo on left, Secondary Menu on right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between mt-10">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src={getImageUrl("/wp-content/uploads/Logo@2x.png")}
              alt="DockBloxx"
              width={280}
              height={80}
              className="h-auto w-[280px] md:w-[320px] lg:w-[360px]"
            />
          </Link>
        </div>

        {/* Secondary Nav (hidden below 1024px) */}
        <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-600">
          <Link href="/shop" className="hover:text-blue-600">
            Search Products
          </Link>
          <span className="border-r border-gray-300 h-4" />
          <Link href="/shop" className="hover:text-blue-600">
            Community
          </Link>
          <span className="border-r border-gray-300 h-4" />
          <Link href="/shop" className="hover:text-blue-600">
            Dealer Locator
          </Link>
          <span className="border-r border-gray-300 h-4" />
          <Link href="/shop" className="hover:text-blue-600">
            Dealer Login
          </Link>
          <span className="border-r border-gray-300 h-4" />
          <Link href="/help" className="hover:text-blue-600">
            Help
          </Link>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-2 border-gray-300" />

      {/* Row 2: Main Nav on left, Icons on right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Main Desktop Nav (hidden below 1024px) */}
        <div className="hidden lg:flex space-x-8 text-base font-bold">
          <NavLink href="/shop">SHOP ALL</NavLink>
          <NavLink href="/shop">ACCESSORIES</NavLink>
          <NavLink href="/shop">BUILD A BLOXX</NavLink>
          <NavLink href="/shop">DEALS</NavLink>
          <NavLink href="/shop">GIFT CARDS</NavLink>
          <NavLink href="/shop">REVIEW</NavLink>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          {/* Show hamburger below 1024px */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-blue-600 hover:text-blue-800"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <MenuIcon className="h-7 w-7" />
            )}
          </button>

          {/* User/Login Icon */}
          <Link href="/login" className="p-2">
            <UserCircleIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2">
            <ShoppingBagIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Divider (optional if you want a thicker line at the bottom) */}
      <hr className="border-2 border-gray-300" />

      {/* Mobile Menu (expands row 2’s main nav) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 text-lg font-bold">
            <NavLink href="/shop">SHOP ALL</NavLink>
            <NavLink href="/shop">ACCESSORIES</NavLink>
            <NavLink href="/shop">BUILD A BLOXX</NavLink>
            <NavLink href="/shop">DEALS</NavLink>
            <NavLink href="/shop">GIFT CARDS</NavLink>
            <NavLink href="/shop">REVIEW</NavLink>
            <hr className="my-2" />
            <div className="text-base font-normal space-y-1">
              <NavLink href="/shop">Product Finder</NavLink>
              <NavLink href="/shop">Community</NavLink>
              <NavLink href="/shop">Corporate Sales</NavLink>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/help">Help</NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
