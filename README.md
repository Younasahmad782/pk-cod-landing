# PK COD Landing Page — Next.js + React + Tailwind

A single-product Cash-on-Delivery landing page in the style of high-converting
ad funnels, built for the Pakistan market (PKR pricing, Pakistani cities).
Demo product: **Noor Herbal Hair Oil** — swap it in `lib/product.ts`.

## Features
- Mobile-first, conversion-focused layout (hero, bundle pricing, benefits,
  ingredients, how-to-use steps, product info table, reviews, returns)
- COD order form: Name, Mobile (03XX validated), City — with order success screen
- Orders saved server-side (`data/orders.json`) via `/api/order`
- **Excel export:** open `/api/order/export?key=YOUR_ADMIN_EXPORT_KEY` to download orders.csv
- **Meta Pixel** (browser) + **Conversions API** (server Purchase event) —
  configured via env vars, safely no-ops when unset
- English by default with a full **Arabic + RTL** toggle
- Recent-order popup, sticky mobile order bar, free-delivery top bar
- No cart, no multi-product store, no WhatsApp — direct order only

## Run it
```bash
npm install
cp .env.example .env.local   # fill in Pixel ID / token / export key
npm run dev                  # http://localhost:3000
npm run build && npm run start   # production
```

## Deploy
Push to GitHub → import the repo at vercel.com (free) → add the same env
vars in Vercel project settings → deploy. Note: on Vercel the JSON order
file is demo-grade (serverless disk is temporary) — for a live client,
point `lib/orders.ts` at a database or Google Sheets.

## Change the product
Edit only `lib/product.ts` (name, prices, images) and the copy in
`lib/i18n.ts`. Images live in `public/images/`.
