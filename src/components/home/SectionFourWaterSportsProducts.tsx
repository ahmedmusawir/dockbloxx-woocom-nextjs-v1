import Link from "next/link";

const callouts = [
  {
    name: "Desk and Office",
    description: "Work from home accessories",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/IMG_3634-scaled.jpg",
    imageAlt:
      "Desk with leather desk pad, walnut desk organizer, wireless keyboard and mouse, and porcelain mug.",
    href: "#",
  },
  {
    name: "Self-Improvement",
    description: "Journals and note-taking",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/Photoroom_20240429_113149.jpg",
    imageAlt:
      "Wood table with porcelain mug, leather journal, brass pen, leather key ring, and a houseplant.",
    href: "#",
  },
  {
    name: "Travel",
    description: "Daily commute essentials",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/8-1.jpg",
    imageAlt: "Collection of four insulated travel bottles on wooden shelf.",
    href: "#",
  },
  {
    name: "Travel2",
    description: "Daily commute essentials",
    imageSrc:
      "https://dockbloxx.mystagingwebsite.com/wp-content/uploads/whos-your-caddie-lead.png",
    imageAlt: "Collection of four insulated travel bottles on wooden shelf.",
    href: "#",
  },
];

const SectionFourWaterSportsProducts = () => {
  return (
    <div className="bg-gray-100  pb-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
          <h2 className="text-2xl font-bold text-gray-900">
            WATER SPORTS PRODUCTS
          </h2>

          <div className="mt-6 space-y-12 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:space-y-0 ">
            {callouts.map((callout) => (
              // <div key={callout.name} className="group relative">
              <div key={callout.name} className="group">
                <img
                  alt={callout.imageAlt}
                  src={callout.imageSrc}
                  className="w-full h-full rounded-lg bg-white object-cover group-hover:opacity-75 max-sm:h-80 sm:aspect-[2/1] "
                />
                <h3 className="mt-6 text-sm text-gray-500">
                  <a href={callout.href}>
                    <span className="absolute inset-0" />
                    {callout.name}
                  </a>
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {callout.description}
                </p>
                <div className="mt-10">
                  <Link
                    href="/shop"
                    className="bg-lime-500 text-white py-5 px-20 rounded-none hover:bg-lime-700"
                  >
                    Select Option
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SectionFourWaterSportsProducts;
