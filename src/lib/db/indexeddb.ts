/**
 * IndexedDB Storage Layer for Dash Year 12 Subject Coach
 *
 * Provides offline-first data persistence for:
 * - Quiz attempts and progress
 * - User preferences
 * - Cached curriculum content
 * - Coaching session history
 */

import { get, set, del, keys, clear, createStore } from 'idb-keyval';

// ============================================
// STORE CONFIGURATION
// ============================================

// Custom stores for different data types
const progressStore = createStore('dash-progress-db', 'progress');
const quizStore = createStore('dash-quiz-db', 'quizzes');
const coachingStore = createStore('dash-coaching-db', 'sessions');
const curriculumStore = createStore('dash-curriculum-db', 'content');

// ============================================
// USER PROGRESS
// ============================================

export interface UserProgress {
	userId: string;
	totalQuizzes: number;
	completionRate: number;
	averageScore: number;
	currentStreak: number;
	longestStreak: number;
	lastActiveDate: string;
	subjectProgress: Record<string, SubjectProgress>;
}

export interface SubjectProgress {
	subjectId: string;
	masteryLevel: number;
	topicsCompleted: number;
	totalTopics: number;
	quizzesTaken: number;
	averageScore: number;
	lastStudied: string;
}

export async function getUserProgress(): Promise<UserProgress | undefined> {
	return get('user-progress', progressStore);
}

export async function setUserProgress(progress: UserProgress): Promise<void> {
	await set('user-progress', progress, progressStore);
}

export async function updateUserProgress(updates: Partial<UserProgress>): Promise<void> {
	const current = await getUserProgress();
	if (current) {
		await set('user-progress', { ...current, ...updates }, progressStore);
	}
}

// ============================================
// QUIZ ATTEMPTS
// ============================================

export interface QuizAttempt {
	id: string;
	quizId: string;
	userId: string;
	startedAt: string;
	completedAt?: string;
	score?: number;
	correctCount: number;
	totalCount: number;
	timeSpentSeconds: number;
	answers: QuizAnswer[];
	synced: boolean;
	createdOffline: boolean;
}

export interface QuizAnswer {
	questionId: string;
	selectedAnswer: string | string[];
	isCorrect: boolean;
	timeSpentSeconds: number;
	timestamp: string;
}

export async function saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
	await set(`quiz-attempt-${attempt.id}`, attempt, quizStore);
}

export async function getQuizAttempt(attemptId: string): Promise<QuizAttempt | undefined> {
	return get(`quiz-attempt-${attemptId}`, quizStore);
}

export async function getAllQuizAttempts(): Promise<QuizAttempt[]> {
	const allKeys = await keys(quizStore);
	const attemptKeys = allKeys.filter(k => String(k).startsWith('quiz-attempt-'));
	const attempts: QuizAttempt[] = [];

	for (const key of attemptKeys) {
		const attempt = await get(key, quizStore);
		if (attempt) attempts.push(attempt);
	}

	return attempts.sort((a, b) =>
		new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
	);
}

export async function getUnsyncedAttempts(): Promise<QuizAttempt[]> {
	const all = await getAllQuizAttempts();
	return all.filter(a => !a.synced);
}

export async function markAttemptSynced(attemptId: string): Promise<void> {
	const attempt = await getQuizAttempt(attemptId);
	if (attempt) {
		await saveQuizAttempt({ ...attempt, synced: true });
	}
}

// ============================================
// TOPIC MASTERY (Spaced Repetition)
// ============================================

export interface TopicMastery {
	topicId: string;
	userId: string;
	masteryLevel: number; // 0-1
	totalQuestionsSeen: number;
	totalCorrect: number;
	easeFactor: number; // SM-2 algorithm
	intervalDays: number;
	repetitions: number;
	nextReviewDate: string;
	lastReviewDate?: string;
	firstSeenAt: string;
	lastSeenAt: string;
}

export async function getTopicMastery(topicId: string): Promise<TopicMastery | undefined> {
	return get(`topic-mastery-${topicId}`, progressStore);
}

