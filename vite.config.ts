
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// Ensure .well-known directory exists
const wellKnownDir = path.resolve(__dirname, 'public/.well-known');
if (!fs.existsSync(wellKnownDir)) {
  fs.mkdirSync(wellKnownDir, { recursive: true });
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-native": "react-native-web"
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.vue']
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Keep .well-known files in their original location
          if (assetInfo.name && assetInfo.name.includes('.well-known')) {
            return assetInfo.name;
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public',
  define: {
    'process.env.CORDOVA_ENVIRONMENT': JSON.stringify(true)
  }
}));
