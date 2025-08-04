'use client';

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { registerAction, getGoogleOAuthUrl } from "../actions";
import { AuthResult, RegisterFormData } from "../types";
import {
  validateField,
  validatePasswordStrength
} from "../validation-utils";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    fullName: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from search params (set by middleware)
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Handle input changes with minimal validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }

    // Show/hide password strength indicator
    if (name === 'password') {
      setShowPasswordStrength(value.length > 0);
    }
  };

  // Validate field on blur for immediate feedback
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only validate if field has content
    if (value.trim()) {
      const fieldError = validateField(name, value, 'register');
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  // Handle form submission - let server handle validation
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setGeneralError('');

    // Create FormData and submit directly to server action
    const formDataObj = new FormData();
    formDataObj.append('email', formData.email);
    formDataObj.append('fullName', formData.fullName);
    formDataObj.append('password', formData.password);

    startTransition(async () => {
      try {
        const result: AuthResult = await registerAction(formDataObj);

        if (result.success) {
          router.push(redirectUrl);
        } else {
          // Handle server validation errors
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
          }
          if (result.error) {
            setGeneralError(result.error);
          }
        }
      } catch (error) {
        console.error('Registration submission error:', error);
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    });
  };

  // Handle Google OAuth
  const handleGoogleRegister = async () => {
    try {
      const oauthUrl = await getGoogleOAuthUrl(redirectUrl);
      window.location.href = oauthUrl;
    } catch (error) {
      setGeneralError('Failed to initiate Google registration. Please try again.');
    }
  };

  // Get password strength info (only for UI feedback)
  const passwordStrength = formData.password ? validatePasswordStrength(formData.password) : null;

  return (
    <Card className="shadow-elegant backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader className="text-center space-y-2 sm:space-y-3">
        <CardTitle className="text-xl sm:text-2xl font-bold">Create your account</CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          Join Tonic Flow to start composing music
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* General Error Display */}
        {generalError && (
          <div className="p-3 sm:p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {generalError}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <FormField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.email}
            placeholder="Enter your email"
            disabled={isPending}
            autoComplete="email"
            required
          />

          <FormField
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.fullName}
            placeholder="Enter your full name"
            disabled={isPending}
            autoComplete="name"
            required
          />

          <div className="space-y-2 sm:space-y-3">
            <FormField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={errors.password}
              placeholder="Create a strong password"
              disabled={isPending}
              autoComplete="new-password"
              required
            />

            {/* Password Strength Indicator */}
            {showPasswordStrength && passwordStrength && (
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-muted/30 rounded-md border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Password strength:</span>
                  <span className={`text-xs sm:text-sm font-medium ${passwordStrength.color}`}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>

                {/* Strength bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.strength === 'weak' ? 'bg-destructive w-1/4' :
                      passwordStrength.strength === 'fair' ? 'bg-orange-500 w-2/4' :
                        passwordStrength.strength === 'good' ? 'bg-yellow-500 w-3/4' :
                          'bg-green-500 w-full'
                      }`}
                  />
                </div>

                {/* Password criteria */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                    <span className={passwordStrength.criteria.length ? 'text-green-600' : ''}>
                      ✓ 8+ characters
                    </span>
                    <span className={passwordStrength.criteria.uppercase ? 'text-green-600' : ''}>
                      ✓ Uppercase letter
                    </span>
                    <span className={passwordStrength.criteria.lowercase ? 'text-green-600' : ''}>
                      ✓ Lowercase letter
                    </span>
                    <span className={passwordStrength.criteria.number ? 'text-green-600' : ''}>
                      ✓ Number
                    </span>
                  </div>
                  <span className={passwordStrength.criteria.special ? 'text-green-600' : ''}>
                    ✓ Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 sm:h-11 text-sm sm:text-base"
            disabled={isPending}
          >
            {isPending ? 'Creating account...' : 'Create account'}
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
          onClick={handleGoogleRegister}
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

        {/* Navigation to Login */}
        <div className="text-center text-sm sm:text-base pt-2">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link
            href={`/login${redirectUrl !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-primary hover:underline font-medium transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}