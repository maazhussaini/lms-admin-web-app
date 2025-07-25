import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'
// import viteImagemin from 'vite-plugin-imagemin' // TODO: Re-enable after resolving compatibility
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      tailwindcss(),
      
      // Bundle analyzer (only in build mode)
      ...(command === 'build' ? [
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
        // TODO: Re-enable image optimization after resolving compatibility issues
        // viteImagemin({
        //   gifsicle: { optimizationLevel: 7 },
        //   mozjpeg: { quality: 85 },
        //   optipng: { optimizationLevel: 7 },
        //   pngquant: { quality: [0.8, 0.9], speed: 4 },
        //   svgo: {
        //     plugins: [
        //       { name: 'removeViewBox', active: false },
        //       { name: 'removeEmptyAttrs', active: false },
        //     ],
        //   },
        // }),
        compression({
          algorithm: 'gzip',
          ext: '.gz',
        }),
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
        }),
      ] : []),
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../shared'),
        '@public': path.resolve(__dirname, 'public'),
      },
    },
    
    // Development optimizations
    server: {
      port: 5173,
      open: true,
      hmr: {
        overlay: false, // Disable error overlay for better development experience
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'framer-motion',
        'axios',
        'date-fns',
        'clsx',
      ],
      exclude: [
        '@tanstack/react-query-devtools', // Only needed in development
      ],
    },

    // Production build optimizations
    build: {
      target: 'es2020',
      minify: 'terser',
      sourcemap: false, // Disable source maps for smaller bundle size
      cssCodeSplit: true,
      
      // Rollup options for advanced chunking
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            
            // UI and animation libraries
            'ui-vendor': ['framer-motion', 'react-icons'],
            
            // Utility libraries
            'utils-vendor': ['axios', 'date-fns', 'clsx', 'jwt-decode'],
            
            // Phone input component (potentially large)
            'phone-vendor': ['react-phone-input-2'],
          },
          
          // Asset naming for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const extType = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            if (extType === 'css') {
              return `assets/styles/[name]-[hash][extname]`;
            }
            return `assets/[ext]/[name]-[hash][extname]`;
          },
          
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // Terser options for better minification
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remove console.logs only in production
          drop_debugger: true,
          pure_funcs: isProduction ? ['console.log', 'console.info'] : [],
        },
        mangle: true,
        format: {
          comments: false, // Remove comments
        },
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 500, // Warn for chunks over 500KB
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    },

    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
    },
  }
})
