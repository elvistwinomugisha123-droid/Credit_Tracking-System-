# CLAUDE.md — Credit Management Web Application

> This is the single source of truth for this project.
> Read this entire file before writing any code, suggesting any architecture, or making any changes.
> Every session starts here.

---

## Project Identity

| Field | Value |
|---|---|
| **Project Name** | Credit Management Web Application |
| **Client** | Mugabe Rogers |
| **Developer** | Twinomugisha |
| **PRD Version** | v2.0 |
| **CLAUDE.md Version** | 2.0 |
| **Delivery Target** | 1 week from project confirmation |
| **Status** | In Development |

---

## What This App Is — Read This First

This is a **web-based credit and loan management platform** built for a single business owner
in Uganda who gives out cash loans and service-based credit to customers.

Before this app, the owner tracked everything in a **physical notebook** — who borrowed money,
how much, when they paid, who still owes. This is slow, error-prone, and gives no visibility
into the overall business financial picture.

This app **replaces that notebook** with a secure, structured, mobile-friendly digital platform
that the owner can use from their phone or computer. It is not a banking system. It is not
multi-tenant SaaS. It is a **single-owner, single-admin tool** for one lending business.

### The 5 questions this app must always be able to answer:
1. Who owes me money right now?
2. How much does each person owe?
3. Who is overdue and by how long?
4. How much have I collected this month?
5. What is the full history of any specific customer?

Every feature, every screen, every API endpoint exists to answer one or more of these questions.
If a feature does not serve these questions, it is out of scope for Version 1.

---

## What the App Does — Full Feature Description

### Customer Management
The owner adds customers by name and phone number only — no complex onboarding.
Each customer has a profile that shows everything about their borrowing history:
total borrowed, total paid, total outstanding, and a full list of every credit and
every payment ever made. Customers are searchable instantly by name or phone number.

### Credit Creation (Loans & Service Credit)
The owner creates a credit entry when giving out money or providing a service on credit.
A credit can be a **cash loan** or a **service-based credit** (a service valued in money).

Credit is flexible by design:
- Interest is **optional** — the owner enters it manually or leaves it at zero.
- A due date is **optional** — some borrowers have a deadline, others do not.
- Repayment type is configurable — one lump sum, an auto-generated installment schedule,
  or completely flexible payments with no schedule enforced.

The system automatically calculates total amount due, remaining balance, and payment
progress the moment a credit is created.

### Payment Recording
When a customer pays — in full or partially — the owner enters the amount and date.
The system immediately updates the outstanding balance, recalculates payment progress,
and changes the loan status automatically if the balance reaches zero.
Partial payments are fully supported and accumulate over time.

### Dashboard
The first screen after login. Gives the owner an instant snapshot of the entire business:
total money given out, total collected, total outstanding, how many credits are active,
which credits are due today, which are overdue, and this month's collection total.
No manual calculations required — everything is on one screen.

### Reports & Analytics
The owner generates filtered financial reports by today, this week, this month,
or a custom date range. Reports show who has paid, who has active balances, who is
overdue, who has not paid this month, credits issued in a period, total collections,
and the full outstanding portfolio value.

---

## Application Screens — Every Screen Defined

Claude must reference these definitions before generating any frontend code.
These are the complete screens for Version 1.

---

### Screen 1 — Login
**Route:** `/login`
**Purpose:** Authenticate the owner before any data is accessible.

**Contents:**
- App name at top
- Email or username input field (required)
- Password input field (required)
- Login button
- Inline error message area for failed login attempts

**Behaviour:**
- On successful login → redirect to Dashboard
- On failed login → show inline error, do not clear the fields
- If already authenticated → auto-redirect to Dashboard
- No registration screen — account is created manually in v1

---

### Screen 2 — Dashboard (Home)
**Route:** `/`
**Purpose:** Give the owner an instant financial snapshot on every login.

**Contents:**
- 7 metric cards (defined below)
- Quick action buttons: "Add Customer" and "New Credit"
- Recent activity feed — last 5 payments or credits created

