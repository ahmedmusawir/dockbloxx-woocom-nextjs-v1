import Link from "next/link";

const Hero = () => {
  return (
    <div className="bg-white">
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 py-2 sm:py-4 lg:px-8 lg:py-5 lg:pr-0">
              {/* <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0"> */}
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl pb-10">
                <div className="hidden sm:mb-10 sm:flex">
                  <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                    Anim aute id magna aliqua ad ad non deserunt sunt.{" "}
                    <a
                      href="#"
                      className="whitespace-nowrap font-semibold text-indigo-600"
                    >
                      <span aria-hidden="true" className="absolute inset-0" />
                      Read more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
                <h1 className="text-pretty text-6xl font-semibold tracking-tight text-blue-600">
                  DockBloxx is a game-changing product!
                </h1>
                <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                  DockBloxx are designed to give you a clean, strong, mounting
                  surface for all your boating/docking accessories. Our
                  Patent-Pending design “Cinches” tight to your dock post giving
                  you the ability to keep your dock and accessories organized
                  and clutter free.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/shop"
                    className="mt-10 bg-lime-300 text-blue-600 font-bold py-5 px-20 rounded-none hover:bg-lime-700"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            alt=""
            src="/home-header-bg.jpg"
            className="aspect-[3/2] object-cover lg:aspect-auto lg:size-full"
          />
        </div>
      </div>
    </div>
  );
};
export default Hero;
