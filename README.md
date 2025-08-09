# Healthcare Shift Tracker – Recruiter Technical Overview

## Project Summary
This is a full-stack, production-grade PWA for healthcare shift management, built with Next.js 14, React 18, TypeScript, Prisma, and PostgreSQL. It demonstrates advanced use of modern web technologies, scalable architecture, and best practices for authentication, state management, and UI/UX.

## Architecture & Key Decisions
- **Monorepo Structure:** Modular separation of API routes, UI components, hooks, and business logic for maintainability and scalability.
- **Type Safety:** TypeScript enforced throughout, with strict type-checking in CI/CD and build (see scripts).
- **API Layer:** Next.js API routes for authentication, analytics, and shift management. Prisma ORM for DB access.
- **Authentication:** JWT-based, secure HTTP-only cookies, role-based access (MANAGER/WORKER).
- **UI:** Ant Design + custom components, mobile-first, accessible, and responsive.
- **State Management:** React hooks, context providers for auth/location, minimal external state libraries.
- **Testing:** (Add if present) Unit/integration tests can be added with Jest/React Testing Library.
- **Deployment:** Vercel-ready, PWA enabled (service worker, manifest), optimized for cloud DB (Neon).

## Notable Features
- **Location-based clock in/out** with geofencing (perimeter management for managers)
- **Real-time analytics** for managers (shift stats, staff hours, distribution)
- **Role-based dashboards** (manager/worker separation)
- **Modern UI/UX** with Ant Design, custom charts, and mobile support

## How to Review
- See `components/` for reusable UI and providers
- See `app/api/` for API route logic (auth, analytics, shifts)
- See `prisma/schema.prisma` for DB schema
- See `lib/` for utility and DB connection logic
- See `hooks/` for custom React hooks

## Build & Type Safety
- `pnpm run build` runs `tsc --noEmit` before Next.js build to ensure all TypeScript errors are caught (see `package.json`)
- Linting via `next lint`

## Credentials & Secrets
- `.env.local` required for DB and JWT secret (see sample in repo)

## Contact
For technical questions, contact the author or see code comments for rationale and design choices.
   npm run dev
