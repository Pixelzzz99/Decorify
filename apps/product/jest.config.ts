/* eslint-disable */
export default {
  displayName: 'product',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/product',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
