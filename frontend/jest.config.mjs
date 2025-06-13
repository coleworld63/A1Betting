// Jest config in ESM format for ESM/CJS compatibility
import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';

const tsconfig = JSON.parse(readFileSync(new URL('./tsconfig.jest.json', import.meta.url)));

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/?(*.)+(test|spec).[tj]s?(x)',
    // Exclude Playwright E2E and performance tests from Jest
    '!**/src/tests/e2e/**',
    '!**/src/test/performance/**',
    '!**/src/tests/dashboardLoad.perf.test-MyPC.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', {
      useESM: true,
      tsconfig: './tsconfig.jest.json'
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(jest-canvas-mock|@testing-library|chart.js|react-chartjs-2)/)',
  ],
  moduleNameMapper: {
    // Handle .js imports to .ts files
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Handle TypeScript path mapping
    ...pathsToModuleNameMapper(tsconfig.compilerOptions?.paths || {}, { prefix: '<rootDir>/' }),
    // Mock CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/test/**',
    '!src/tests/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000
};
