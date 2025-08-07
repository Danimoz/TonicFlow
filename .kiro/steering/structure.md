# Project Structure

## Monorepo Organization

This is a Turborepo monorepo with a clear separation between applications and shared packages:

```
tonic-flow/
├── apps/                    # Applications
│   ├── api/                # NestJS backend API
│   └── web/                # Next.js frontend
├── packages/               # Shared packages
│   ├── db/                 # Database layer (Prisma)
│   ├── ui/                 # UI component library
│   ├── eslint-config/      # Shared ESLint configs
│   ├── jest-config/        # Shared Jest configs
│   └── typescript-config/  # Shared TypeScript configs
└── [config files]         # Root configuration
```

## Applications (`apps/`)

### Backend API (`apps/api/`)
- **Framework**: NestJS with modular architecture
- **Structure**: Controllers, Services, DTOs, Guards, Decorators
- **Database**: Prisma integration via `@repo/db`
- **Authentication**: JWT + OAuth modules
- **Testing**: Unit tests in `src/`, e2e tests in `test/`

### Frontend Web (`apps/web/`)
- **Framework**: Next.js 15 with App Router
- **Structure**: App directory structure with Server Components
- **Components**: Page components, layouts, and UI components
- **Styling**: Tailwind CSS with component-level styles
- **State**: Server state via Server Components, client state as needed

## Shared Packages (`packages/`)

### Database (`@repo/db`)
- **Purpose**: Centralized database schema and client
- **Contents**: Prisma schema, migrations, generated client
- **Usage**: Imported by backend API and potentially frontend
- **Build**: TypeScript compilation with tsup

### UI Library (`@repo/ui`)
- **Purpose**: Reusable React components
- **Base**: Radix UI primitives with Tailwind styling
- **Components**: Form elements, layouts, navigation, feedback
- **Exports**: Individual component exports for tree-shaking

### Configuration Packages
- **ESLint Config**: Base, library, NestJS, Next.js, React configurations
- **Jest Config**: Base, NestJS, Next.js test configurations  
- **TypeScript Config**: Base, NestJS, Next.js, React library configurations

## File Naming Conventions

### Backend (NestJS)
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Guards**: `*.guard.ts`
- **Decorators**: `*.decorator.ts`
- **Tests**: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)

### Frontend (Next.js)
- **Pages**: `page.tsx` (App Router)
- **Layouts**: `layout.tsx`
- **Loading**: `loading.tsx`
- **Error**: `error.tsx`
- **Components**: PascalCase `.tsx` files
- **Utilities**: camelCase `.ts` files
- **Tests**: `*.test.tsx` or `*.spec.tsx`

### Shared Packages
- **Components**: PascalCase `.tsx` files
- **Utilities**: camelCase `.ts` files
- **Types**: `types.ts` or `*.types.ts`
- **Constants**: `constants.ts`

## Import Conventions

### Workspace Dependencies
```typescript
// Database access
import { prisma } from '@repo/db'

// UI components
import { Button, Input } from '@repo/ui/components/form'

// Shared configs (tsconfig.json)
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    // …
  }
}
### Internal Imports
```typescript
// Relative imports for same package
import { UserService } from './user.service'
import { CreateUserDto } from '../dto/create-user.dto'

// Absolute imports from src root (if configured)
import { AuthGuard } from 'src/auth/guards/auth.guard'
```

## Environment Configuration

### Backend (`apps/api/.env`)
- Database connection strings
- JWT secrets and expiration times
- OAuth credentials (Google)
- Frontend URL for CORS

### Frontend (`apps/web/.env.local`)
- Backend API base URL
- Environment-specific settings
- Cookie domain configuration

## Build Outputs

- **Backend**: `apps/api/dist/` - Compiled JavaScript
- **Frontend**: `apps/web/.next/` - Next.js build output
- **Packages**: `packages/*/dist/` - Compiled shared packages

## Development Workflow

1. **Root Level**: Use Turborepo commands for orchestration
2. **App Level**: Navigate to specific app for focused development
3. **Package Level**: Develop shared packages independently
4. **Database**: Run migrations from `packages/db` or root level
5. **Testing**: Run tests at root level or per package/app