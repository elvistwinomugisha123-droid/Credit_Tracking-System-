# Credit Management Web Application

A web-based credit and loan management platform built for a single business owner in Uganda who gives out cash loans and service-based credit to customers.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js 20, Express, TypeScript, Prisma
- **Database:** SQLite (development), PostgreSQL (production)
- **Package Manager:** pnpm

## Repository Structure

```
credit-manager/
├── apps/
│   ├── web/              ← React 19 + TypeScript frontend (Vite)
│   └── api/              ← Node.js + Express + TypeScript backend
├── packages/
│   └── types/            ← Shared TypeScript types used by both apps
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md
```

## Getting Started

### Prerequisites

- Node.js 20 LTS
- pnpm

### Installation

```bash
pnpm install
```

### Development

Run the API and web app in separate terminals:

```bash
pnpm dev:api    # Starts Express backend on port 3001
pnpm dev:web    # Starts Vite dev server
```

### Database

```bash
# Create and apply migrations
pnpm --filter api exec prisma migrate dev --name <migration-name>

# Regenerate Prisma client
pnpm --filter api exec prisma generate

# Open database browser
pnpm --filter api exec prisma studio
```

### Build

```bash
pnpm build:api
pnpm build:web
```

## Client

Mugabe Rogers

## Developer

Twinomugisha
