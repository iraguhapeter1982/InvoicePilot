# InvoicePilot AI Agent Instructions

InvoicePilot is a modern full-stack invoice management application built with React, Express, TypeScript, and PostgreSQL via Drizzle ORM.

## Architecture Overview

- **Monorepo Structure**: Client and server code coexist with shared schemas
- **Client**: React SPA with Vite, TanStack Query, Radix UI components, and Wouter routing
- **Server**: Express with TypeScript, Drizzle ORM, local email/password authentication
- **Database**: PostgreSQL with Drizzle schema-first approach
- **Shared**: Common types and schemas in `shared/schema.ts`

## Key Directory Structure

```
client/src/           # React frontend (Vite-bundled)
server/               # Express backend
shared/schema.ts      # Drizzle schemas & TypeScript types
server/services/      # PDF generation, email, templates
```

## Critical Development Patterns

### Database & Schema Management

**Always use the shared schema approach:**

- All database tables defined in `shared/schema.ts` using Drizzle ORM
- Import types from `@shared/schema` in both client and server
- Use `insertClientSchema`, `insertInvoiceSchema` for validation
- Run `npm run db:push` to apply schema changes (not migrations)

### Authentication Flow

**Local email/password authentication:**

- Traditional login/register forms with password confirmation
- Passport.js with LocalStrategy for authentication
- Password hashing with bcryptjs (10 rounds)
- Session-based authentication with PostgreSQL store
- Authentication state managed via TanStack Query: `useAuth()` hook
- Server middleware: `isAuthenticated` from `server/localAuth.ts`
- User ID accessed via `req.user.id` in authenticated routes

### API Patterns

**TanStack Query conventions:**

- Query keys match API endpoints: `queryKey: ["/api/clients"]`
- Use `apiRequest()` helper from `lib/queryClient.ts` for all API calls
- Handle 401s with `isUnauthorizedError()` utility
- Mutations invalidate related queries via `queryClient.invalidateQueries()`

### Component Architecture

**Radix UI + shadcn/ui pattern:**

- All UI components in `client/src/components/ui/` (Radix-based)
- Business components in `client/src/components/`
- Forms use React Hook Form + Zod validation
- Navigation via Wouter: `<Route path="/invoices" component={Invoices} />`

### PDF Generation System

**Template-based PDF generation:**

- Templates in `server/services/templates/` (Modern, Classic, Minimal)
- Registry pattern: `TemplateRegistry.get(templateName)`
- User branding colors applied via `TemplateConfig`
- Templates implement `InvoiceTemplate` interface

## Build & Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build client + server for production
npm run start        # Run production build
npm run db:push      # Push schema changes to database
npm run check        # TypeScript type checking
```

## Project-Specific Conventions

**File Import Aliases:**

- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

**Invoice Number Generation:**

- Auto-generated format: `INV-YYYY-XXX` where XXX increments per user
- Generated in `storage.getNextInvoiceNumber()`

**Data Layer Abstraction:**

- All database operations go through `server/storage.ts` interface
- Implements `IStorage` interface for testability
- Complex queries with joins handled in storage layer

**Styling Approach:**

- Tailwind CSS with custom gradient utilities
- Responsive-first design (`lg:`, `sm:` breakpoints)
- Dark/light theme support via `next-themes`

## Integration Points

**Stripe Integration (Optional):**

- Payment intents created in `/api/invoices/:id/payment-intent`
- Webhook handling for payment confirmations
- Gracefully degrades if `STRIPE_SECRET_KEY` not provided

**Email Service:**

- SendGrid integration for invoice delivery
- Email tracking (sent, opened timestamps)
- PDF attachments generated on-demand

**File Storage:**

- Logo uploads to `attached_assets/` directory
- PDF generation uses jsPDF with custom templates
- Assets served via Express static middleware

## Common Gotchas

- Always call `setupAuth(app)` before registering routes
- Invoice calculations happen server-side in storage layer
- Client-side forms validate against shared Zod schemas
- Use `credentials: "include"` for all API requests to maintain sessions
- PDF templates expect specific user branding properties (check for undefined)
