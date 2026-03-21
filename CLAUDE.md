# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

This is a Next.js 16 application for a GEO (Generative Engine Optimization) content optimization platform. It serves three user roles:
- **Customers**: Submit content for optimization and track tickets
- **Optimizers**: Process optimization tickets and deliver results
- **Admins**: Manage users, customers, projects, and quota packages

**Important**: This is NOT the Next.js you know. This version uses Next.js 16 with breaking changes — APIs, conventions, and file structure may differ from training data. Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

## Development Commands

```bash
# Development server (use pnpm)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

## Architecture

### Directory Structure

```
app/
├── (auth)/              # Auth route group (login, etc.)
├── (dashboard)/         # Protected dashboard routes with auth layout
│   ├── admin/          # Admin-only pages
│   ├── optimizer/      # Optimizer pages
│   └── tickets/        # Customer ticket management
├── layout.tsx          # Root layout with providers
└── globals.css         # Global styles with theme variables

components/
├── ui/                 # Base UI components (@base-ui/react primitives)
├── admin/              # Admin-specific components (DataTable, FormDialog, etc.)
├── layout/             # Layout components (Sidebar)
├── providers/          # Context providers (ThemeProvider)
├── quota/              # Quota-related components
└── ticket/             # Ticket-related components

lib/
├── api.ts              # Centralized API layer
├── contexts/           # React contexts (AuthContext)
├── types.ts            # TypeScript type definitions
└── utils.ts            # Utilities (cn for class merging)
```

### Key Patterns

**Route Groups**: Parentheses in directory names `(auth)`, `(dashboard)` create route groups that don't affect URL structure but allow shared layouts/middleware.

**Protected Routes**: The `(dashboard)` group has a layout that checks authentication and redirects to `/login` if unauthenticated.

**Role-Based Navigation**: The Sidebar component renders different navigation items based on `user.role` (admin/optimizer/customer).

**API Communication**: All backend communication goes through `lib/api.ts`, which:
- Handles JWT tokens from localStorage
- Auto-redirects to login on 401 responses
- Organizes APIs by domain (customer, optimizer, admin)
- Uses a configurable `NEXT_PUBLIC_API_URL` (defaults to localhost:8080)

**Authentication Flow**:
1. Login via `/login` stores tokens in localStorage
2. AuthContext provides `user`, `token`, `login`, `logout` to the app
3. Dashboard layout checks `isAuthenticated` before rendering

**UI Components**:
- Base components use `@base-ui/react` (unstyled headless components)
- Styled with Tailwind CSS v4 and semantic color variables
- Dark mode via `next-themes` with class-based strategy
- Use `cn()` utility from `lib/utils.ts` to merge classes

### Styling System

**Theme Variables**: Colors are defined as CSS variables in `app/globals.css` using HSL values. Always use semantic classes like `bg-primary`, `text-muted-foreground`, `border-border` instead of hardcoded colors.

**Dark Mode**: The app supports dark mode via `.dark` class on the html element. Theme variables are redefined for dark mode. Use semantic color classes to ensure automatic dark mode support.

**Component Variants**: UI components use `class-variance-authority` (cva) for variant definitions. See `components/ui/button.tsx` for the pattern.

### Admin Components Pattern

Admin pages use reusable components:
- **DataTable**: Generic table with column definitions and row click handlers
- **FormDialog**: Modal form with submit/cancel actions and loading states
- **ConfirmDialog**: Confirmation modal for destructive actions
- **StepWizard**: Multi-step form wizard

When creating new admin pages, follow these patterns for consistency.

### TypeScript

Strict mode is enabled. All types should be defined in `lib/types.ts` and imported from there. Common types:
- `User`, `Customer`, `Project`, `Ticket`
- `UserRole`, `TicketStatus`
- `QuotaPackage`, `QuotaHistory`

### Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`). Import like: `@/lib/api`, `@/components/ui/button`.

## Environment

The backend API URL is configured via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8080`).

## Common Tasks

**Adding a new admin page**:
1. Create page in `app/(dashboard)/admin/[resource]/page.tsx`
2. Use DataTable, FormDialog components for consistency
3. Add API methods to `lib/api.ts` under the `admin` namespace
4. Define types in `lib/types.ts`
5. Add navigation to Sidebar component

**Adding a new UI component**:
1. Create in `components/ui/[name].tsx`
2. Use `@base-ui/react` primitives as the base
3. Style with Tailwind semantic color classes
4. Use cva for variants if needed
5. Export both the component and variant props if applicable

**Creating a new ticket-related page**:
1. Create in `app/(dashboard)/tickets/[path]/page.tsx`
2. Use api.customer or api.optimizer methods depending on user role
3. Consider using optimization-history and ticket-status components

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Optimizer | optimizer@test.com | optimizer123 |
| Customer | customer@test.com | customer123 |
