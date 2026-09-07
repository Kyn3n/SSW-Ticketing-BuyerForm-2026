# SSW Ticketing 2026

A local mock of the buyer ticket-purchase flow. It uses a decoupled receipt
upload followed by order creation, matching the planned Cloud Storage flow
without requiring GCP services.

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Submitted receipts are written to `public/mock-bucket/`. Validated orders are
appended to `data/mock-orders.json` with a `pending` status. Both runtime
locations are ignored by Git.

For local use, upload URLs are signed with a fallback mock secret and expire
after ten minutes. Set `MOCK_UPLOAD_SECRET` when you want a custom local secret.

## Mock API flow

1. `POST /api/orders/initiate-upload` validates file metadata and returns a
   temporary upload URL.
2. `PUT /api/mock-bucket/:referenceId` accepts the raw image body and returns
   its mock object path.
3. `POST /api/orders/create` validates the buyer data and receipt, logs the
   payload, and persists the pending order.

## Checks

```bash
npm run lint
npm run build
```
