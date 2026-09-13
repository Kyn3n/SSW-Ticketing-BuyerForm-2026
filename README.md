# SSW Ticketing 2026

A user-facing single-page app for the buyer ticket-purchase flow. It has no
backend of its own — it only calls a separate backend API over HTTP.

## Getting started

Copy `.env.example` to `.env` and point `NEXT_PUBLIC_API_BASE_URL` at your
backend API, then install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API flow

The form expects the backend to expose:

1. `POST {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/order/image` — body
   `{ contentType }`, returns `{ imageUrl, imageUUID }`.
2. `PUT <imageUrl>` — accepts the raw receipt image bytes.
3. `POST {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/order` — body
   `{ email, name, phone, cart: { normal, normal_bundle, vip, vip_bundle }, screenshotImageId }`,
   returns `{ ok, order: { id, status, seatCount } }`.

`GET {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/order/image/{imageUUID}` is also
available to fetch the stored receipt back for preview, but the form does not
currently call it.

## Checks

```bash
npm run lint
npm run build
```
