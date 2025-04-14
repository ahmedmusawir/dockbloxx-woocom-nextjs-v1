import Image from "next/image";

const navigation = {
  solutions: [
    { name: "Marketing", href: "#" },
    { name: "Analytics", href: "#" },
    { name: "Commerce", href: "#" },
    { name: "Insights", href: "#" },
  ],
  support: [
    { name: "Pricing", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "Guides", href: "#" },
    { name: "API Status", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Jobs", href: "#" },
    { name: "Press", href: "#" },
    { name: "Partners", href: "#" },
  ],
  legal: [
    { name: "Claim", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ],
  social: [
    {
      name: "Facebook",
      href: "#",
      icon: "/images/Facebook-1.png",
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: "/images/Linkedin-1.png",
    },
    {
      name: "Pinterest",
      href: "#",
      icon: "/images/Pinterest-1.png",
    },
    {
      name: "Twitter",
      href: "#",
      icon: "/images/Twitter-1.png",
    },
    {
      name: "Youtube",
      href: "#",
      icon: "/images/Youtube-1.png",
    },
    {
      name: "RSS",
      href: "#",
      icon: "/images/Rss-1.png",
    },
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
              alt="Dockbloxx Company Logo"
              width={250}
              height={50}
              priority
            />
            {/* <p className="text-sm leading-6 text-gray-300">
              Making the world a better place through constructing elegant
              hierarchies.
            </p> */}
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
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-400"
                >
                  <span className="sr-only">{item.name}</span>
                  <Image
                    src={item.icon}
                    alt="Facebook"
                    width={35}
                    height={35}
                  />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Solutions
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.solutions.map((item) => (
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
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Support
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
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
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
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
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
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
