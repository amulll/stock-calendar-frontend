# Stock Calendar Frontend

Next.js App Router frontend for the stock calendar website. This repo owns the user-facing pages, SSR/SEO rendering, and the proxy boundary that forwards browser requests to the backend with a server-side service token.

## What This Repo Owns

- User-facing website and page routing.
- SSR for first render and SEO.
- Same-origin proxy for browser-side API calls.
- UI state, modal flows, filters, watchlist, and search.

## Runtime Architecture

```text
[User Browser]
    |
    v
[Next.js app]
    |
    |-- SSR pages fetch backend directly on the server
    |-- Client components call /api/proxy/*
    |-- Proxy route injects X-Service-Token
    v
[stock-calendar-backend / FastAPI]
```

More detailed flow:

```text
Page load
Browser -> Next page route
        -> server component fetches backend
        -> returns rendered HTML + initial data

Client interaction
Browser -> /api/proxy/*
        -> Next route handler forwards to backend
        -> adds X-Service-Token on the server
        -> returns JSON to the browser
```

## Security Boundary

- The browser should not know `SERVICE_TOKEN`.
- `SERVICE_TOKEN` is only used on the Next.js server side.
- The backend trusts this repo's server layer, not the browser directly.
- The proxy route only allows read prefixes:
  - `api/dividends`
  - `api/stocks`
  - `api/stock`

Practical meaning:

- This is not a pure static frontend calling the backend directly.
- It is a website with a server boundary that can safely hold the service token.
- If the browser bypasses the frontend and calls the backend directly, the backend should reject that request unless a valid token is present.

## Main Entry Points

- `app/page.js`: homepage SSR fetch for monthly dividends and stock list.
- `app/stock/[id]/page.js`: stock detail SSR fetch.
- `app/api/proxy/[...path]/route.js`: same-origin proxy that injects `X-Service-Token`.
- `components/CalendarClient.js`: main interactive calendar UI.
- `components/StockModal.js`: stock detail modal data fetch.
- `components/YieldListModal.js`: high-yield list fetch.
- `lib/proxy-client.js`: shared helper for proxy GET requests.

## Current Data Flow Summary

```text
SSR / SEO:
app/page.js
app/stock/[id]/page.js
app/sitemap.js
-> server-side fetch to backend

Browser interactions:
CalendarClient
StockModal
YieldListModal
-> /api/proxy/*
-> backend via Next route handler
```

## Environment Notes

The current repo uses more than one backend URL variable name:

- `BACKEND_INTERNAL_URL`: used by `/api/proxy`
- `NEXT_PUBLIC_API_URL`: used by server-rendered pages
- `API_URL`: used by sitemap generation before falling back to `NEXT_PUBLIC_API_URL`
- `SERVICE_TOKEN`: used by SSR and proxy forwarding

Keep those backend URL variables pointed at the same backend target, or you will split traffic across different environments.

## Deployment Model

This repo builds as a standalone Next.js server:

```text
Docker build
-> next build
-> .next/standalone
-> node server.js
```

That means this repo is expected to run as a Node server, not as a static export.

## Relationship To Backend

The backend expects requests from this repo to arrive in one of two ways:

- Server-rendered page fetches with `X-Service-Token`
- `/api/proxy` route forwards browser requests with `X-Service-Token`

Current frontend code does not proxy admin routes, so admin operations are not part of the normal user-facing request flow.

## Current Mental Model

If you need one short sentence to remember this repo:

```text
Next.js website with SSR + same-origin proxy, acting as the trusted server-side gateway between the browser and the FastAPI backend.
```
