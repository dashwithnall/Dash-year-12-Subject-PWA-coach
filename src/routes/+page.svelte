<script lang="ts">
	import { onMount } from 'svelte';
	import { subjects, type Subject } from '$stores/subjects';
	import { getStreakData, getUserProgress, type UserProgress, type StreakData } from '$db/indexeddb';

	let streakData: StreakData | undefined;
	let userProgress: UserProgress | undefined;
	let greeting = 'Good day';

	onMount(async () => {
		// Load user data
		streakData = await getStreakData();
		userProgress = await getUserProgress();

		// Set greeting based on time
		const hour = new Date().getHours();
		if (hour < 12) greeting = 'Good morning';
		else if (hour < 17) greeting = 'Good afternoon';
		else greeting = 'Good evening';
	});

	function getSubjectProgress(subjectId: string): number {
		if (!userProgress?.subjectProgress?.[subjectId]) return 0;
		return Math.round(userProgress.subjectProgress[subjectId].masteryLevel * 100);
	}
</script>

<div class="dashboard">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="greeting">
			<h1>{greeting}, Dash!</h1>
			<p>Ready to level up your Year 12 knowledge?</p>
		</div>

		{#if streakData}
			<div class="streak-card">
				<span class="streak-flame">🔥</span>
				<div class="streak-info">
					<span class="streak-count">{streakData.currentStreak}</span>
					<span class="streak-label">day streak</span>
				</div>
			</div>
		{/if}
	</header>

	<!-- Quick Actions -->
	<section class="quick-actions">
		<h2>Quick Start</h2>
		<div class="action-grid">
			<a href="/quiz/daily" class="action-card primary">
				<span class="action-icon">📝</span>
				<span class="action-title">Daily Quiz</span>
				<span class="action-desc">5-minute challenge</span>
			</a>

			<a href="/coach" class="action-card secondary">
				<span class="action-icon">🤖</span>
				<span class="action-title">AI Coach</span>
				<span class="action-desc">Get help with topics</span>
			</a>

			<a href="/progress" class="action-card tertiary">
				<span class="action-icon">📊</span>
				<span class="action-title">Progress</span>
				<span class="action-desc">Track your learning</span>
			</a>

			<a href="/subjects" class="action-card quaternary">
				<span class="action-icon">📚</span>
				<span class="action-title">Browse</span>
				<span class="action-desc">Explore subjects</span>
			</a>
		</div>
	</section>

	<!-- Subjects Overview -->
	<section class="subjects-section">
		<div class="section-header">
			<h2>Your Subjects</h2>
			<a href="/subjects" class="view-all">View all →</a>
		</div>

		<div class="subjects-grid">
			{#each $subjects as subject}
				<a
					href="/subjects/{subject.id}"
					class="subject-card"
					style="--subject-color: {subject.color}"
				>
					<div class="subject-header">
						<span class="subject-icon">{getSubjectIcon(subject.icon)}</span>
						<span class="subject-type">{subject.type === 'vet' ? 'VET' : 'General'}</span>
					</div>

					<h3 class="subject-name">{subject.name}</h3>
					<p class="subject-code">{subject.syllabusCode}</p>

					<div class="subject-progress">
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {getSubjectProgress(subject.id)}%"
							></div>
						</div>
						<span class="progress-text">{getSubjectProgress(subject.id)}% mastery</span>
					</div>

					<div class="subject-meta">
						<span>{subject.units.length} units</span>
						<span>•</span>
						<span>{subject.externalExamWeight * 100}% external</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Study Tips -->
	<section class="tips-section">
		<h2>💡 Study Tip</h2>
		<div class="tip-card">
			<p>
				<strong>Nudgee College recommends:</strong> Aim for ~3 hours of study per ATAR subject per week.
				Use this app for quick quiz sessions during spare moments to reinforce your learning!
			</p>
		</div>
	</section>
</div>

<script context="module" lang="ts">
	function getSubjectIcon(iconName: string): string {
		const icons: Record<string, string> = {
			'cog': '⚙️',
			'brain': '🧠',
			'calculator': '🔢',
			'book-open': '📖',
			'church': '⛪',
			'briefcase': '💼'
		};
		return icons[iconName] || '📚';
	}
</script>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.greeting h1 {
		font-size: 2rem;
		margin-bottom: 0.25rem;
	}

	.greeting p {
		color: #888;
		font-size: 1.1rem;
	}

	.streak-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #f39c12, #e74c3c);
		padding: 1rem 1.5rem;
		border-radius: 12px;
	}

	.streak-flame {
		font-size: 2rem;
	}

	.streak-info {
		display: flex;
		flex-direction: column;
	}

	.streak-count {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.streak-label {
		font-size: 0.75rem;
		opacity: 0.9;
	}

	/* Quick Actions */
	.quick-actions h2 {
		margin-bottom: 1rem;
		font-size: 1.25rem;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.5rem 1rem;
		border-radius: 12px;
		text-decoration: none;
		color: white;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
	}

	.action-card.primary { background: linear-gradient(135deg, #4a90e2, #357abd); }
	.action-card.secondary { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
	.action-card.tertiary { background: linear-gradient(135deg, #27ae60, #219a52); }
	.action-card.quaternary { background: linear-gradient(135deg, #f39c12, #d68910); }

	.action-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.action-title {
		font-weight: 600;
		font-size: 1rem;
	}

	.action-desc {
		font-size: 0.75rem;
		opacity: 0.9;
	}

	/* Subjects Section */
	.subjects-section {
		margin-top: 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		font-size: 1.25rem;
	}

	.view-all {
		color: #4a90e2;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.subjects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.subject-card {
		background: #16213e;
		border-radius: 12px;
		padding: 1.25rem;
		text-decoration: none;
		color: inherit;
		border: 1px solid #0f3460;
		transition: transform 0.2s, border-color 0.2s;
	}

	.subject-card:hover {
		transform: translateY(-2px);
		border-color: var(--subject-color);
	}

	.subject-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.subject-icon {
		font-size: 1.75rem;
	}

	.subject-type {
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.subject-name {
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
		color: var(--subject-color);
	}

	.subject-code {
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.subject-progress {
		margin-bottom: 0.75rem;
	}

	.progress-bar {
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--subject-color);
		border-radius: 3px;
		transition: width 0.3s;
	}

	.progress-text {
		font-size: 0.75rem;
		color: #888;
	}

	.subject-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #666;
	}

	/* Tips Section */
	.tips-section {
		margin-top: 1rem;
	}

	.tips-section h2 {
		font-size: 1.25rem;
		margin-bottom: 0.75rem;
	}

	.tip-card {
		background: #16213e;
		border-radius: 12px;
		padding: 1.25rem;
		border-left: 4px solid #4a90e2;
	}

	.tip-card p {
		color: #b8b8b8;
		line-height: 1.6;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.greeting h1 {
			font-size: 1.5rem;
		}

		.subjects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
