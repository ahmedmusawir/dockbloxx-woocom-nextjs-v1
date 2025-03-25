import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { getAllCategories } from "@/services/categoryServices";
import { Category } from "@/types/category";

interface Props {
  categories: Category[];
}

const CategoryFilter = ({ categories }: Props) => {
  const filteredCategories = categories.filter((cat) => cat.slug !== "bloxx");

  const renderCategoryLink = (cat: Category) => (
    <MenuItem key={cat.id}>
      <Link
        href={`/category/${cat.slug}`}
        className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
      >
        {cat.name}
      </Link>
    </MenuItem>
  );

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Category Filters
          <ChevronDownIcon
            aria-hidden="true"
            className="-mr-1 size-5 text-gray-400"
          />
        </MenuButton>
      </div>

      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none">
        {/* <div className="py-1">
          <MenuItem>
            <Link
              href="/category/dockbloxx"
              className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              All Dockbloxx
            </Link>
          </MenuItem>
        </div> */}

        <div className="py-1">{filteredCategories.map(renderCategoryLink)}</div>

        <div className="py-1">
          <MenuItem>
            <Link
              href="/shop"
              className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              All Products
            </Link>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default CategoryFilter;
