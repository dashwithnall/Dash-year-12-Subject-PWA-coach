/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// Cache names
const CACHE_PREFIX = 'dash-year12-coach';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v1`;
const CURRICULUM_CACHE = `${CACHE_PREFIX}-curriculum-v1`;
const QUIZ_CACHE = `${CACHE_PREFIX}-quiz-v1`;
const API_CACHE = `${CACHE_PREFIX}-api-v1`;

// Precache static assets (generated at build time)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ============================================
// CACHING STRATEGIES
// ============================================

// Cache-First: Static assets (images, fonts, icons)
registerRoute(
	({ request }) =>
		request.destination === 'image' ||
		request.destination === 'font' ||
		request.url.includes('/icons/'),
	new CacheFirst({
		cacheName: STATIC_CACHE,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
			})
		]
	})
);

// Cache-First: Curriculum content (quiz questions, topic data)
registerRoute(
	({ url }) =>
		url.pathname.includes('/curriculum/') || url.pathname.includes('/quiz-data/'),
	new CacheFirst({
		cacheName: CURRICULUM_CACHE,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 500,
				maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
			})
		]
	})
);

// Stale-While-Revalidate: User progress data
registerRoute(
	({ url }) =>
		url.pathname.includes('/api/progress') || url.pathname.includes('/api/user'),
	new StaleWhileRevalidate({
		cacheName: API_CACHE,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 24 * 60 * 60 // 1 day
			})
		]
	})
);

// Network-First: Live data (leaderboards, sync operations)
registerRoute(
	({ url }) =>
		url.pathname.includes('/api/sync') || url.pathname.includes('/api/live'),
	new NetworkFirst({
		cacheName: API_CACHE,
		networkTimeoutSeconds: 5,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 20,
				maxAgeSeconds: 60 * 60 // 1 hour
			})
		]
	})
);

// ============================================
// BACKGROUND SYNC
// ============================================

// Register sync for quiz submissions
self.addEventListener('sync', (event: SyncEvent) => {
	if (event.tag === 'sync-quiz-attempts') {
		event.waitUntil(syncQuizAttempts());
	}
	if (event.tag === 'sync-progress') {
		event.waitUntil(syncProgress());
	}
	if (event.tag === 'sync-coaching') {
		event.waitUntil(syncCoachingHistory());
	}
});

async function syncQuizAttempts(): Promise<void> {
	try {
		// Get unsynced attempts from IndexedDB
		const { get, set, keys } = await import('idb-keyval');
		const allKeys = await keys();
		const attemptKeys = allKeys.filter((k) =>
			String(k).startsWith('quiz-attempt-')
		);

		for (const key of attemptKeys) {
			const attempt = await get(key);
			if (attempt && !attempt.synced) {
				try {
					const response = await fetch('/api/quiz/submit', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(attempt)
					});

					if (response.ok) {
						await set(key, { ...attempt, synced: true });
						console.log(`[SW] Synced quiz attempt: ${key}`);
					}
				} catch (error) {
					console.error(`[SW] Failed to sync attempt ${key}:`, error);
				}
			}
		}
	} catch (error) {
		console.error('[SW] Quiz sync failed:', error);
	}
}

async function syncProgress(): Promise<void> {
	try {
		const { get } = await import('idb-keyval');
		const progress = await get('learning-progress');

		if (progress) {
			const response = await fetch('/api/progress/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(progress)
			});

			if (response.ok) {
				console.log('[SW] Progress synced successfully');
			}
		}
	} catch (error) {
		console.error('[SW] Progress sync failed:', error);
	}
}

async function syncCoachingHistory(): Promise<void> {
	try {
		const { get, keys } = await import('idb-keyval');
		const allKeys = await keys();
		const sessionKeys = allKeys.filter((k) =>
			String(k).startsWith('coaching-session-')
		);

		for (const key of sessionKeys) {
			const session = await get(key);
			if (session && !session.synced) {
				try {
					const response = await fetch('/api/coaching/sync', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(session)
					});

					if (response.ok) {
						console.log(`[SW] Synced coaching session: ${key}`);
					}
				} catch (error) {
					console.error(`[SW] Failed to sync session ${key}:`, error);
				}
			}
		}
	} catch (error) {
		console.error('[SW] Coaching sync failed:', error);
	}
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', (event: PushEvent) => {
	const data = event.data?.json() ?? {
		title: 'Study Reminder',
		body: 'Time for your daily quiz!',
		icon: '/icons/icon-192.png'
	};

	const options: NotificationOptions = {
		body: data.body,
		icon: data.icon || '/icons/icon-192.png',
		badge: '/icons/badge-72.png',
		vibrate: [200, 100, 200],
		tag: data.tag || 'study-reminder',
		requireInteraction: data.requireInteraction || false,
		data: data.data || {},
		actions: data.actions || [
			{ action: 'start-quiz', title: 'Start Quiz' },
			{ action: 'dismiss', title: 'Later' }
		]
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
	event.notification.close();

	const action = event.action;
	const data = event.notification.data;

	let targetUrl = '/';

	if (action === 'start-quiz') {
		targetUrl = data.quizUrl || '/quiz/daily';
	} else if (action === 'view-progress') {
		targetUrl = '/progress';
	} else if (action === 'open-coach') {
		targetUrl = '/coach';
	}

	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			// Check if there's already a window open
			for (const client of clientList) {
				if (client.url.includes(self.location.origin) && 'focus' in client) {
					client.navigate(targetUrl);
					return client.focus();
				}
			}
			// Open new window if none exists
			return self.clients.openWindow(targetUrl);
		})
	);
});

// ============================================
// OFFLINE FALLBACK
// ============================================

// Serve offline page for navigation requests when offline
const navigationHandler = async (params: any) => {
	try {
		return await new NetworkFirst({
			cacheName: 'pages',
			plugins: [
				new CacheableResponsePlugin({ statuses: [0, 200] })
			]
		}).handle(params);
	} catch (error) {
		const cache = await caches.open(STATIC_CACHE);
		const cachedResponse = await cache.match('/offline.html');
		return cachedResponse || new Response('Offline', { status: 503 });
	}
};

registerRoute(new NavigationRoute(navigationHandler));

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================

self.addEventListener('install', (event) => {
	console.log('[SW] Installing service worker...');
	// Skip waiting to activate immediately
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log('[SW] Activating service worker...');
	event.waitUntil(
		Promise.all([
			// Claim all clients
			self.clients.claim(),
			// Clean up old caches
			caches.keys().then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter(
							(name) =>
								name.startsWith(CACHE_PREFIX) &&
								![STATIC_CACHE, CURRICULUM_CACHE, QUIZ_CACHE, API_CACHE].includes(name)
						)
						.map((name) => {
							console.log(`[SW] Deleting old cache: ${name}`);
							return caches.delete(name);
						})
				)
			)
		])
	);
});

// ============================================
// MESSAGE HANDLING
// ============================================

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	if (event.data && event.data.type === 'CACHE_QUIZ') {
		// Cache quiz content on demand
		const quizData = event.data.payload;
		caches.open(QUIZ_CACHE).then((cache) => {
			cache.put(
				`/quiz-data/${quizData.id}`,
				new Response(JSON.stringify(quizData))
			);
		});
	}

	if (event.data && event.data.type === 'CLEAR_CACHE') {
		// Clear specific cache
		const cacheName = event.data.cacheName || QUIZ_CACHE;
		caches.delete(cacheName).then(() => {
			console.log(`[SW] Cleared cache: ${cacheName}`);
		});
	}
});

// Type declarations for service worker events
interface SyncEvent extends ExtendableEvent {
	tag: string;
}

interface PushEvent extends ExtendableEvent {
	data?: PushMessageData;
}

interface NotificationEvent extends ExtendableEvent {
	notification: Notification;
	action: string;
}
