/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/content-script.ts',
    '!src/types/**',
    '!src/service-worker.ts',
    '!src/gifs/gifs.ts'
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/mocks/', '/node_modules/'],
}
