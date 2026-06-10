"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { SearchBar } from "./SearchBar";

const DEBOUNCE_MS = 350;
const DEFAULT_QUERY = "backblech";

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setProducts([]);
      setTotal(0);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } catch (searchError) {
      setProducts([]);
      setTotal(0);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    setQuery(DEFAULT_QUERY);
  }, []);

  return (
    <div className="space-y-8">
      <SearchBar value={query} onChange={setQuery} />

      {loading && (
        <p className="text-sm text-slate-500">Searching products…</p>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && hasSearched && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-700">No products found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try another search term such as backblech, scart, or whirlpool.
          </p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            {total} result{total === 1 ? "" : "s"}
          </p>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