**Metric Cards:**
| Card | Value |
|---|---|
| Total Money Issued | Cumulative sum of all principal amounts ever given out |
| Total Money Collected | Sum of all payments ever received |
| Total Outstanding | Remaining balance across all active credits |
| Active Credits | Count of all currently open credit entries |
| Due Today | Credits where due date equals today |
| Overdue Accounts | Credits past due date with balance greater than zero |
| This Month's Collections | Payments received in the current calendar month |

**Behaviour:**
- All data loads on mount via API
- Cards update dynamically — no full page refresh after payment is recorded
- Clicking "Due Today" card → navigates to Reports filtered to due today
- Clicking "Overdue Accounts" card → navigates to Reports filtered to overdue

---

### Screen 3 — Customer List
**Route:** `/customers`
**Purpose:** Browse, search, and navigate to any customer.

**Contents:**
- Search bar at top (searches name or phone number)
- "Add Customer" button
- List of all customers

**Each row shows:**
- Full name
- Phone number
- Total outstanding balance
- Status badge (Has Active Credits / All Cleared)

**Behaviour:**
- Search filters the list in real time as the owner types
- Clicking any customer row → navigates to Customer Profile
- Empty state message shown if no customers exist yet

---

### Screen 4 — Add Customer
**Route:** `/customers/new`
**Purpose:** Register a new borrower.

**Contents:**
- Name input (required)
- Phone number input (required)
- Save button
- Cancel button

**Behaviour:**
- On save → redirect to the new customer's profile page
- Validate: name and phone are required before saving
- Phone number must be unique — show inline error if duplicate found

---

### Screen 5 — Customer Profile
**Route:** `/customers/:id`
**Purpose:** Show everything about one customer in one place.

**Contents:**
- Customer name and phone number with an edit option
- Summary stats row: Total Borrowed | Total Paid | Total Outstanding
- "New Credit" button for this customer
- List of all credits — active ones at top, completed ones below
- Each credit row shows: amount, outstanding balance, status badge, due date if set
- Full payment history table: date, amount paid, which credit it applied to, running balance

**Behaviour:**
- Clicking a credit → navigates to Credit Detail screen
- "New Credit" button → navigates to New Credit Form with customer pre-filled
- Edit icon on name or phone → opens inline edit fields

---

### Screen 6 — New Credit Form
**Route:** `/credits/new` or `/customers/:id/credits/new`
**Purpose:** Create a new loan or service credit entry.

**Contents:**
- Customer selector (searchable dropdown) — pre-filled if coming from Customer Profile
- Credit type selector: Cash Loan | Service Credit
- Principal amount input (required)
- Date issued (required, defaults to today)
- Interest amount input (optional — blank means zero interest)
- Due date picker (optional — blank means open-ended)
- Repayment type selector: One-Time | Installment | Flexible
- If Installment selected → show number of installments input
- Live preview: Total Due and Monthly Payment (if installment)
- Submit button
- Cancel button

**Behaviour:**
- Total Due preview updates live as principal and interest are entered
- Installment schedule preview appears when repayment type is Installment
- On submit → redirect to the newly created Credit Detail page
- Validate all required fields before allowing submit

---

### Screen 7 — Credit Detail
**Route:** `/credits/:id`
**Purpose:** Show the full details and history of a single credit entry.

**Contents:**
- Customer name — clickable, navigates to Customer Profile
- Credit type badge (Cash Loan / Service Credit)
- Status badge — colour coded: Active = blue, Completed = green, Overdue = red
- Principal amount
- Interest amount (displays "No interest" if zero)
- Total amount due
- Amount paid so far
- Outstanding balance — displayed prominently, this is the key number
- Payment progress bar showing percentage paid
- Due date (displays "Open-ended" if not set)
- Repayment type
- Installment schedule table — shown only if repayment type is Installment
- Payment history table: date, amount paid, balance remaining after payment
- "Record Payment" button — hidden if status is Completed

**Behaviour:**
- Overdue banner displayed prominently at top if status is Overdue
- "Record Payment" button opens the Record Payment screen or modal

---

### Screen 8 — Record Payment
**Route:** `/credits/:id/payments/new`
**Purpose:** Log a payment made by the customer against a specific credit.

