<script lang="ts">
	import { onMount } from 'svelte';
	import { requestPersistentStorage, getStorageEstimate } from '$db/indexeddb';

	let isOnline = true;
	let storageInfo = { used: 0, quota: 0, percentage: 0 };

	onMount(async () => {
		// Track online/offline status
		isOnline = navigator.onLine;
		window.addEventListener('online', () => (isOnline = true));
		window.addEventListener('offline', () => (isOnline = false));

		// Request persistent storage
		await requestPersistentStorage();

		// Get storage estimate
		storageInfo = await getStorageEstimate();
	});
</script>

<svelte:head>
	<title>Dash Year 12 Subject Coach</title>
</svelte:head>

<div class="app">
	<!-- Offline indicator -->
	{#if !isOnline}
		<div class="offline-banner">
			<span>You're offline - changes will sync when connected</span>
		</div>
	{/if}

	<!-- Navigation -->
	<nav class="navbar">
		<a href="/" class="logo">
			<span class="logo-icon">📚</span>
			<span class="logo-text">Subject Coach</span>
		</a>

		<div class="nav-links">
			<a href="/subjects">Subjects</a>
			<a href="/quiz">Quiz</a>
			<a href="/coach">AI Coach</a>
			<a href="/progress">Progress</a>
		</div>

		<div class="nav-status">
			<span class="status-dot" class:online={isOnline} class:offline={!isOnline}></span>
		</div>
	</nav>

	<!-- Main content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer>
		<p>Year 12 • Nudgee College Queensland • QCAA 2025</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #1a1a2e;
		color: #eaeaea;
		min-height: 100vh;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.offline-banner {
		background: #f39c12;
		color: #1a1a2e;
		padding: 0.5rem 1rem;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		background: #16213e;
		border-bottom: 1px solid #0f3460;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: #4a90e2;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		color: #b8b8b8;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: #4a90e2;
	}

	.nav-status {
		display: flex;
		align-items: center;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		transition: background-color 0.3s;
	}

	.status-dot.online {
		background: #27ae60;
	}

	.status-dot.offline {
		background: #e74c3c;
	}

	main {
		flex: 1;
		padding: 2rem;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
	}

	footer {
		padding: 1rem 2rem;
		text-align: center;
		background: #16213e;
		color: #666;
		font-size: 0.875rem;
		border-top: 1px solid #0f3460;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.navbar {
			padding: 1rem;
			flex-wrap: wrap;
			gap: 1rem;
		}

		.nav-links {
			order: 3;
			width: 100%;
			justify-content: space-around;
			gap: 1rem;
		}

		.nav-links a {
			font-size: 0.875rem;
		}

		main {
			padding: 1rem;
		}
	}
</style>
