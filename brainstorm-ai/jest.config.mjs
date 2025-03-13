export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['js', 'mjs', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: false,
  maxWorkers: 1,
  moduleDirectories: ['node_modules'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
    url: 'http://localhost'
  }
};