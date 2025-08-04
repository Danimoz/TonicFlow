'use client';

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { loginAction, getGoogleOAuthUrl } from "../actions";
import { AuthResult, LoginFormData } from "../types";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth errors in URL params
  const oauthError = searchParams.get('error');
  
  // Get redirect URL from search params (set by middleware)
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear previous errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setGeneralError('');

    // Submit form using server action (validation happens server-side)
    startTransition(async () => {
      const formDataObj = new FormData();
      formDataObj.append('email', formData.email);
      formDataObj.append('password', formData.password);

      const result: AuthResult = await loginAction(formDataObj);

      if (result.success) {
        router.push(redirectUrl);
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  };

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    try {
      const oauthUrl = await getGoogleOAuthUrl(redirectUrl);
      window.location.href = oauthUrl;
    } catch (error) {
      setGeneralError('Failed to initiate Google login. Please try again.');
    }
  };

  return (
    <Card className="shadow-elegant backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader className="text-center space-y-2 sm:space-y-3">
        <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          Sign in to your account to continue
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* OAuth Error Display */}
        {oauthError && (
          <div className="p-3 sm:p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {oauthError === 'oauth_failed' && 'Google login failed. Please try again.'}
            {oauthError === 'oauth_cancelled' && 'Google login was cancelled. You can try again if you wish.'}
            {oauthError === 'oauth_invalid' && 'Invalid login request. Please try again.'}
            {oauthError === 'oauth_server_error' && 'Google login is temporarily unavailable. Please try again later.'}
            {oauthError === 'oauth_incomplete' && 'Login incomplete. Please try again.'}
            {oauthError === 'oauth_invalid_tokens' && 'Authentication failed due to invalid credentials. Please try again.'}
            {oauthError === 'oauth_error' && 'An error occurred during login. Please try again.'}
            {oauthError === 'oauth_init_failed' && 'Could not initiate Google login. Please try again.'}
            {!['oauth_failed', 'oauth_cancelled', 'oauth_invalid', 'oauth_server_error', 'oauth_incomplete', 'oauth_invalid_tokens', 'oauth_error', 'oauth_init_failed'].includes(oauthError) &&
              'An unexpected error occurred during login. Please try again.'}
          </div>
        )}

        {/* General Error Display */}
        {generalError && (
          <div className="p-3 sm:p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {generalError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isPending}
            autoComplete="email"
            required
          />

          <FormField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder="Enter your password"
            disabled={isPending}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
            disabled={isPending}
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm uppercase">
            <span className="bg-card px-3 sm:px-4 text-muted-foreground font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 sm:h-11 text-sm sm:text-base border-border/60 hover:border-border"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isPending ? 'Connecting...' : 'Continue with Google'}
        </Button>

        {/* Navigation to Registration */}
        <div className="text-center text-sm sm:text-base pt-2">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            href={`/register${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-primary hover:underline font-medium transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}