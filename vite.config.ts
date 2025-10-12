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
		},
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
					},
				},
			},

			// Minification settings
			minify: isDev ? false : 'terser',
			terserOptions: {
				compress: {
					drop_console: false,
					drop_debugger: true,
				},
				format: {
					comments: false,
				},
			},

			// Source maps
			sourcemap: isDev,
		},

		// CSS processing
		css: {
			postcss: {
				plugins: [
					require('autoprefixer'),
					...(isDev ? [] : [require('cssnano')({ preset: 'default' })]),
				],
			},
		},

		// Development server
		server: {
			port: 3000,
			open: true,
			cors: true,
			// Serve build directory for download functionality
			fs: {
				allow: ['.', './build'],
			},
		},

		// Plugins
		plugins: [
			htmlIncludePlugin(),

			// Custom plugin to copy public files
			{
				name: 'copy-public-files',
				configureServer(server) {
					// In dev mode, serve data files from /public/ path
					server.middlewares.use('/public', (req, res, next) => {
						const filePath = resolve('src/data', req.url?.slice(1) || '');
						if (fs.existsSync(filePath)) {
							res.setHeader('Content-Type', 'application/json');
							res.end(fs.readFileSync(filePath, 'utf-8'));
						} else {
							next();
						}
					});

					// Serve raw build files without Vite transformation
					server.middlewares.use((req, res, next) => {
						if (req.url && req.url.includes('/build/') && !req.url.includes('?')) {
							const filePath = resolve(req.url.slice(1)); // Remove leading /
							if (fs.existsSync(filePath)) {
								const ext = filePath.split('.').pop()?.toLowerCase();
								const contentTypes: Record<string, string> = {
									html: 'text/html',
									css: 'text/css',
									js: 'application/javascript',
									json: 'application/json',
								};
								res.setHeader('Content-Type', contentTypes[ext || ''] || 'text/plain');
								res.setHeader('Cache-Control', 'no-cache');
								res.end(fs.readFileSync(filePath, 'utf-8'));
								return;
							}
						}
						next();
					});
				},
				writeBundle() {
					const publicSrc = resolve('src/public');
					const publicDest = resolve('build/public');

					if (fs.existsSync(publicSrc)) {
						fs.cpSync(publicSrc, publicDest, { recursive: true });
					}

					// Copy data files to build/public
					const dataSrc = resolve('src/data');
					const dataDest = resolve('build/public');

					if (fs.existsSync(dataSrc)) {
						fs.cpSync(dataSrc, dataDest, { recursive: true });
					}
				},
			} as Plugin,
		],

		// Resolve configuration
		resolve: {
			alias: {
				'@': resolve('src'),
				'@/ts': resolve('src/ts'),
				'@/css': resolve('src/css'),
				'@/html': resolve('src/html'),
			},
		},
	};
});
