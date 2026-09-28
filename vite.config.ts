import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import dts from 'unplugin-dts/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      isLib && dts({
        tsconfigPath: './tsconfig.lib.json',
      }),
    ],
    base: './',
    publicDir: isLib ? false : undefined,
    build: isLib ? {
      lib: {
        entry: 'src/components/index.ts',
        fileName: 'index',
        formats: ['es'],
      },
      rolldownOptions: {
        external: id =>['react'].some(e => id === e || id.startsWith(`${e}/`))
      }
    } : undefined
  }
})
