'use client';

import { Music2, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background mesh gradient */}
      <div className="fixed inset-0 bg-(image:--gradient-mesh) opacity-80" />

      {/* Additional background elements for visual depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* 404 container with responsive layout */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Logo/Brand with responsive sizing */}
        <div className="mb-8 sm:mb-12 flex items-center gap-2 sm:gap-3">
          <Music2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200"
          >
            Tonic Flow
          </Link>
        </div>

        {/* 404 content */}
        <div className="text-center max-w-md">
          {/* Large 404 number */}
          <div className="mb-6">
            <h1 className="text-8xl sm:text-9xl font-bold text-primary/20 leading-none">404</h1>
          </div>

          {/* Error message */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4"> Page Not Found</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back to creating beautiful music.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <Music2 className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Back link */}
          <div className="mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Footer with responsive spacing */}
        <div className="mt-12 sm:mt-16 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Tonic Flow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}