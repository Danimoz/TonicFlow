'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card"
import { handleOAuthCallback } from '../actions';
import { Music2 } from 'lucide-react';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  // Get redirect URL from search params for error case
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');
        const redirectUrl = searchParams.get('redirect');

        await handleOAuthCallback(accessToken, refreshToken, error, redirectUrl || undefined);
      } catch (err) {
        // Only set error if it's not a redirect (expected behavior)
        if (!(err && typeof err === 'object' && 'digest' in err)) {
          setError('Authentication failed. Please try again.');
        }
      }
    };

    processCallback();
  }, [searchParams]);

  if (error) {
    return (
      <Card className="shadow-elegant">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Authentication Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Back to Login
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Processing...</CardTitle>
        <p className="text-muted-foreground">Completing your authentication</p>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="flex justify-center">
          <Music2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">
          Please wait while we sign you in...
        </p>
      </CardContent>
    </Card>
  );
}