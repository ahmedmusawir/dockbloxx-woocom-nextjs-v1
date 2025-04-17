import React from "react";

const StaticLogoBlock = () => {
  return (
    <>
      <div className="w-full  border-t-4 border-gray-300 py-6 px-4 mt-10 ">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-6 text-center max-w-6xl mx-auto">
          {/* Feature Item */}
          <div className="flex flex-col items-center">
            <img src="/images/FLAG.png" alt="Made in USA" className="mb-2" />
            <p className="text-sm text-gray-800">Made in USA</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/WHEEL.png"
              alt="Stainless Steel Hardware"
              className="mb-2"
            />
            <p className="text-sm text-gray-800 text-center">
              Stainless Steel
              <br />
              Hardware
            </p>
          </div>

          <div className="flex flex-col items-center -mt-3">
            <img
              src="/images/RENCH.png"
              alt="Simple Installation"
              className="mb-2"
            />
            <p className="text-sm text-gray-800 text-center -mt-5">
              Simple
              <br />
              Installation
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/SUN.png"
              alt="UV Resistant Material"
              className="mb-6"
            />
            <p className="text-sm text-gray-800 text-center">
              UV Resistant
              <br />
              Material
            </p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/DRILL.png"
              alt="No Drill Solution"
              className="mb-6"
            />
            <p className="text-sm text-gray-800 text-center">
              No Drill
              <br />
              Solution
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaticLogoBlock;
