/**
 * Tests cover the pure logic (formatting + list operations), which has no
 * React Native / Expo imports — so a plain node environment with babel-jest
 * (via babel-preset-expo for TypeScript) is all that's needed.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
};
