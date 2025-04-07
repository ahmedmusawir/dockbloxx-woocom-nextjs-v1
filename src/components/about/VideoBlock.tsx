import React from "react";
import Link from "next/link";

const VideoBlock = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Video Column */}
          <div className="h-[400px]">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/llfJVpopOyw"
              title="DockBloxx Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Content Column */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Passion meets innovation
            </h2>
            <p className="text-lg text-gray-600">
              DockBloxx was born from a passion for boating and the real need
              for a better way to organize all things dock-side.
            </p>
            <p className="text-lg text-gray-600">
              We are dedicated to creating innovative products designed to
              improve Organization, Safety, Functionality, Convenience, and
              Enjoyment on the dock and on the water.{" "}
              <Link href="/about" className="text-blue-600 hover:text-blue-700">
                See more...
              </Link>
            </p>
            <p className="text-gray-500 italic">
              "There's a way to do it better. Find it." -Thomas Edison
            </p>
            <div>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-green-500 text-white font-medium rounded-none hover:bg-green-600 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoBlock;
