# Production Deployment Guide

## Overview

Deploy the **Next.js frontend** (e.g. Vercel) separately from the **NestJS API** (e.g. Railway, Fly.io, Docker). This document covers the frontend; API production steps live in [nestjs-fsd-template/docs/PRODUCTION.md](https://github.com/devTugu/nestjs-fsd-template/blob/main/docs/PRODUCTION.md).

## Prerequisites

- Node.js 18+
- Production NestJS API with HTTPS
- Git repository connected to your host (Vercel recommended for Next.js)

## Environment variables

Set in your hosting provider (Vercel **Project Settings → Environment Variables**):

| Variable | Production example | Notes |
|----------|-------------------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.yourdomain.com/api/v1` | Must include `/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `Admin Console` | Shown in sidebar/header |

> `NEXT_PUBLIC_*` values are embedded in the client bundle. Never put secrets here.

## Backend CORS

On the API, set `CORS_ORIGIN` to your exact frontend origin:

```
CORS_ORIGIN=https://your-app.vercel.app
```

No trailing slash. Wildcards are not recommended in production.

## Vercel deployment

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add NEXT_PUBLIC_APP_NAME
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard for automatic preview and production deploys.

### Build settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build command | `npm run build` |
| Output | Default (`.next`) |
| Node version | 20.x |

## Auth and cookies

- Primary session: **Bearer JWT** in `localStorage` (API requests).
- **Middleware** reads an `accessToken` cookie set on login for route protection.
- Ensure API and frontend are on HTTPS so tokens are not sent over plain HTTP.

## Security headers

Configured in [`next.config.ts`](../next.config.ts):

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

Review and extend for your compliance requirements.

## Pre-release checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` correct for production
- [ ] API `CORS_ORIGIN` matches frontend URL
- [ ] API `SWAGGER_ENABLED=false`
- [ ] API JWT secrets rotated and strong (32+ chars)
- [ ] `npm run build` succeeds locally with production env
- [ ] Smoke test: login → dashboard → users/roles/permissions CRUD
- [ ] CI green on `main`

## Verification

```bash
npm ci
npm run lint
npm run typecheck
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1 npm run build
```

## E2E before release (recommended)

```bash
# API + frontend running locally or against staging
npm run test:e2e
```

## Rollback

- **Vercel:** promote a previous deployment from the dashboard.
- **API:** follow backend rollback procedure; frontend is stateless.

## Observability

- Use Vercel Analytics / Speed Insights as needed.
- API errors surface via Sonner toasts (403) and redirect on auth failure (401).
- Add Sentry or similar in `shared/api` interceptors for production error tracking.
