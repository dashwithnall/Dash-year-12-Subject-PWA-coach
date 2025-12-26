import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Static adapter for PWA deployment to Firebase Hosting
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // SPA fallback for client-side routing
			precompress: true,
			strict: true
		}),

		// Service worker configuration
		serviceWorker: {
			register: true
		},

		// Prerender all pages for offline access
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		},

		// Alias for cleaner imports
		alias: {
			$components: 'src/lib/components',
			$stores: 'src/lib/stores',
			$db: 'src/lib/db',
			$mcp: 'src/lib/mcp',
			$sync: 'src/lib/sync'
		}
	}
};

export default config;
