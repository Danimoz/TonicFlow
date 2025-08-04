import { Music2 } from "lucide-react";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background mesh gradient */}
      <div className="fixed inset-0 bg-(image:--gradient-mesh) opacity-80" />
      
      {/* Additional background elements for visual depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Auth container with responsive layout */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo/Brand with responsive sizing */}
        <div className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
          <Music2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200"
          >
            Tonic Flow
          </Link>
        </div>

        {/* Auth content with responsive width */}
        <div className="w-full max-w-sm sm:max-w-md">
          {children}
        </div>

        {/* Footer with responsive spacing */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Tonic Flow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}