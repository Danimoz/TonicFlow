import type { Config } from 'jest';
import { config as baseConfig } from './base';

export const config = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
} as const satisfies Config;