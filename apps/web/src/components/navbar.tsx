'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";
import { ListMusic, Music2, X } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import LogoutButton from "./logout-button";
import { Button } from "@repo/ui/components/button";

const navLinks = [
  { name: "Demo", href: "/#demo" },
  { name: "Testimonials", href: "/#testimonials" },
  // { name: "Pricing", href: "/#pricing" },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setIsScrolled(window.scrollY > heroHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500",
      isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/40" : "bg-transparent",
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Music2 className="h-5 w-5" />
            <span className={cn("text-xl font-bold transition-colors duraion-300")}>
              Tonic Flow
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-foreground after:bg-primary",
                  "relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex gap-4">
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <LogoutButton
                    variant="ghost"
                    size="sm"
                    className="transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted"
                  />

                  <Button
                    size="sm"
                    className="transition-all duration-300 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                    asChild
                  >
                    <Link href='/dashboard'>
                      Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className="transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    size='sm'
                    asChild
                    className={cn(
                      "transition-all duration-300",
                      isScrolled ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg" : "bg-white text-primary hover:bg-white/90"
                    )}>
                    <Link href="/register">
                      Get Started
                    </Link>
                  </Button>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden transition-colors duration-300 text-foreground"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <ListMusic className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={cn(
            "lg:hidden border-t transition-all duration-300",
            isScrolled ? "border-border/40 bg-background/95" : "border-white/20"
          )}>
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-sm font-medium transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {!isLoading && (
                  isAuthenticated ? (
                    <LogoutButton
                      variant="ghost"
                      size="sm"
                      className="w-full transition-all duration-300 text-muted-foreground hover:text-foreground"
                    />
                  ) : (
                    <>
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                        className="w-full transition-all duration-300 text-muted-foreground hover:text-foreground"
                      >
                        <Link href="/login">
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                        className="w-full transition-all duration-300 bg-primary hover:bg-primary/90 text-white"
                      >
                        <Link href="/register">
                          Get Started
                        </Link>
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}