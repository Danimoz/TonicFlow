# Tonic Flow

A modern, full-stack music notation application specializing in tonic solfa notation (do-re-mi system). Built with cutting-edge technologies for musicians, educators, and students to create, collaborate on, and manage musical compositions.

## 🎵 Overview

Tonic Flow is a comprehensive music notation platform that bridges traditional tonic solfa methodology with modern web technology. The application provides an intuitive environment for creating musical compositions using the solfa system, complete with project management, real-time collaboration features, and advanced export capabilities.

## 🏗️ Architecture

This is a **monorepo** built with **Turborepo** featuring a modern full-stack architecture:

```
tonic-flow/
├── apps/
│   ├── api/           # NestJS backend API
│   └── web/           # Next.js 15 frontend
├── packages/
│   ├── db/            # Shared Prisma database layer
│   ├── ui/            # Shared UI component library
│   ├── eslint-config/ # Shared ESLint configurations
│   ├── jest-config/   # Shared Jest configurations
│   └── typescript-config/ # Shared TypeScript configurations
```

### Technology Stack

#### Backend (`apps/api`)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth 2.0
- **Security**: bcrypt password hashing, refresh token rotation
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with e2e testing

#### Frontend (`apps/web`)
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 + Radix UI components
- **Styling**: Tailwind CSS with CSS-in-JS
- **State Management**: React Server Components + Client State
- **Forms**: Zod validation with type-safe schemas
- **Data Fetching**: Server Actions + Client-side fetch

#### Shared Packages
- **Database** (`@repo/db`): Prisma client with shared models
- **UI Library** (`@repo/ui`): Reusable components with Radix UI
- **Configuration**: Shared ESLint, Jest, and TypeScript configs

## 🚀 Features

### ✅ Currently Implemented

#### Authentication & Security
- **JWT Authentication**: Secure token-based auth with httpOnly cookies
- **Google OAuth**: Single sign-on with Google accounts
- **Token Refresh**: Automatic token renewal and session management
- **Route Protection**: Middleware-based route guarding
- **Password Security**: bcrypt hashing with salt rounds

#### Project Management
- **CRUD Operations**: Create, read, update, delete musical projects
- **Rich Metadata**: Composer, arranger, key signature, time signature, tempo
- **Version Control**: Track project versions and changes
- **Search & Filter**: Real-time search with server-side pagination
- **User Isolation**: Multi-tenant architecture with user-specific projects

#### User Interface
- **Responsive Design**: Mobile-first, accessible UI components
- **Dark/Light Themes**: Customizable appearance
- **Loading States**: Skeleton loading and optimistic updates
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Form Validation**: Type-safe forms with Zod schemas

### 🔄 In Development

#### Music Notation Engine
- **Text-Based Editor**: Intuitive tonic solfa input system
- **SVG Rendering**: Professional-quality music engraving
- **Real-time Preview**: Live notation as you type
- **Playback Engine**: Web Audio API integration

#### Collaboration Features
- **Real-time Editing**: Collaborative music composition
- **Share & Permissions**: Project sharing with role-based access
- **Comment System**: Inline musical annotations
- **Version History**: Track and revert changes

### 🎯 Planned Features

#### Export & Import
- **Multiple Formats**: PDF, MIDI, MusicXML, .tsolfa
- **Print Layouts**: Professional sheet music formatting
- **Batch Export**: Multiple project export
- **Import Support**: Convert from standard formats

#### Advanced Tools
- **Template Library**: Pre-built musical forms and structures
- **Transposition**: Automatic key change utilities
- **Harmony Analysis**: Chord progression suggestions
- **Audio Recording**: Voice/instrument recording integration

## 📊 Database Schema

The application uses a PostgreSQL database with the following core models:

### User Model
```typescript
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  fullName     String
  password     String?   // null for OAuth users
  refreshToken String?   // for JWT refresh
  projects     Project[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

### Project Model
```typescript
model Project {
  id                     String    @id @default(cuid())
  userId                 String
  title                  String
  subTitle               String?
  composer               String?
  arranger               String?
  keySignature           String?
  timeSignature          String?
  yearOfComposition      Int?
  tempo                  String?
  currentNotationContent String
  user                   User      @relation(fields: [userId], references: [id])
  versions               ProjectVersion[]
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}
```

### ProjectVersion Model
```typescript
model ProjectVersion {
  id              String   @id @default(cuid())
  projectId       String
  notationContent String
  versionType     String   // 'manual', 'auto', 'backup'
  project         Project  @relation(fields: [projectId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ 
- **pnpm** 10+ (recommended package manager)
- **PostgreSQL** database
- **Git** for version control

### Environment Configuration

Create environment files for both applications:

#### Backend (`apps/api/.env`)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tonic_flow"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_TOKEN_EXPIRATION_TIME="7d"
JWT_REFRESH_TOKEN_EXPIRATION_TIME="30d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (`apps/web/.env.local`)
```env
# Backend API
BACKEND_BASE_URL="http://localhost:4000"

# Environment
NODE_ENV="development"

# Cookie Configuration
COOKIE_DOMAIN="localhost"
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tonic-flow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   cd packages/db
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   ```

4. **Start development servers**
   ```bash
   # Start all applications with Turbo
   turbo dev
   
   # Or start individually
   pnpm dev:api    # Backend on :4000
   pnpm dev:web    # Frontend on :3000
   ```

### Available Scripts

#### Root Level
```bash
turbo dev         # Start all applications
turbo build       # Build all applications
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
```

#### Backend (`apps/api`)
```bash
pnpm dev          # Start in development mode
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run unit tests
pnpm test:e2e     # Run end-to-end tests
```

#### Frontend (`apps/web`)
```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint TypeScript/React code
```

## 🧪 Testing

The project includes comprehensive testing strategies:

### Backend Testing
- **Unit Tests**: Service and controller testing with Jest
- **Integration Tests**: Database and API endpoint testing
- **E2E Tests**: Full application flow testing

### Frontend Testing
- **Component Tests**: React component testing with Testing Library
- **Integration Tests**: User interaction and navigation testing
- **Visual Tests**: Storybook integration (planned)

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Backend specific
cd apps/api && pnpm test:e2e

# Frontend specific
cd apps/web && pnpm test
```

## 🚀 Deployment

### Production Build
```bash
# Build all applications with Turbo
turbo build

# Build specific apps
turbo build --filter=api
turbo build --filter=web
```

### Environment Variables
Ensure all production environment variables are configured:
- Database connection strings
- JWT secrets (use strong, unique values)
- OAuth credentials
- CORS origins
- SSL certificates (recommended)

### Recommended Hosting
- **Backend**: Railway, Heroku, or DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Database**: Railway PostgreSQL, Supabase, or AWS RDS

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Add tests**: Ensure your code is well-tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow ESLint and Prettier configurations
- **Type Safety**: Maintain strict TypeScript usage
- **Testing**: Write tests for new features
- **Documentation**: Update README and inline docs
- **Commits**: Use conventional commit messages

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Daniel Azubuine**
- GitHub: [@danielazubuine](https://github.com/danimoz)
- Email: [daniel@example.com](mailto:azubuinedaniel05@gmail.com)

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Prisma** for the excellent database toolkit
- **NestJS** for the robust backend framework
- **Next.js** team for the incredible React framework
- **Turborepo** for monorepo management
- The open-source community for inspiration and tools

---

**Happy composing! 🎶**