export async function setTopicMastery(mastery: TopicMastery): Promise<void> {
	await set(`topic-mastery-${mastery.topicId}`, mastery, progressStore);
}

export async function getAllTopicMastery(): Promise<TopicMastery[]> {
	const allKeys = await keys(progressStore);
	const masteryKeys = allKeys.filter(k => String(k).startsWith('topic-mastery-'));
	const masteries: TopicMastery[] = [];

	for (const key of masteryKeys) {
		const mastery = await get(key, progressStore);
		if (mastery) masteries.push(mastery);
	}

	return masteries;
}

export async function getTopicsForReview(): Promise<TopicMastery[]> {
	const all = await getAllTopicMastery();
	const today = new Date().toISOString().split('T')[0];

	return all.filter(m => m.nextReviewDate <= today)
		.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
}

/**
 * Update topic mastery using SM-2 spaced repetition algorithm
 * @param topicId - Topic identifier
 * @param quality - Answer quality (0-5: 0=complete blackout, 5=perfect)
 */
export async function updateMasteryWithSM2(topicId: string, quality: number): Promise<void> {
	let mastery = await getTopicMastery(topicId);
	const today = new Date().toISOString();

	if (!mastery) {
		mastery = {
			topicId,
			userId: 'current-user', // Replace with actual user ID
			masteryLevel: 0,
			totalQuestionsSeen: 0,
			totalCorrect: 0,
			easeFactor: 2.5,
			intervalDays: 1,
			repetitions: 0,
			nextReviewDate: today.split('T')[0],
			firstSeenAt: today,
			lastSeenAt: today
		};
	}

	// SM-2 Algorithm
	if (quality >= 3) {
		// Correct response
		if (mastery.repetitions === 0) {
			mastery.intervalDays = 1;
		} else if (mastery.repetitions === 1) {
			mastery.intervalDays = 6;
		} else {
			mastery.intervalDays = Math.round(mastery.intervalDays * mastery.easeFactor);
		}
		mastery.repetitions += 1;
		mastery.totalCorrect += 1;
	} else {
		// Incorrect response - reset
		mastery.repetitions = 0;
		mastery.intervalDays = 1;
	}

	// Update ease factor (minimum 1.3)
	mastery.easeFactor = Math.max(1.3,
		mastery.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
	);

	// Update tracking
	mastery.totalQuestionsSeen += 1;
	mastery.masteryLevel = mastery.totalCorrect / mastery.totalQuestionsSeen;
	mastery.lastSeenAt = today;
	mastery.lastReviewDate = today.split('T')[0];

	// Calculate next review date
	const nextDate = new Date();
	nextDate.setDate(nextDate.getDate() + mastery.intervalDays);
	mastery.nextReviewDate = nextDate.toISOString().split('T')[0];

	await setTopicMastery(mastery);
}

// ============================================
// COACHING SESSIONS
// ============================================

export interface CoachingSession {
	id: string;
	userId: string;
	subjectId?: string;
	topicId?: string;
	startedAt: string;
	endedAt?: string;
	messages: CoachingMessage[];
	topicsCovered: string[];
	synced: boolean;
}

export interface CoachingMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
	tokensUsed?: number;
}

export async function saveCoachingSession(session: CoachingSession): Promise<void> {
	await set(`coaching-session-${session.id}`, session, coachingStore);
}

export async function getCoachingSession(sessionId: string): Promise<CoachingSession | undefined> {
	return get(`coaching-session-${sessionId}`, coachingStore);
}

export async function getRecentCoachingSessions(limit: number = 10): Promise<CoachingSession[]> {
	const allKeys = await keys(coachingStore);
	const sessionKeys = allKeys.filter(k => String(k).startsWith('coaching-session-'));
	const sessions: CoachingSession[] = [];

	for (const key of sessionKeys) {
		const session = await get(key, coachingStore);
		if (session) sessions.push(session);
	}

	return sessions
		.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
		.slice(0, limit);
}

// ============================================
// CURRICULUM CACHE
// ============================================

export interface CachedQuiz {
	id: string;
	name: string;
	subjectId: string;
	questions: CachedQuestion[];
	cachedAt: string;
}

