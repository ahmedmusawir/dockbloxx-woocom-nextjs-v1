"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/useCartStore";
import Spinner from "../common/Spinner";

const Navbar = () => {
  const pathname = usePathname();
  // Access Zustand store
  const { getCartDetails, isLoading } = useCartStore();
  const cartItemCount = getCartDetails().length;
  // console.log("Cart Item Count [Navbar]", cartDetails);

  interface NavLinkProps {
    href: string;
    children: ReactNode;
  }

  // PREPARING THE NAVLINK WITH ACTIVE LINK
  const NavLink = ({ href, children }: NavLinkProps) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`text-white dark:text-white px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white ${
          isActive
            ? "border-b-4 border-indigo-500 text-gray-900"
            : "border-b-4 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
    <div className="bg-blue-800 dark:bg-slate-700 py-2 px-5 flex justify-between">
      <Link href={"/"}>
        <Image
          src={
            "https://res.cloudinary.com/dyb0qa58h/image/upload/v1696245158/company-4-logo_syxli0.png"
          }
          alt="Cyberize"
          width={40}
          height={40}
        />
      </Link>

      {/* NAVIGATION */}
      <nav className="hidden sm:ml-6 sm:flex flex-grow justify-center items-center">
        <NavLink href="/shop">Shop</NavLink>
        Shop
        <NavLink href="/blog">Blog</NavLink>
        <NavLink href="/build-a-bloxx">Build A Bloxx</NavLink>
        {/* <NavLink href="/customer-dashboard">Customer</NavLink> */}
        {/* <NavLink href="/demo">Demo</NavLink> */}
        <NavLink href="/template">Template</NavLink>
      </nav>

      {/* DARK MODE BUTTON */}
      <div className="flex items-center">
        <span className="mr-3 text-white">fake-user@email.com</span>
        {/* {user && <span className="mr-3 text-white">{user.email}</span>} */}
        {/* SHOPPING BAG ICON */}
        <div className="ml-4 flow-root lg:ml-6">
          <Link href="/cart" className="group -m-2 flex items-center p-2">
            <ShoppingBagIcon
              aria-hidden="true"
              className="size-8 shrink-0 text-gray-300 group-hover:text-gray-50"
            />
            <span className="ml-1 mr-3 text-lg font-medium text-gray-300 group-hover:text-gray-50">
              {cartItemCount}
            </span>
            <span className="sr-only">items in cart, view bag</span>
          </Link>
        </div>
        {/* DROP DOWN MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            {/* <button className="text-gray-500 pt-1"> */}
            <MenuIcon
              className="h-8 w-8 text-white border-2 border-white p-1"
              aria-hidden="true"
            />
            {/* </button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-slate-600">
            <DropdownMenuItem>
              <Link href="/shop">Shop</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
              <Link
                href="/shop"
                onClick={() => {
                  const { resetPagination } =
                    useNumberedPaginationStore.getState();
                  resetPagination(initialProducts, initialCursor); // Reset Zustand state
                }}
              >
                Shop
              </Link>
            </DropdownMenuItem> */}

            <DropdownMenuItem>
              <Link href="/blog">Blog</Link>
            </DropdownMenuItem>

            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={"/profile"}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {/* <Logout /> Use the Logout component */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