**Contents:**
- Customer name and credit summary at top (read-only context)
- Current outstanding balance displayed prominently
- Payment amount input (required)
- Payment date (required, defaults to today)
- Submit button
- Cancel button

**Behaviour:**
- Validate: payment amount must be greater than zero
- Validate: payment amount must not exceed current outstanding balance — show clear error if it does
- On submit → deduct from balance, update status if balance is now zero, redirect to Credit Detail
- Success confirmation message shows new outstanding balance after payment

---

### Screen 9 — Reports
**Route:** `/reports`
**Purpose:** View filtered financial analytics and business performance summaries.

**Contents:**
- Filter bar at top: Today | This Week | This Month | Custom Range
- Custom Range shows two date pickers (from date and to date)
- Report sections rendered below based on active filter

**Report Sections:**
| Section | Contents |
|---|---|
| Collections Summary | Total collected in period, number of payments made |
| Paid Customers | Customers who paid in period with amounts and dates |
| Active Balances | All customers with any outstanding balance remaining |
| Overdue Accounts | Customers past their due date with balance greater than zero |
| Non-Payers | Customers with zero payments recorded in the selected month |
| Credits Issued | New credits created within the selected period |
| Portfolio Value | Total outstanding balance across all active credits |

**Behaviour:**
- Default filter on page load is This Month
- Switching filter re-fetches data and re-renders all sections
- Each section shows a count summary and a data table
- Empty state message shown per section when no data exists for the filter

---

## User Journeys — How the Owner Uses the App

### Journey 1 — Giving out a new loan
1. Owner opens app → Dashboard
2. Taps "New Credit"
3. Searches for and selects customer
4. Enters principal, optionally sets interest and due date
5. Chooses repayment type
6. Submits → sees Credit Detail with full breakdown

### Journey 2 — Recording a payment
1. Owner opens app → searches for customer
2. Taps customer → Customer Profile
3. Sees active credit with outstanding balance
4. Taps "Record Payment"
5. Enters amount and date → submits
6. Sees updated balance immediately on Credit Detail

### Journey 3 — Checking who owes money
1. Owner opens app → Dashboard
2. Sees Total Outstanding and Overdue Accounts at a glance
3. Taps "Overdue Accounts" card → Reports filtered to overdue
4. Sees full list with amounts and how long overdue

### Journey 4 — Reviewing a customer's full history
1. Owner opens app → Customer List
2. Searches customer name
3. Taps customer → Customer Profile
4. Sees all credits and all payments in one view

### Journey 5 — Monthly performance check
1. Owner opens app → Reports
2. Filter is This Month by default
3. Sees total collected, who paid, who has not paid, and overdue list

---

## Repository Structure

Monorepo layout:

```
credit-manager/
├── apps/
│   ├── web/              ← React 19 + TypeScript frontend (Vite)
│   └── api/              ← Node.js + Express + TypeScript backend
├── packages/
│   └── types/            ← Shared TypeScript types used by both apps
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md             ← You are here
```

**Package manager: pnpm — always. Never npm or yarn.**

```bash
pnpm install                    # Install all workspaces
pnpm --filter web dev           # Run frontend
pnpm --filter api dev           # Run backend
```

---

## Confirmed Tech Stack

### Frontend (`apps/web`)
| Tool | Role |
|---|---|
| Vite | Build tool and dev server |
| React 19 | UI framework |
| TypeScript 5.x strict | Type safety |
| Tailwind CSS v3 | Utility-first styling |
| shadcn/ui | Accessible UI components (Radix + Tailwind) |
| Recharts | Dashboard charts and report visualisations |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |
| vite-plugin-pwa | PWA manifest and service worker for home-screen install |

### Backend (`apps/api`)
| Tool | Role |
|---|---|
| Node.js 20 LTS | Runtime |
| Express 4.x | HTTP framework |
| TypeScript 5.x strict | Type safety |
| Prisma | ORM and migrations |
| Zod | Request validation on all routes |
| jsonwebtoken | JWT authentication |
| bcrypt | Password hashing — minimum 10 salt rounds |
| dotenv | Environment variable management |

