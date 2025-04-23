import { cleanPriceHtml } from "@/lib/utils";
import { Product } from "@/types/product";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  DOMNode,
} from "html-react-parser";

interface PriceDisplayProps {
  product: Product;
  variant?: "list" | "single";
}

export function PriceDisplay({ product }: PriceDisplayProps) {
  const raw = product.price_html;

  // Only “massage” simple on-sale items
  if (product.sale_price) {
    const cleaned = cleanPriceHtml(raw);

    const options: HTMLReactParserOptions = {
      replace: (node) => {
        // only process tags
        if (node.type === "tag" && node.name === "del") {
          // cast to satisfy domToReact signature
          const children = node.children as unknown as DOMNode[];
          return (
            <span className="text-sm text-black line-through">
              {domToReact(children)}
            </span>
          );
        }
        if (node.type === "tag" && node.name === "ins") {
          const children = node.children as unknown as DOMNode[];
          return (
            <span className="text-xl font-bold text-blue-700">
              {domToReact(children)}
            </span>
          );
        }
      },
    };

    return <>{parse(cleaned, options)}</>;
  }

  // Fallback—just render Woo’s HTML (ranges, single-price, etc.)
  return <>{parse(raw)}</>;
}
