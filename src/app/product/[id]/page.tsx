import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/eed";
import { getClientIp } from "@/lib/client-ip";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("eed_session")?.value;

  let product;
  try {
    const clientIp = await getClientIp();
    const result = await getProductDetail(id, clientIp, sessionId);
    product = result.product;

    if (result.sessionId) {
      cookieStore.set("eed_session", result.sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 3,
      });
    }
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <span aria-hidden>←</span>
        Back to search
      </Link>

      <div className="grid gap-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-10">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <svg
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            {product.category && (
              <p className="text-sm font-medium text-blue-600">
                {product.category}
              </p>
            )}
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold text-slate-900">
              {product.price}
            </p>
          </div>

          <dl className="grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Article no.</dt>
              <dd className="font-medium text-slate-800">{product.id}</dd>
            </div>
            {product.manufacturer && product.manufacturer !== "-" && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Manufacturer</dt>
                <dd className="font-medium text-slate-800">
                  {product.manufacturer}
                </dd>
              </div>
            )}
            {product.deliveryTime && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Delivery</dt>
                <dd className="font-medium text-slate-800">
                  {product.deliveryTime}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Availability</dt>
              <dd
                className={`font-medium ${product.orderable ? "text-emerald-700" : "text-amber-700"}`}
              >
                {product.orderable ? "Orderable" : "Not orderable"}
              </dd>
            </div>
            {product.ean && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">EAN</dt>
                <dd className="font-medium text-slate-800">{product.ean}</dd>
              </div>
            )}
            {product.weight && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Weight</dt>
                <dd className="font-medium text-slate-800">
                  {product.weight} kg
                </dd>
              </div>
            )}
            {product.disposalCost && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Disposal cost</dt>
                <dd className="font-medium text-slate-800">
                  {product.disposalCost} €
                </dd>
              </div>
            )}
          </dl>

          {product.categoryTree && product.categoryTree.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-700">
                Category
              </h2>
              <p className="text-sm text-slate-600">
                {product.categoryTree.map((item) => item.name).join(" › ")}
              </p>
            </section>
          )}

          {product.articleData &&
            Object.keys(product.articleData).length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Technical details
                </h2>
                <dl className="grid gap-2 text-sm">
                  {Object.entries(product.articleData).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b border-slate-100 pb-2"
                    >
                      <dt className="text-slate-500">{key.replace(/_/g, " ")}</dt>
                      <dd className="font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
        </div>
      </div>
    </main>
  );
}
