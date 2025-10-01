'use client';

import { availableFonts, loadFont } from "@/lib/engraving/styles";

// Global flag to track if fonts have been loaded
let fontsLoaded = false;
let fontLoadingPromise: Promise<void> | null = null;

/**
 * Loads all fonts globally once per app session.
 * Subsequent calls return the same promise to avoid duplicate loading.
 */
export async function loadFontsGlobally(): Promise<void> {
  // If fonts are already loaded, return immediately
  if (fontsLoaded) {
    return Promise.resolve();
  }

  // If loading is in progress, return the existing promise
  if (fontLoadingPromise) {
    return fontLoadingPromise;
  }

  // Start loading fonts
  fontLoadingPromise = (async () => {
    try {
      const fontPromises = availableFonts
        .filter(font => font.url) // Only load fonts with URLs
        .map(font => loadFont(font));
      
      await Promise.all(fontPromises);
      fontsLoaded = true;
      console.log('All fonts loaded globally for SVG context');
    } catch (error) {
      console.error('Error loading fonts globally:', error);
      // Reset the promise so we can retry later
      fontLoadingPromise = null;
      throw error;
    }
  })();

  return fontLoadingPromise;
}

/**
 * Check if fonts have been loaded
 */
export function areFontsLoaded(): boolean {
  return fontsLoaded;
}