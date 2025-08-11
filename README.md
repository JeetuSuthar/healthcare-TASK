
# Healthcare Shift Tracker – Reviewer Documentation

## Overview
This application is a full-stack healthcare shift management system built with Next.js, Prisma, and PostgreSQL. It enables managers and workers to track, analyze, and manage shift attendance, location compliance, and team activity in real time. The project was developed as a technical assignment to demonstrate practical skills in authentication, responsive UI, API design, and modern React/Next.js patterns.

## Code Structure & Organization

```
healthcare-shift-tracker/
├── app/                # Next.js app directory (App Router)
│   ├── api/            # All backend API routes (REST & GraphQL)
│   ├── auth/           # Auth pages (login, register)
│   ├── manager/        # Manager dashboard, analytics, staff
│   ├── worker/         # Worker dashboard, history
│   ├── globals.css     # Global styles (Tailwind + custom)
│   └── ...             # Layouts, manifests, etc.
├── components/         # Reusable React components
│   ├── layouts/        # Layout shells for manager/worker
│   ├── manager/        # Manager-specific UI widgets
│   ├── providers/      # Context providers (auth, location)
│   ├── ui/             # UI primitives (button, card, modal, etc.)
│   └── shift-history.tsx # Shared shift history table
├── hooks/              # Custom React hooks (auth, location, API)
├── lib/                # Utility functions, DB client
├── prisma/             # Prisma schema & migrations
├── public/             # Static assets
├── styles/             # (Legacy) global styles
├── package.json        # Project dependencies & scripts
├── README.md           # (This file)
└── ...
```

**Rationale:**
- `app/` uses Next.js App Router for clear separation of API, pages, and layouts.
- `components/` is split by concern (layout, UI, provider, feature) for reusability and clarity.
- `hooks/` and `lib/` isolate logic and utilities from UI.
- Prisma schema is versioned in `prisma/` for DB migrations and type safety.

## Features Attempted (from Assignment List)

- [x] **Authentication:**
   - Email/password login & registration
   - Google OAuth (with account selection, session management)
- [x] **Role-based dashboards:**
   - Manager and worker have distinct layouts, navigation, and content
- [x] **Shift management:**
   - Clock in/out, shift duration, location perimeter enforcement
   - Shift history (with IST time formatting, relative time, and notes)
- [x] **Location compliance:**
   - Workers can only clock in within a defined perimeter (configurable by manager)
- [x] **Analytics:**
   - Manager dashboard shows real-time stats, active staff, and shift analytics
- [x] **Responsive UI:**
   - Mobile-first layouts, custom hamburger/close icons, accessible overlays
   - Tables and dashboards adapt to small screens (horizontal scroll, compact cards)
- [x] **Custom dropdowns & modals:**
   - Tailwind-based, accessible, and mobile-friendly
- [x] **API design:**
   - REST endpoints for auth, shifts, settings
   - GraphQL endpoint for flexible data queries
- [x] **Error handling:**
   - User feedback for network/API errors, loading states, and edge cases
- [x] **Type safety:**
   - TypeScript throughout, Prisma for DB types

**Partial/Not Attempted:**
- [ ] Automated tests (unit/integration)
- [ ] Full audit logging/history for all actions
- [ ] Advanced analytics (custom reports, exports)
- [ ] Multi-org/tenant support

## How to Run Locally

1. **Clone the repo:**
    ```sh
    git clone <repo-url>
    cd healthcare-shift-tracker
    ```
2. **Install dependencies:**
    ```sh
    pnpm install
    # or
    npm install
    ```
3. **Set up environment variables:**
    - Copy `.env.example` to `.env.local` and fill in:
       - `DATABASE_URL` (Postgres connection string)
       - `JWT_SECRET` (for auth)
       - Google OAuth client ID/secret (if using Google login)
4. **Run database migrations:**
    ```sh
    pnpm exec prisma migrate dev
    ```
5. **Start the dev server:**
    ```sh
    pnpm dev
    # or
    npm run dev
    ```
6. **Access the app:**
    - Open [http://localhost:3000](http://localhost:3000)

## Special Considerations & Reviewer Notes

- **Design Decisions:**
   - Used Next.js App Router for modern routing and API co-location.
   - Tailwind CSS for rapid, consistent, and responsive UI.
   - Custom dropdowns and modals for accessibility and mobile reliability.
   - IST time formatting and relative time for all shift history (see `components/shift-history.tsx`).
   - Defensive date parsing to avoid "Invalid Date" UI bugs.
- **Known Limitations:**
   - No automated tests (manual QA only).
   - No email verification or password reset flows.
   - Some analytics are basic (can be extended).
   - Only the latest 50 shifts are shown in history for performance.
- **Tips for Reviewers:**
   - Try both manager and worker roles (register as both, or change role in DB).
   - Test Google login and location-based clock-in (location can be mocked in browser).
   - Review `components/shift-history.tsx` for the main table logic and formatting.
   - All API endpoints are in `app/api/`; GraphQL is at `/api/graphql`.
   - Prisma schema (`prisma/schema.prisma`) is the source of truth for data model.

---

**Thank you for reviewing!**
If you have questions about design choices, tradeoffs, or want to see specific code, please reach out or check the code comments for rationale.
