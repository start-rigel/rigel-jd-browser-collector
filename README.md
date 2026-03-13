# rigel-jd-browser-collector

Browser-based JD search worker for Rigel.

## Purpose

This service exists because JD public search pages can trigger risk-control when fetched by a plain server-side HTTP client.
It keeps the browser automation boundary separate from `rigel-jd-collector`, which should remain the Go orchestration and persistence layer.

## Language

Node.js + Playwright

## Current Stage

Phase 0.5 browser collector skeleton.

## Implemented

- minimal HTTP API
- replaceable collector abstraction
- `mock` mode for local development
- `public_search` mode for browser-based JD search attempts
- explicit JD risk-control detection
- optional cookie / cookie-file / storage-state injection

## Not Implemented Yet

- stable login-state management UI
- scheduler and retry orchestration
- direct integration into `rigel-jd-collector`
- verified production-grade JD selectors

## Routes

- `GET /healthz`
- `POST /api/v1/search`

## Request Example

```bash
curl -X POST http://localhost:18086/api/v1/search \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"RTX 4060","category":"GPU","limit":3}'
```

## Modes

- `mock`
  - deterministic local fake data
- `public_search`
  - launches Playwright
  - opens JD public search page
  - tries to parse search cards
  - returns an explicit risk-control error if JD redirects to a risk page
  - defaults to self-operated items only

## Required Runtime Inputs For Real Search

If `public_search` mode is used, you will usually need at least one of:

- `RIGEL_JD_COOKIE`
- `RIGEL_JD_COOKIE_FILE`
- `RIGEL_JD_STORAGE_STATE_PATH`

These are not verified yet for your account. Treat this path as `TODO`, not guaranteed availability.

Self-operated filtering:

- `RIGEL_JD_SELF_OPERATED_ONLY=true`
  - default
  - returns JD self-operated items only

Cookie file support:

- `RIGEL_JD_COOKIE_FILE=/path/to/cookie`
  - used when `RIGEL_JD_COOKIE` is empty
  - recommended for local and Docker usage because it avoids embedding a long cookie string directly into `.env`

## Run Locally

```bash
cp .env.example .env
npm install
npm run start
```

## Docker

```bash
docker build -t rigel-jd-browser-collector .
docker run --rm -p 18086:18086 --env-file .env rigel-jd-browser-collector
```

## Design Notes

- This service should not write Rigel business tables directly.
- It should return normalized raw search results to the Go collector layer.
- JD browser automation stays isolated here so it can be replaced later by official API access if permissions become available.

## TODO / MOCK

- JD public search selectors: `TODO / UNVERIFIED`
- JD authenticated browser session reuse: `TODO / UNVERIFIED`
- Anti-risk-control strategy: `TODO / UNVERIFIED`
