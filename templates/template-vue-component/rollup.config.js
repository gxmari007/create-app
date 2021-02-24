import vue from 'rollup-plugin-vue';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  external: ['vue'],
  output: {
    format: 'umd',
    name: pkg.name,
    file: pkg.main,
    globals: {
      vue: 'Vue',
    },
  },
  plugins: [vue(), typescript()],
};
