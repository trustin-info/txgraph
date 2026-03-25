import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: process.env.DEMO_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@trustin/txgraph': path.resolve(__dirname, '../../packages/react/src/index.ts'),
      '@trustin/txgraph-core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
    },
  },
})
