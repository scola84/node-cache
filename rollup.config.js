import buble from 'rollup-plugin-buble';

export default {
  dest: './dist/cache.js',
  entry: 'index.js',
  format: 'cjs',
  external: [
    'async/each',
    'events',
    'sha1'
  ],
  plugins: [
    buble()
  ]
};
