"use client";

const SubscribeNow = () => {
  return (
    <div className="container flex flex-col justify-center items-center mx-auto my-8 py-10 bg-gray-600">
      {/* Background Image */}
      <div
        style={{
          backgroundImage: "url('/home-header-bg.jpg')",
        }}
        className="max-w-5xl bg-gray-300 h-64 w-full rounded-lg shadow-md bg-cover bg-center"
      ></div>

      {/* Card */}
      <div className="bg-white -mt-24 shadow-md rounded-lg overflow-hidden">
        <div className="items-center justify-between py-10 px-5 bg-white shadow-2xl rounded-lg mx-auto text-center">
          <div className="px-2 -mt-6">
            <h1 className="font-medium text-3xl text-gray-800 leading-loose my-3 w-full">
              Subscribe Now!
            </h1>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="max-w-sm mx-auto p-1 pr-0 flex items-center">
                <input
                  type="email"
                  placeholder="yourmail@example.com"
                  className="flex-1 appearance-none rounded shadow p-3 text-gray-700 mr-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white text-base font-semibold rounded-md shadow-md hover:bg-indigo-600 p-3"
                >
                  Get started
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeNow;
