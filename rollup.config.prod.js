import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    sourcemap: true,
  },
  plugins: [
    del({ targets: 'dist/*' }),
    resolve(),
    commonjs(),
    postcss({
      minimize: true,
      sourceMap: true,
      inject: {
        insertAt: 'top',
      },
    }),
    terser({
      compress: {
        drop_console: true,
      },
      output: {
        comments: false,
      },
    }),
  ],
})
