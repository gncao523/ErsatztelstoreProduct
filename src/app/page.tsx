import { ProductSearch } from "@/components/ProductSearch";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-3">
        <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">
          Spare Parts Shop
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Product Search
        </h1>
        <p className="max-w-2xl text-slate-600">
          Find spare parts and accessories instantly. Type a keyword to filter
          products in real time.
        </p>
      </header>

      <ProductSearch />
    </main>
  );
}
