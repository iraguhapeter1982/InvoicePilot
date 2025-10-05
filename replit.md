# Overview

InvoiceFlow is a professional invoicing application built with a modern full-stack architecture. The system enables users to create, manage, and track invoices with integrated payment processing through Stripe. It features client management, email notifications, PDF generation, and comprehensive dashboard analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

- **Framework**: React with TypeScript using Vite for development and building
- **Routing**: Wouter for client-side routing with authentication-based route protection
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation schemas for type-safe form handling

## Backend Architecture

- **Framework**: Express.js with TypeScript for the REST API server
- **Authentication**: use email and password
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful endpoints with consistent error handling and request logging middleware

## Data Storage Solutions

- **Primary Database**: PostgreSQL with Neon serverless driver for scalability
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection Pooling**: Neon serverless connection pooling for optimal performance
- **Session Storage**: PostgreSQL table for user session persistence

## Authentication & Authorization

- **Provider**: Replit OIDC for seamless integration with the development environment
- **Session Strategy**: Secure HTTP-only cookies with configurable TTL (7 days default)
- **Route Protection**: Middleware-based authentication checks for protected API endpoints
- **User Management**: Automatic user creation and profile management with business information

## External Dependencies

### Payment Processing

- **Stripe**: Full payment processing integration with subscription management
- **Components**: React Stripe.js components for secure payment forms
- **Webhooks**: Stripe webhook handling for payment status updates

### Email Services

- **SendGrid**: Transactional email service for invoice delivery and notifications
- **Templates**: HTML email templates with tracking pixels for open notifications
- **Attachments**: PDF invoice attachments with professional formatting

### PDF Generation

- **jsPDF**: Client-side PDF generation for invoice documents
- **Features**: Professional invoice layouts with business branding and itemized billing

### Development Tools

- **Replit Integration**: Built-in development environment support with cartographer plugin
- **Error Handling**: Runtime error overlay for development debugging
- **Build System**: Vite for fast development and optimized production builds

### Database & Infrastructure

- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **WebSocket Support**: Real-time capabilities through WebSocket constructor configuration

The architecture emphasizes type safety throughout the stack with shared TypeScript schemas, modern development practices with hot reloading and error boundaries, and production-ready features including comprehensive error handling and logging.
