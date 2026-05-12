# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Pupeter** is a TypeScript/Node.js PDF generation microservice. It delegates PDF rendering to a [Gotenberg](https://gotenberg.dev) sidecar container (which manages Chromium internally) via HTTP. Built on Fastify with rate limiting. Serves a real estate management system (Imob Gestão).

## Commands

```bash
# Development (file watching via tsx)
pnpm dev

# Build for production (tsup → dist/server.cjs)
pnpm build

# Run compiled server
pnpm start
```

```bash
# Docker — bring up API + Gotenberg together
docker compose up -d --build

# Docker — rebuild only
docker compose build --no-cache
```

Package manager: **pnpm@10.25.0** (pinned — do not upgrade to v11, see note below). No test runner is configured.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3333` | Port the Fastify server listens on |
| `GOTENBERG_URL` | `http://localhost:3000` | Base URL of the Gotenberg service |

## Architecture

The service has four layers:

1. **Server** ([src/server.ts](src/server.ts)) — Fastify instance with CORS (`*`), rate limiting (6 req/min per IP), `/pdf` route prefix. Reads `PORT` from env, binds to `0.0.0.0`.

2. **Routes** ([src/routes/pdf.routes.ts](src/routes/pdf.routes.ts)) — Three `POST` endpoints, all accepting `{ htmlContent: string }`:

   | Endpoint | Template | Header | Footer brand |
   |---|---|---|---|
   | `POST /pdf/model` | MODELO watermark | "Modelo de Documento" + date | no |
   | `POST /pdf/document` | No watermark | date only | yes |
   | `POST /pdf/preview` | PREVIEW watermark | date only | yes |

   All return `application/pdf` with `Content-Disposition: attachment`. `isServerOverloaded()` always returns `false` — load control is handled by Gotenberg and the rate limiter.

3. **Service** ([src/services/pdf.service.ts](src/services/pdf.service.ts)) — Builds `header.html` and `footer.html` as full HTML documents and sends them alongside `index.html` to Gotenberg via `POST /forms/chromium/convert/html` (multipart/form-data). Uses native `fetch` + `FormData`/`Blob` (Node 18+ globals, no extra dependency). Paper: A4 (8.27 × 11.69 in), margins 25 mm top/bottom, 20 mm left/right. Header and footer use `display: flex; justify-content: space-between` — `float` does not work reliably in Chromium's print header/footer context.

4. **Templates** ([src/templates/](src/templates/)) — Each exports a function `(htmlContent: string) => string` returning a complete HTML document. Typography, `@page` rules, page-break CSS, and watermark SVGs live here.

## Build Output

`tsup` compiles `src/server.ts` to `dist/server.cjs` (CommonJS bundle, all deps included, with source maps). TypeScript targets ES2022. Because `tsup` v8 externalises `dependencies` by default, `node_modules` must be present at runtime — the Docker runner stage installs production deps separately.

## Docker

Three-stage Dockerfile: `base` (installs pnpm once) → `builder` (full install + `pnpm build`) → `runner` (prod deps only + `dist/`).

**pnpm version note:** `pnpm@10` is pinned in both the `Dockerfile` (`pnpm@10`) and `package.json` (`packageManager`). Do **not** change to pnpm v11 — v11 requires build-script approvals to be recorded in the lockfile via `pnpm approve-builds`, whereas v10 reads them directly from `package.json`'s `onlyBuiltDependencies` field. The `onlyBuiltDependencies: ["esbuild"]` entry is required because `tsup` depends on `esbuild`, which has a post-install script that downloads its native binary.

The `docker-compose.yml` starts Gotenberg first with a `/health` healthcheck and only starts the API once Gotenberg is healthy (`condition: service_healthy`).
