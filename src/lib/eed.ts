import { createHash } from "crypto";
import type {
  DetailResponse,
  Product,
  ProductDetail,
  SearchResponse,
} from "./types";

const EED_BASE_URL = "https://shop.euras.com/eed.php";

const TEST_SEED_ARTICLE_IDS = [
  "G928991",
  "G652278",
  "Q509827",
  "D127993",
  "G957410",
];

const TEST_KEYWORDS = new Set(["SONY", "AEG", "HDMI"]);

let catalogCache: {
  products: Product[];
  sessionId?: string;
  fetchedAt: number;
} | null = null;

const CATALOG_TTL_MS = 1000 * 60 * 30;

function getEedId(): string {
  const id = process.env.EED_ID ?? "AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest";
  return id.endsWith("test") ? id : `${id}test`;
}

function isTestEnvironment(): boolean {
  return getEedId().endsWith("test");
}

function getShopUrl(): string {
  return process.env.SHOP_URL ?? "http://localhost:3000";
}

function hashIp(ip: string): string {
  return createHash("md5").update(ip).digest("hex");
}

function parsePrice(price?: string): string {
  if (!price) return "—";
  return `${price.replace(",", ".")} €`;
}

function mapArticle(article: {
  artikelnummer: string;
  artikelbezeichnung: string;
  ekpreis?: string;
  thumbnailurl?: string;
  artikelhersteller?: string;
  lieferzeit?: string;
  bestellbar?: string;
  vgruppenname?: string;
  EAN?: string;
}): Product {
  return {
    id: article.artikelnummer,
    name: article.artikelbezeichnung,
    price: parsePrice(article.ekpreis),
    imageUrl: article.thumbnailurl,
    manufacturer: article.artikelhersteller || undefined,
    deliveryTime: article.lieferzeit,
    orderable: article.bestellbar === "J",
    category: article.vgruppenname,
    ean: article.EAN,
  };
}

function filterProducts(products: Product[], query: string): Product[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return products;
  }

  return products.filter((product) => {
    const haystack = [
      product.id,
      product.name,
      product.manufacturer,
      product.category,
      product.ean,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

async function callEed(
  params: Record<string, string>,
  clientIp: string,
  sessionId = "auto",
): Promise<{ data: SearchResponse & DetailResponse; sessionId?: string }> {
  const searchParams = new URLSearchParams({
    format: "json",
    id: getEedId(),
    sessionid: sessionId,
    shopurl: getShopUrl(),
    customerip: hashIp(clientIp),
    ...params,
  });

  const response = await fetch(`${EED_BASE_URL}?${searchParams.toString()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error("EED service unavailable");
  }

  const data = (await response.json()) as SearchResponse & DetailResponse;

  if (data.fehlernummer !== "0") {
    throw new Error(data.fehlermeldung ?? "EED request failed");
  }

  return {
    data,
    sessionId: data.neuesessionid,
  };
}

async function loadCatalog(
  clientIp: string,
  sessionId?: string,
): Promise<{ products: Product[]; sessionId?: string }> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.fetchedAt < CATALOG_TTL_MS) {
    return {
      products: catalogCache.products,
      sessionId: catalogCache.sessionId ?? sessionId,
    };
  }

  const productsById = new Map<string, Product>();
  let activeSessionId = sessionId;

  for (const articleId of TEST_SEED_ARTICLE_IDS) {
    try {
      const { data, sessionId: newSessionId } = await callEed(
        {
          art: "artikelsuche",
          artnr: articleId,
          anzahl: "10",
        },
        clientIp,
        activeSessionId,
      );

      activeSessionId = newSessionId ?? activeSessionId;
      const hits = data.treffer ?? {};

      for (const article of Object.values(hits)) {
        productsById.set(article.artikelnummer, mapArticle(article));
      }
    } catch {
      // Continue loading remaining seed articles.
    }
  }

  const products = [...productsById.values()];
  catalogCache = {
    products,
    sessionId: activeSessionId,
    fetchedAt: now,
  };

  return {
    products,
    sessionId: activeSessionId,
  };
}

export async function searchProducts(
  query: string,
  clientIp: string,
  sessionId?: string,
): Promise<{ products: Product[]; total: number; sessionId?: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { products: [], total: 0, sessionId };
  }

  let activeSessionId = sessionId;

  if (!isTestEnvironment()) {
    const { data, sessionId: newSessionId } = await callEed(
      {
        art: "artikelsuche",
        suchbg: trimmed,
        anzahl: "50",
      },
      clientIp,
      sessionId,
    );

    const products = Object.values(data.treffer ?? {}).map(mapArticle);
    return {
      products,
      total: Number(data.gesamtanzahltreffer ?? products.length),
      sessionId: newSessionId ?? sessionId,
    };
  }

  const normalized = trimmed.toUpperCase();
  if (TEST_KEYWORDS.has(normalized)) {
    try {
      const { data, sessionId: newSessionId } = await callEed(
        {
          art: "artikelsuche",
          suchbg: normalized,
          anzahl: "10",
        },
        clientIp,
        sessionId,
      );

      activeSessionId = newSessionId ?? activeSessionId;
      const products = Object.values(data.treffer ?? {}).map(mapArticle);
      if (products.length > 0) {
        return {
          products,
          total: Number(data.gesamtanzahltreffer ?? products.length),
          sessionId: activeSessionId,
        };
      }
    } catch {
      // Fall back to cached catalog filtering below.
    }
  }

  const catalog = await loadCatalog(clientIp, activeSessionId);
  activeSessionId = catalog.sessionId ?? activeSessionId;
  const products = filterProducts(catalog.products, trimmed);

  return {
    products,
    total: products.length,
    sessionId: activeSessionId,
  };
}

function mapDetailResponse(
  data: DetailResponse,
  articleId: string,
): ProductDetail {
  return {
    ...mapArticle({
      artikelnummer: data.artikelnummer ?? articleId,
      artikelbezeichnung: data.artikelbezeichnung ?? "Unknown product",
      ekpreis: data.ekpreis,
      thumbnailurl: data.thumbnailurl,
      artikelhersteller: data.artikelhersteller,
      lieferzeit: data.lieferzeit,
      bestellbar: data.bestellbar,
      vgruppenname: data.vgruppenname,
      EAN: data.EAN,
    }),
    weight: data.gewicht,
    articleData: data.artikeldaten,
    categoryTree: data.vgruppenbaum?.map((item) => ({
      id: item.vgruppenid,
      name: item.vgruppenname,
    })),
    disposalCost: data.disposalcost,
  };
}

export async function getProductDetail(
  articleId: string,
  clientIp: string,
  sessionId?: string,
): Promise<{ product: ProductDetail; sessionId?: string }> {
  try {
    const { data, sessionId: newSessionId } = await callEed(
      {
        art: "artikeldetails",
        artnr: articleId,
        attrib: "1",
        bigPicture: "1",
      },
      clientIp,
      sessionId,
    );

    return {
      product: mapDetailResponse(data, articleId),
      sessionId: newSessionId ?? sessionId,
    };
  } catch (error) {
    if (!isTestEnvironment()) {
      throw error;
    }

    const catalog = await loadCatalog(clientIp, sessionId);
    const cached = catalog.products.find((product) => product.id === articleId);

    if (!cached) {
      throw error;
    }

    return {
      product: { ...cached },
      sessionId: catalog.sessionId ?? sessionId,
    };
  }
}
