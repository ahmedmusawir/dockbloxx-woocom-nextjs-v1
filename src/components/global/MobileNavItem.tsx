import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNavItem({
  href,
  onClose,
  children,
  isExternal = false,
}: {
  href: string;
  onClose: () => void;
  children: React.ReactNode;
  isExternal?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isExternal) {
    // For external links: plain <a> tag
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className={`
            ${
              isActive
                ? "text-blue-600 font-bold"
                : "text-gray-800 hover:text-blue-600"
            }
          `}
      >
        {children}
      </a>
    );
  }

  // Otherwise a normal internal link
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`
          ${
            isActive
              ? "text-blue-600 font-bold"
              : "text-gray-800 hover:text-blue-600"
          }
        `}
    >
      {children}
    </Link>
  );
}
