# Technology Stack

## Build System & Package Management

- **Monorepo**: Turborepo for build orchestration and caching
- **Package Manager**: pnpm (v10.14.0) with workspace support
- **Node.js**: v18+ required

## Backend Stack (`apps/api`)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js (Google OAuth 2.0, local strategy)
- **Security**: bcrypt for password hashing
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with supertest for e2e testing
- **Build**: SWC compiler for fast builds

## Frontend Stack (`apps/web`)

- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: Radix UI primitives with custom component library
- **State Management**: React Server Components + client state
- **Validation**: Zod for type-safe schemas
- **Icons**: Lucide React
- **Local Storage**: Dexie (IndexedDB wrapper)
- **Testing**: Jest with Testing Library and jsdom

## Shared Packages

- **Database** (`@repo/db`): Prisma client with shared models, built with tsup
- **UI Library** (`@repo/ui`): Reusable components with Radix UI + Tailwind
- **Configuration**: Shared ESLint, Jest, and TypeScript configurations

## Development Tools

- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with shared configuration
- **Type Checking**: TypeScript with strict mode
- **Git Hooks**: Pre-commit hooks for code quality

## Common Commands

### Development
```bash
# Start all applications
turbo dev

# Start specific app
turbo dev --filter=api
turbo dev --filter=web

# Individual app development
cd apps/api && pnpm dev    # Backend on :4000
cd apps/web && pnpm dev    # Frontend on :3000
```

### Building
```bash
# Build all applications
turbo build

# Build specific app
turbo build --filter=api
turbo build --filter=web
```

### Database Operations
```bash
# Generate Prisma client
turbo db:generate

# Run database migrations
turbo db:migrate

# Or from db package
cd packages/db && pnpm db:generate && pnpm db:migrate
```

### Testing
```bash
# Run all tests
turbo test

# Run tests with coverage
turbo test:cov

# Run e2e tests
turbo test:e2e

# Watch mode for specific app
cd apps/api && pnpm test:watch
```

### Code Quality
```bash
# Lint all packages
turbo lint

# Format code
pnpm format

# Type checking
turbo type-check
```

## Environment Requirements

- Node.js 18+
- PostgreSQL database
- pnpm package manager
- Environment variables configured for both apps (.env files)