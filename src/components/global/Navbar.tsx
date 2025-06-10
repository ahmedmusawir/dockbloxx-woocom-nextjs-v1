"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { MenuIcon } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { usePathname } from "next/navigation";
import MobileNavOverlay from "./MobileNavOverlay";
import Spinner from "../common/Spinner";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  // Access Zustand store
  const { getCartDetails, isLoading } = useCartStore();
  const cartItemCount = getCartDetails().length;

  // A ref to the dropdown container for [Community]
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // A ref to the dropdown container for [Helper]
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);

  // Add a global mouse event listener so that the dropdown goes away when clicked on the body
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // Close Community dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      // Close Help dropdown
      if (
        helpDropdownRef.current &&
        !helpDropdownRef.current.contains(e.target as Node)
      ) {
        setIsHelpDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`px-3 py-2 text-sm font-medium hover:text-blue-600 ${
          isActive
            ? "border-b-4 border-blue-600 text-blue-600"
            : "border-b-4 border-transparent text-gray-700"
        }`}
      >
        {children}
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <nav className="bg-white">
      {/* ==================== MOBILE/TABLET LAYOUT (<1024px) ==================== */}
      {/* Single row with logo left & icons right */}
      <div className="block lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between mt-10">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/site-logo.png"
              // src={getImageUrl("/wp-content/uploads/Logo@2x.png")}
              alt="DockBloxx"
              width={280}
              height={80}
              className="h-auto w-[280px] md:w-[320px] pr-4"
            />
          </Link>

          {/* Icons (hamburger, user, cart) */}
          {/* <div className="flex items-center space-x-2 sm:space-x-4"> */}
          <div className="flex items-center space-x-0 sm:space-x-0">
            {/* User/Login Icon */}
            {/* <Link href="/login" className="p-2">
              <UserCircleIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
            </Link> */}

            {/* Hamburger to show/hide mobile menu */}
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <MenuIcon className="h-7 w-7" />
              )}
            </button>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2">
              <ShoppingBagIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {cartItemCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Optional divider for mobile */}
        <hr className="border-2 border-gray-300" />
      </div>

      {/* ==================== DESKTOP LAYOUT (≥1024px) ==================== */}
      <div className="hidden lg:block">
        {/* Row 1: Logo on left, Secondary Menu on right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between mt-10">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/site-logo.png"
                // src={getImageUrl("/wp-content/uploads/Logo@2x.png")}
                alt="DockBloxx"
                width={280}
                height={80}
                className="h-auto w-[280px]"
              />
            </Link>
          </div>
          {/* Secondary Nav */}

          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <Link href="/search" className="hover:text-blue-600">
              Search Products
            </Link>
            <span className="border-r border-gray-300 h-4" />

            {/* DROPDOWN WRAPPER */}
            <div className="relative" ref={dropdownRef}>
              {/* Main Trigger (clickable) */}
              <span
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-blue-600 cursor-pointer"
              >
                Community
              </span>

              {/* Dropdown - only visible if isDropdownOpen */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-gray-200 shadow-md z-10">
                  <Link
                    href="/about"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Our Story
                  </Link>
                  <Link
                    href="/blog"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>
            <span className="border-r border-gray-300 h-4" />

            <Link href="/dealer-locator" className="hover:text-blue-600">
              Dealer Locator
            </Link>
            <span className="border-r border-gray-300 h-4" />

            <Link href="/dealer-login" className="hover:text-blue-600">
              Dealer Login
            </Link>
            <span className="border-r border-gray-300 h-4" />

            {/* <Link href="/contact" className="hover:text-blue-600">
              Help
            </Link> */}
            {/* HELP DROPDOWN WRAPPER */}
            <div className="relative" ref={helpDropdownRef}>
              {/* Main Trigger (clickable) */}
              <span
                onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                className="hover:text-blue-600 cursor-pointer"
              >
                Help
              </span>

              {/* Dropdown - only visible if isHelpDropdownOpen */}
              {isHelpDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-white border border-gray-200 shadow-md z-10">
                  <Link
                    href="/how-to"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    How-to Videos
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/terms"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Our Policy
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-2 border-gray-300" />

        {/* Row 2: Main Nav on left, Icons on right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Main Desktop Nav */}
          <div className="flex space-x-8 text-base font-bold">
            <NavLink href="/shop">SHOP ALL</NavLink>
            <NavLink href="/category/accessories">ACCESSORIES</NavLink>
            <NavLink href="/build-a-bloxx">BUILD A BLOXX</NavLink>
            <NavLink href="/category/deals">DEALS</NavLink>
            {/* <NavLink href="/shop/gift-card">GIFT CARDS</NavLink> */}
            <NavLink href="https://www.facebook.com/DockBloxx/reviews">
              REVIEW
            </NavLink>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* <Link href="/login" className="p-2">
              <UserCircleIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
            </Link> */}
            <Link href="/cart" className="relative p-2">
              <ShoppingBagIcon className="h-7 w-7 text-blue-600 hover:text-blue-800" />
              {/* {cartCount > 0 && ( */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {cartItemCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Optional divider at bottom */}
        <hr className="border-2 border-gray-300" />
      </div>

      {/* ==================== MOBILE MENU (when isMenuOpen) ==================== */}

      {isMenuOpen && <MobileNavOverlay onClose={() => setMenuOpen(false)} />}
    </nav>
  );
};

export default Navbar;
