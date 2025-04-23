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

const styles = {
  list: {
    old: "text-lg text-black line-through",
    neu: "text-xl font-bold text-blue-500",
  },
  single: {
    old: "text-2xl text-gray-500 line-through",
    neu: "text-4xl font-extrabold text-blue-400",
  },
};

export function PriceDisplay({ product, variant = "list" }: PriceDisplayProps) {
  // pick the right classes
  const { old: oldCls, neu: newCls } = styles[variant];

  // raw HTML from Woo
  const raw = product.price_html;

  // only massage simple on‐sale products
  if (product.sale_price) {
    const cleaned = cleanPriceHtml(raw);
    const options: HTMLReactParserOptions = {
      replace: (node) => {
        if (node.type === "tag" && node.name === "del") {
          const children = node.children as unknown as DOMNode[];
          return <span className={oldCls}>{domToReact(children)}</span>;
        }
        if (node.type === "tag" && node.name === "ins") {
          const children = node.children as unknown as DOMNode[];
          return <span className={newCls}>{domToReact(children)}</span>;
        }
      },
    };
    return <>{parse(cleaned, options)}</>;
  }

  // fallback for ranges or non-sale
  return (
    <span className={variant === "list" ? newCls : newCls}>{parse(raw)}</span>
  );
}