### Database
| Environment | Database |
|---|---|
| Local development | SQLite via Prisma — zero setup, file-based |
| Production | PostgreSQL on Render — managed, persistent |

> ⚠️ Never use SQLite in production on Render. The filesystem is ephemeral and will be
> wiped on every redeploy. PostgreSQL is mandatory in production.

### Hosting — Render
- Backend → Render Web Service (Node.js)
- Frontend → Render Static Site (Vite build output)
- Database → Render managed PostgreSQL
- SSL → Let's Encrypt, automatic and free

---

## File Structure

### Frontend (`apps/web/src`)
```
src/
├── components/
│   └── ui/               ← shadcn/ui components — do not edit manually
├── pages/                ← One file per screen
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CustomerListPage.tsx
│   ├── CustomerProfilePage.tsx
│   ├── NewCreditPage.tsx
│   ├── CreditDetailPage.tsx
│   ├── RecordPaymentPage.tsx
│   └── ReportsPage.tsx
├── features/             ← Feature-grouped components, hooks, and types
│   ├── auth/
│   ├── customers/
│   ├── credits/
│   ├── payments/
│   └── reports/
├── hooks/                ← Shared custom hooks
├── lib/                  ← Axios instance and utility functions
├── types/                ← Local TypeScript types
└── main.tsx
```

### Backend (`apps/api/src`)
```
src/
├── routes/               ← Express route definitions
├── controllers/          ← Request handlers — thin, delegate to services
├── services/             ← All business logic lives here
├── middleware/           ← Auth, error handling, Zod validation middleware
├── lib/                  ← Prisma client instance and JWT helpers
├── types/                ← Local TypeScript types
└── index.ts              ← Express app entry point
```

---

## Business Logic Rules — Never Violate These

| ID | Rule |
|---|---|
| BL-01 | Interest is always optional. Zero interest means Total Due equals Principal only — no calculation triggered. |
| BL-02 | Due date is always optional. A loan without a due date must NEVER become Overdue regardless of time elapsed. |
| BL-03 | Loan status is always derived automatically — never manually set by the user or hardcoded in logic. |
| BL-04 | Status = Active when balance > 0 AND (no due date set OR today is before due date). |
| BL-05 | Status = Completed when balance = 0, regardless of due date. |
| BL-06 | Status = Overdue when balance > 0 AND due date is set AND today is after due date. |
| BL-07 | Partial payments are fully supported. Any amount equal to or less than outstanding balance is valid. |
| BL-08 | Payment amount must never exceed current outstanding balance. Reject with a clear validation error. |
| BL-09 | Completed loans are locked — excluded from active and overdue counts everywhere in the app. |
| BL-10 | Installment type: system auto-generates the repayment schedule. The user never builds it manually. |
| BL-11 | Flexible type: no schedule generated or enforced. User records any amount on any date freely. |

---

## API Design

All routes are RESTful. All responses use this envelope:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, details?: ZodIssue[] }
```

All protected routes require: `Authorization: Bearer <token>`

All POST and PATCH routes must pass Zod validation before reaching the controller.

### Routes Reference
```
POST   /api/auth/login

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
GET    /api/customers/:id/history

POST   /api/credits
GET    /api/credits
GET    /api/credits/:id
PATCH  /api/credits/:id

POST   /api/payments
GET    /api/payments/credit/:creditId

GET    /api/dashboard
GET    /api/reports?filter=today|week|month|custom&from=&to=
```

---

## Database Models (High-Level)

```
User          ← admin login account (single in v1)
Customer      ← borrower profile (name, phone)
  └── Credit  ← loan or service credit entry
        └── Payment  ← individual payment record
