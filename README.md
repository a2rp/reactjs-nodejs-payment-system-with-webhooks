# React, Express, and Razorpay Checkout

A small full-stack demo that creates Razorpay test orders from an Express API, opens Checkout in a React UI, verifies Checkout signatures on the server, and validates signed webhook requests.

## Requirements

- Node.js 18 or newer
- npm
- A Razorpay test account and test API credentials

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and add your Razorpay test key ID, key secret, and a webhook secret. Keep these values private.
2. Copy `frontend/.env.example` to `frontend/.env` if the API uses a different address.
3. Install and start the API:

   ```sh
   cd backend
   npm install
   npm start
   ```

4. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`. The browser origin must match `FRONTEND_ORIGIN` in the backend environment.

The demo accepts integer amounts from ₹501 through ₹9,999. Use Razorpay test credentials and test payment details only.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/order/create` | Validates the rupee amount and creates a Razorpay order. |
| `POST` | `/api/order/verify-payment` | Verifies Checkout's order/payment signature with the server key secret. |
| `POST` | `/api/webhooks/razorpay` | Validates the HMAC signature over the exact raw webhook body. |

Configure the Razorpay webhook URL to point to `/api/webhooks/razorpay` and set the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`. For local webhook testing, expose the backend through a trusted HTTPS tunnel and configure that URL in the Razorpay dashboard.

## Scope and limitations

This is an integration example, not a production payment system. Webhooks are signature-checked and acknowledged, but the app has no database, duplicate-event store, order state, or fulfillment logic. The Checkout callback verifies the signature but does not replace server-side reconciliation or webhook processing. Do not use this demo to fulfill real orders.
