import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio"  

export default function ShopifyProductCard({ product }) {
  return (
    <div className="rounded-xl border bg-white p-2 hover:shadow-md transition">
      {/* Image */}
      <AspectRatio ratio={1/1} className="relative rounded-xl flex items-center justify-center bg-[#fafafa]">
        <Image
          src={product.image?.src}
          alt={product.image?.alt || product.title}
          fill
          sizes="320"
          className="h-full w-full rounded-lg object-cover mix-blend-multiply transition-transform duration-1000 hover:scale-90"
        />
      </AspectRatio>

      {/* Content */}
      <div className="md:mt-2 space-y-2 p-2 md:p-4">
        <h3 className="text-[10px] md:text-sm font-medium leading-snug line-clamp-1">
          {product.title.replaceAll("-", " ")}
        </h3>

        {/* Static demo pricing (replace with variants later) */}
        <div className="flex justify-between gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-lg font-semibold">₹{product.price}</span>
            {
              product.compare_at_price > 0 && 
              <span className="text-[10px] md:text-sm text-gray-400 line-through">
                ₹{product.compare_at_price}
              </span>
            }            
          </div>

          <Link
            href={`/products/${product.handle}`}
            className="hidden text-sm text-primary md:flex items-center gap-1"
          >
            View Details <span>›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
