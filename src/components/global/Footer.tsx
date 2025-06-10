import Image from "next/image";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import {
  AiOutlineInstagram,
  AiOutlineFacebook,
  AiOutlineYoutube,
} from "react-icons/ai";
import SocialMediaLinks from "./SocialMediaLinks";
import Link from "next/link";

const navigation = {
  products: [
    { name: "Best Sellers", href: "/category/best-sellers" },
    { name: "Watersports", href: "/category/water-sports" },
    { name: "Entertainment", href: "/category/entertainment" },
    { name: "Sportsman", href: "/category/sportsman" },
    { name: "Dock Essentials", href: "/category/dock-essentials" },
  ],
  contacts: [
    { name: "Contact Us", href: "/contact" },
    { name: "Build-a-Bloxx", href: "/build-a-bloxx" },
    { name: "Warranty Claims", href: "/warranty" },
  ],
  help: [
    { name: "How-To Videos", href: "/how-to" },
    { name: "Shipping & Returns", href: "/returns" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ],
  about: [
    { name: "About Us", href: "/about" },
    { name: "Dealers", href: "/dealer-locator" },
    { name: "Reviews", href: "https://www.facebook.com/DockBloxx/reviews" },
    { name: "Blog", href: "/blog" },
  ],
};

function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8 pl-10">
          <div className="space-y-8">
            <Image
              src="/images/logo-white.png"
              alt="Dockbloxx Help Logo"
              width={250}
              height={50}
              priority
            />

            {/* Address */}
            <div className="flex items-start gap-4 mb-8">
              <Image
                src="/images/Map_Pin_white____Icon.png"
                alt="Location Icon"
                width={20}
                height={20}
              />
              <div>
                <p className="font-semibold text-gray-200 sm:text-lg text-base">
                  2349 Centennial Dr.
                </p>
                <p className="text-gray-100 text-base">Gainesville, GA 30504</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 mb-8">
              <Image
                src="/images/Phone_Call_white_Icon.png"
                alt="Phone Icon"
                width={30}
                height={30}
              />
              <p className="text-gray-200 font-semibold text-base sm:text-lg">
                404-220-9641
              </p>
            </div>

            {/* Social Media Icons */}
            <SocialMediaLinks />
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  PRODUCTS
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.products.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  CONTACTS
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.contacts.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  HELP
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.help.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  ABOUT
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.about.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-1 sm:mt-20 lg:mt-24 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs leading-5 text-gray-400 text-center sm:text-left">
            &copy; 2025 Dockbloxx, Inc. All rights reserved.
          </p>
          <Image
            src="/all-cards-dockbloxx.png"
            alt="Accepted Payment Methods"
            width={160}
            height={30}
            className="h-auto w-auto max-h-8"
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
