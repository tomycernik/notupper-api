const path = require('path');
const tsConfigPaths = require('tsconfig-paths');

tsConfigPaths.register({
  baseUrl: path.join(__dirname, 'dist'),
  paths: {
    '@config/*':         ['src/config/*'],
    '@domain/*':         ['src/domain/*'],
    '@application/*':    ['src/application/*'],
    '@infrastructure/*': ['src/infrastructure/*'],
  }
});

require('./dist/src/index.js');
