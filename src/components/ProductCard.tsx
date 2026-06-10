import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

function ProductImage({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-contain p-4"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center text-slate-300">
      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${encodeURIComponent(product.id)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative aspect-square bg-slate-50">
        <ProductImage product={product} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 text-sm font-medium text-slate-800 group-hover:text-blue-700">
          {product.name}
        </h2>
        <p className="mt-auto text-lg font-semibold text-slate-900">
          {product.price}
        </p>
        {product.manufacturer && product.manufacturer !== "-" && (
          <p className="text-xs text-slate-500">{product.manufacturer}</p>
        )}
      </div>
    </Link>
  );
}
