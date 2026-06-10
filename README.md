# Ersatztelstore Product Search

A Next.js mini shop with real-time product search, product cards, and detail pages.

Data is loaded from the [SAS EED API](https://shop.euras.com/admin/Dok/eed-doku-eng.php) (Spares & Accessories Shop gateway).

## Features

- Real-time search with debounced API requests
- Product cards with image, name, and price
- Product detail page with delivery info, category, and technical data
- Server-side EED proxy (credentials stay on the server)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app uses the German **test** EED account from the documentation. On first search it loads a demo catalog from the API, then filters results in real time. Try terms like `backblech`, `scart`, or `whirlpool`.

## Environment variables

| Variable | Description |
| --- | --- |
| `EED_ID` | Your EED customer ID (`test` suffix enables the test environment) |
| `SHOP_URL` | Public URL of this shop (required by EED since Feb 2026) |

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
