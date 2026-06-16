# ShaadiHub Backend (Milestone 1)

Professional Node.js + TypeScript backend for Vendor Module.

## Stack

- Node.js, Express, TypeScript
- Prisma + PostgreSQL
- Zod validation with shared package
- JWT auth

## Supabase Setup

1. Create a new project in Supabase.

2. Open: Project Settings > Database > Connection string.

3. Copy both URLs:

- Transaction pooler URL (port 6543) for `DATABASE_URL`
- Direct connection URL (port 5432) for `DIRECT_URL`

4. Update `.env` from `.env.example` and fill:

- `DATABASE_URL` with pooler URL and query params:
   - `pgbouncer=true`
   - `connection_limit=1`
   - `sslmode=require`
- `DIRECT_URL` with direct DB URL and `sslmode=require`

5. Keep your DB password and project ref secure. Do not commit `.env`.

## Project Structure

- apps/api: Backend API
- packages/shared: Shared zod contracts

## Quick Start

1. Install dependencies:

   npm install

2. Create env:

   cp .env.example .env

3. Generate Prisma client and run migration:

   npm run prisma:generate -w apps/api
   npm run prisma:migrate -w apps/api

4. Start dev server:

   npm run dev:api

5. Verify health:

   curl http://localhost:4000/api/health

## Useful Commands

- npm run lint:api
- npm run test:api
- npm run build:api
- npm run start:api
# Subhdin_be
# Subhdin_be
