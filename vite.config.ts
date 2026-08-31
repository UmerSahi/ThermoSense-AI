import { defineConfig, type Plugin } from 'vite'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// Custom plugin to handle ?import&react syntax (alias to ?react)
const svgImportPlugin = () => ({
  name: 'svg-import-alias',
  resolveId(id: string) {
    // Transform ?import&react to ?react for vite-plugin-svgr
    if (id.includes('?import&react')) {
      return id.replace('?import&react', '?react');
    }
    return null;
  },
});

// Screenshots are committed as base64 text (public/screenshots/*.b64) because
// binary files can't be written by the platform's text tooling. This plugin
// decodes them back into real .png files on dev/build start so README images
// and the deployed site always resolve.
const b64ScreenshotPlugin = (): Plugin => ({
  name: 'b64-screenshot-assets',
  buildStart() {
    const dir = join(process.cwd(), 'public', 'screenshots');
    let entries: string[] = [];
    try {
      entries = readdirSync(dir).filter((f) => f.endsWith('.b64'));
    } catch {
      return; // directory missing — nothing to decode
    }
    for (const file of entries) {
      const b64 = readFileSync(join(dir, file), 'utf8').trim();
      const outPath = join(dir, file.replace(/\.b64$/, ''));
      writeFileSync(outPath, Buffer.from(b64, 'base64'));
    }
  },
});

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    svgImportPlugin(),
    b64ScreenshotPlugin(),
    svgr({
      // Support named ReactComponent export (for ?react syntax)
      svgrOptions: {
        exportType: 'named',
        namedExport: 'ReactComponent',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg?react',
    }),
  ],
  server: {
    allowedHosts: true as const,
    hmr: false,
  },
}))
