process.env = Object.assign(process.env, {
  NODE_ENV: 'test',
})

module.exports = {
  verbose: true,
  // forceExit: true,
  // detectOpenHandles: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  coverageReporters: ['text', 'json', 'json-summary', 'lcov', ['text', { file: 'coverage.txt' }]],
  // globalSetup: './test/prepare.ts',
  // globalTeardown: './test/teardown.ts',
  // setupFilesAfterEnv: ['./test/setup.ts'],
}
