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

1. `POST {NEXT_PUBLIC_API_BASE_URL}/orders/initiate-upload` — validates file
   metadata and returns a temporary upload URL plus a reference id.
2. `PUT <uploadUrl>` — accepts the raw receipt image bytes and returns the
   stored object's path.
3. `POST {NEXT_PUBLIC_API_BASE_URL}/orders/create` — validates the buyer
   details and receipt, and creates the pending order.

## Checks

```bash
npm run lint
npm run build
```
