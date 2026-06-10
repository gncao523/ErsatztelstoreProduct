export interface EedResponse {
  fehlernummer: string;
  fehlermeldung?: string;
  neuesessionid?: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
  manufacturer?: string;
  deliveryTime?: string;
  orderable?: boolean;
  category?: string;
  ean?: string;
}

export interface ProductDetail extends Product {
  weight?: string;
  articleData?: Record<string, string>;
  categoryTree?: { id: string; name: string }[];
  disposalCost?: string;
}

export interface SearchResponse extends EedResponse {
  treffer?: Record<string, EedArticle>;
  gesamtanzahltreffer?: string;
  anzahlseiten?: string;
  seite?: number;
}

export interface DetailResponse extends EedResponse {
  artikelnummer?: string;
  artikelbezeichnung?: string;
  ekpreis?: string;
  thumbnailurl?: string;
  bild?: string;
  artikelhersteller?: string;
  lieferzeit?: string;
  bestellbar?: string;
  gewicht?: string;
  artikeldaten?: Record<string, string>;
  vgruppenbaum?: { vgruppenid: string; vgruppenname: string }[];
  vgruppenname?: string;
  disposalcost?: string;
  EAN?: string;
}

interface EedArticle {
  artikelnummer: string;
  artikelbezeichnung: string;
  ekpreis?: string;
  thumbnailurl?: string;
  bild?: string;
  artikelhersteller?: string;
  lieferzeit?: string;
  bestellbar?: string;
  vgruppenname?: string;
  EAN?: string;
}
