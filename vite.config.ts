import fs from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

/**
 * Custom plugin to handle @@include directives in HTML files
 * Maintains compatibility with existing Gulp-based template system
 */
function htmlIncludePlugin(): Plugin {
  return {
    name: 'html-include',
    transformIndexHtml(html: string) {
      return processIncludes(html, resolve('src/html'));
    }
  };
}

/**
 * Recursively processes @@include directives in HTML content
 * @param content - HTML content to process
 * @param basePath - Base path for resolving include files
 * @returns Processed HTML with includes resolved
 */
function processIncludes(content: string, basePath: string): string {
  const includeRegex = /@@include\(['"]([^'"]+)['"]\)/g;

  return content.replace(includeRegex, (match, includePath) => {
    // Handle both relative and absolute paths from project root
    const fullPath = includePath.startsWith('src/')
      ? resolve(includePath)
      : resolve(basePath, includePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Include file not found: ${fullPath}`);
      return match;
    }

    const includeContent = fs.readFileSync(fullPath, 'utf-8');
    // Recursively process includes in the included file
    return processIncludes(includeContent, basePath);
  });
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    root: '.',
    publicDir: false, // We'll handle public files manually

    build: {
      outDir: 'build',
      emptyOutDir: true,

      rollupOptions: {
        input: resolve('index.html'),

        output: {
          // Disable code splitting to create single bundles
          manualChunks: undefined,

          // Custom file naming to match existing structure
          entryFileNames: isDev ? 'js/bundle.js' : 'js/bundle.min.js',
          chunkFileNames: isDev ? 'js/[name].js' : 'js/[name].min.js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return isDev ? 'css/bundle.css' : 'css/bundle.min.css';
            }
            return 'assets/[name].[ext]';
          }
        }
      },

      // Minification settings
      minify: isDev ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true
        },
        format: {
          comments: false
        }
      },

      // Source maps
      sourcemap: isDev
    },

    // CSS processing
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
          ...(isDev ? [] : [require('cssnano')({ preset: 'default' })])
        ]
      }
    },

    // Development server
    server: {
      port: 3000,
      open: true,
      cors: true
    },

    // Plugins
    plugins: [
      htmlIncludePlugin(),

      // Custom plugin to copy public files
      {
        name: 'copy-public-files',
        writeBundle() {
          const publicSrc = resolve('src/public');
          const publicDest = resolve('build/public');

          if (fs.existsSync(publicSrc)) {
            fs.cpSync(publicSrc, publicDest, { recursive: true });
          }
        }
      } as Plugin
    ],

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve('src'),
        '@/ts': resolve('src/ts'),
        '@/css': resolve('src/css'),
        '@/html': resolve('src/html')
      }
    }
  };
});