export interface CachedQuestion {
	id: string;
	questionText: string;
	questionType: 'multiple_choice' | 'fill_blank' | 'matching' | 'short_answer';
	options?: string[];
	correctAnswer: string;
	explanation?: string;
	difficulty: number;
}

export async function cacheQuiz(quiz: CachedQuiz): Promise<void> {
	await set(`cached-quiz-${quiz.id}`, quiz, curriculumStore);
}

export async function getCachedQuiz(quizId: string): Promise<CachedQuiz | undefined> {
	return get(`cached-quiz-${quizId}`, curriculumStore);
}

export async function getCachedQuizzesBySubject(subjectId: string): Promise<CachedQuiz[]> {
	const allKeys = await keys(curriculumStore);
	const quizKeys = allKeys.filter(k => String(k).startsWith('cached-quiz-'));
	const quizzes: CachedQuiz[] = [];

	for (const key of quizKeys) {
		const quiz = await get(key, curriculumStore);
		if (quiz && quiz.subjectId === subjectId) {
			quizzes.push(quiz);
		}
	}

	return quizzes;
}

// ============================================
// STUDY STREAKS
// ============================================

export interface StreakData {
	currentStreak: number;
	longestStreak: number;
	lastStudyDate: string;
	studyDates: string[]; // Array of ISO date strings
}

export async function getStreakData(): Promise<StreakData | undefined> {
	return get('streak-data', progressStore);
}

export async function updateStreak(): Promise<StreakData> {
	const today = new Date().toISOString().split('T')[0];
	let streakData = await getStreakData();

	if (!streakData) {
		streakData = {
			currentStreak: 1,
			longestStreak: 1,
			lastStudyDate: today,
			studyDates: [today]
		};
	} else {
		const lastDate = new Date(streakData.lastStudyDate);
		const todayDate = new Date(today);
		const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			// Already studied today, no change
		} else if (diffDays === 1) {
			// Consecutive day - extend streak
			streakData.currentStreak += 1;
			streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
			streakData.lastStudyDate = today;
			streakData.studyDates.push(today);
		} else {
			// Streak broken
			streakData.currentStreak = 1;
			streakData.lastStudyDate = today;
			streakData.studyDates.push(today);
		}
	}

	await set('streak-data', streakData, progressStore);
	return streakData;
}

// ============================================
// SYNC QUEUE
// ============================================

export interface SyncQueueItem {
	id: string;
	action: 'create' | 'update' | 'delete';
	table: string;
	recordId: string;
	payload: Record<string, unknown>;
	createdAt: string;
	retryCount: number;
	lastError?: string;
}

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
	const queueItem: SyncQueueItem = {
		...item,
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		retryCount: 0
	};
	await set(`sync-queue-${queueItem.id}`, queueItem, progressStore);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
	const allKeys = await keys(progressStore);
	const queueKeys = allKeys.filter(k => String(k).startsWith('sync-queue-'));
	const items: SyncQueueItem[] = [];

	for (const key of queueKeys) {
		const item = await get(key, progressStore);
		if (item) items.push(item);
	}

	return items.sort((a, b) =>
		new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);
}

export async function removeSyncQueueItem(itemId: string): Promise<void> {
	await del(`sync-queue-${itemId}`, progressStore);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function clearAllData(): Promise<void> {
	await Promise.all([
		clear(progressStore),
		clear(quizStore),
		clear(coachingStore),
		clear(curriculumStore)
	]);
}

export async function getStorageEstimate(): Promise<{ used: number; quota: number; percentage: number }> {
	if (navigator.storage && navigator.storage.estimate) {
		const estimate = await navigator.storage.estimate();
		const used = estimate.usage || 0;
		const quota = estimate.quota || 0;
		return {
			used,
			quota,
			percentage: quota > 0 ? (used / quota) * 100 : 0
		};
	}
	return { used: 0, quota: 0, percentage: 0 };
}

export async function requestPersistentStorage(): Promise<boolean> {
	if (navigator.storage && navigator.storage.persist) {
		return await navigator.storage.persist();
	}
	return false;
}