```

Key field rules:
- `Credit.interestAmount` → nullable. Null means no interest applied.
- `Credit.dueDate` → nullable. Null means open-ended loan.
- `Credit.repaymentType` → enum: `ONE_TIME | INSTALLMENT | FLEXIBLE`
- `Credit.status` → enum: `ACTIVE | COMPLETED | OVERDUE` — always derived, never user-set.
- `Payment.amount` → must be positive and never exceed current outstanding balance.

---

## Security Rules — Non-Negotiable

1. Passwords hashed with bcrypt at minimum 10 salt rounds. Never stored or logged as plaintext.
2. JWTs must have a defined expiry. Always validated server-side via middleware on every protected route.
3. Every API endpoint that accepts a body must have a Zod validation schema. No exceptions.
4. All secrets live in `.env` files. Never hardcode JWT_SECRET, DATABASE_URL, or any credential.
5. Never concatenate raw SQL strings. Prisma's parameterised queries handle injection prevention.
6. Never expose stack traces, Prisma errors, or internal state in API responses.
7. HTTPS enforced at Render level in production.

---

## Coding Standards

- TypeScript strict mode on both frontend and backend. No `any` types — use `unknown` and narrow.
- Mixed functional and OOP style. Use functional for React components and data transforms.
  Use classes for service layer where they model a clear domain concept.
- `async/await` only — no `.then()` chains.
- No magic numbers — extract to named constants.
- Always handle the error case explicitly. No silent failures.
- Keep controllers thin — all business logic belongs in service files.
- No file longer than approximately 300 lines. Split into modules.

### Naming Conventions
| Context | Convention |
|---|---|
| Variables and functions | camelCase |
| React components | PascalCase |
| TypeScript types and interfaces | PascalCase |
| Prisma models | PascalCase |
| API route files | kebab-case |
| Environment variables | SCREAMING_SNAKE_CASE |

---

## What Claude Must Always Do

- Read this entire file before writing any code for this project.
- Apply all business logic rules (BL-01 to BL-11) to every relevant code decision.
- Match every frontend screen to its definition in the Screens section above.
- Flag security violations immediately — even in prototype or draft code.
- Use only the confirmed tech stack. Do not suggest alternatives unless explicitly asked.
- Write TypeScript — no plain `.js` files in `apps/web/src` or `apps/api/src`.
- Validate all API input with Zod before it reaches a controller or service.
- Use pnpm for all package commands.

## What Claude Must Never Do

- Use `any` type in TypeScript — use `unknown` and narrow it.
- Store or log plaintext passwords — not even in examples or comments.
- Skip Zod validation on any route that accepts a body.
- Hardcode secrets — not in code, not in comments, not in examples.
- Recommend or use SQLite in production for this project.
- Use `npm` or `yarn` — this project uses pnpm.
- Manually set `Credit.status` in code — it must always be derived from balance and due date.
- Expose Prisma errors or stack traces in API responses.
- Install or suggest Material UI — the design system is Tailwind + shadcn/ui.
- Use Create React App — this project uses Vite.

---

## Environment Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL="file:./dev.db"           # SQLite — local dev only
# DATABASE_URL="postgresql://..."       # PostgreSQL — production

JWT_SECRET="replace-with-strong-secret"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="development"
```

### Frontend (`apps/web/.env`)
```env
VITE_API_URL="http://localhost:3001"
# VITE_API_URL="https://your-api.onrender.com"    # Production
```

---

## Definition of Done

A feature is complete when:
- [ ] TypeScript compiles with zero errors in strict mode
- [ ] All relevant business logic rules (BL-01 to BL-11) are respected
- [ ] API routes have Zod validation on all request bodies
- [ ] Error cases are handled and return semantically correct HTTP status codes
- [ ] No secrets are hardcoded anywhere in the codebase
- [ ] The screen matches its definition in the Screens section of this file
- [ ] The feature works correctly on a 360px wide mobile screen

---

## Quick Command Reference

```bash
# Install all dependencies
pnpm install

# Start development — run these in two separate terminals
pnpm --filter api dev
pnpm --filter web dev

# Prisma — create and apply a migration
pnpm --filter api exec prisma migrate dev --name <migration-name>

# Prisma — regenerate client after schema changes
pnpm --filter api exec prisma generate

# Prisma — open visual database browser
pnpm --filter api exec prisma studio

# Build for production
pnpm --filter web build
pnpm --filter api build

# Type check without building
pnpm --filter web tsc --noEmit
pnpm --filter api tsc --noEmit
```

---

*CLAUDE.md v2.0 — Credit Management Web Application — Developer Internal Use*
*Client: Mugabe Rogers | Developer: Twinomugisha*
