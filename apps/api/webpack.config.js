const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
  resolve: {
    alias: {
      'class-transformer/storage': false,
      'class-transformer/cjs/storage': false,
    },
  },
  externals: {
    'class-transformer/storage': 'commonjs class-transformer/storage',
    'class-transformer/cjs/storage': 'commonjs class-transformer/storage',
    // Don't externalize swagger-ui-dist to ensure assets are bundled
    'swagger-ui-dist': false,
  },
};
