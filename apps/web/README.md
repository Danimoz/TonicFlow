# Tonic Flow

A modern web-based music notation software focused on tonic solfa notation. Built with Next.js 15, React 19, and TypeScript.

## 🎵 About

Tonic Flow is a comprehensive music notation application that specializes in tonic solfa notation (do-re-mi system). It provides musicians, educators, and students with an intuitive platform to create, edit, and manage musical compositions using the traditional solfa system.

### Features

- **Project Management**: Create, organize, and manage multiple music notation projects
- **Search & Filter**: Advanced search functionality with server-side pagination
- **Authentication**: Secure user authentication with JWT and Google OAuth
- **Real-time Collaboration**: (Coming Soon) Share and collaborate on musical projects
- **Export Options**: (Coming Soon) Export to various formats including PDF and MIDI
- **Template Library**: (Coming Soon) Pre-built templates for common musical forms

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend API server running (see backend README)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tonic-flow/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **HTTP Client**: Custom fetcher with automatic token refresh


## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── projects/      # Individual project pages
│   │   ├── actions.ts     # Server actions
│   │   └── types.ts       # TypeScript types
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix)
│   ├── navbar.tsx        # Navigation component
│   └── new-project-modal.tsx
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
└── lib/                  # Utility functions
    ├── auth.ts           # Authentication utilities
    ├── fetcher.ts        # HTTP client
    └── utils.ts          # General utilities
```

## 🎯 Key Features Implemented

### Authentication System
- JWT-based authentication with httpOnly cookies
- Google OAuth integration
- Automatic token refresh
- Protected routes with middleware

### Project Management
- Create, read, update, delete projects
- Server-side pagination and search
- Real-time search with debouncing
- Project metadata (composer, key signature, etc.)

### User Interface
- Modern, responsive design
- Dark/light mode support
- Accessible components with Radix UI
- Loading states and error handling

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project follows modern development practices:
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture
- Server-side rendering and data fetching

## 🎼 Music Notation

The core music notation features are designed around the tonic solfa system:
- **Do, Re, Mi, Fa, Sol, La, Ti** notation
- **Hand signs** integration (planned)
- **Moveable Do** system support
- **Traditional notation** conversion (planned)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎵 About Tonic Solfa

Tonic solfa is a pedagogical technique for teaching sight-singing, invented by Sarah Ann Glover (1786–1867) of Norwich, England, and popularized by John Curwen. It uses the syllables Do, Re, Mi, Fa, Sol, La, Ti to represent the seven degrees of a major scale.

---

Built with ❤️ for music educators and enthusiasts worldwide.
