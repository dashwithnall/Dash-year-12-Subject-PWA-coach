import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	// PWA optimization
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor chunks for better caching
					'chart': ['chart.js'],
					'idb': ['idb-keyval']
				}
			}
		}
	},

	// Development server
	server: {
		port: 5173,
		strictPort: false,
		host: true // Allow network access for mobile testing
	},

	// Preview server (for testing production build)
	preview: {
		port: 4173,
		host: true
	}
});
