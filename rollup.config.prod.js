import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import url from '@rollup/plugin-url'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    sourcemap: false,
  },
  plugins: [
    del({ targets: 'dist/*' }),
    resolve(),
    commonjs(),
    postcss({
      minimize: true,
      sourceMap: false,
      inject: {
        insertAt: 'top',
      },
    }),
    json(),
    url({
      include: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.html'],
      limit: 0, // always copy files
    }),
    terser({
      compress: {
        drop_console: true,
      },
      output: {
        comments: false,
      },
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
})
