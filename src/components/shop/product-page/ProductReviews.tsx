import React from "react";
import { StarIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}
const ProductReviews = () => {
  return (
    <div className="mt-3">
      <h3 className="sr-only">Reviews</h3>
      <div className="flex items-center">
        <div className="flex items-center">
          {[0, 1, 2, 3, 4].map((rating) => (
            <StarIcon
              key={rating}
              aria-hidden="true"
              className={classNames(
                4 > rating ? "text-indigo-500" : "text-gray-300",
                "size-5 shrink-0"
              )}
            />
          ))}
        </div>
        <p className="sr-only">{4} out of 5 stars</p>
      </div>
    </div>
  );
};

export default ProductReviews;
