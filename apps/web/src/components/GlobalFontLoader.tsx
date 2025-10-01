'use client';

import { useEffect } from 'react';
import { loadFontsGlobally } from '@/lib/fontLoader';

/**
 * Global font loader component that loads fonts once when the app starts.
 * This ensures fonts are available for SVG contexts without reloading on component remounts.
 */
export default function GlobalFontLoader() {
  useEffect(() => {
    loadFontsGlobally().catch(error => {
      console.error('Failed to load fonts globally:', error);
    });
  }, []); // Only run once on app startup

  return null; // This component doesn't render anything
}