const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = './dist';
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths: {
    '@/*': ['src/*'],
    '@application/*': ['src/application/*'],
    '@domain/*': ['src/domain/*'],
    '@infrastructure/*': ['src/infrastructure/*'],
    '@config/*': ['src/config/*']
  }
});
