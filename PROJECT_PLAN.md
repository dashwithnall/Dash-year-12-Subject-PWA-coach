# Dash Year 12 Subject PWA Coach

## Project Overview

An offline-first Progressive Web App (PWA) for Year 12 learning with AI coaching powered by MCP (Model Context Protocol) servers. Designed for Nudgee College Queensland curriculum.

## Target User

**Dashiel Withnall** - Year 12 student at St Joseph's Nudgee College, Queensland

## Subjects Covered

1. **Engineering** (General Senior Syllabus)
2. **Philosophy & Reason** (General Senior Syllabus)
3. **Mathematical Methods** (General Senior Syllabus)
4. **General English** (General Senior Syllabus)
5. **Study of Religion** (General Senior Syllabus)
6. **Business Diploma** (BSB50120 VET)

---

## Research Summary

### Microsoft Learning & Quiz Concepts

Based on Microsoft's 2025 educational technology releases:

- **Study and Learn Agent**: Adaptive AI with flashcards, matching, fill-in-blank, quizzes
- **Copilot Notebooks**: Upload notes → generate study guides with quizzes
- **Key Features**: Immediate feedback, branching logic, answer explanations, save & resume

### QCAA Curriculum Structure

All general subjects follow:
- **4 Units**: Units 1-2 (formative), Units 3-4 (summative for ATAR)
- **55 hours per unit** (220 hours total)
- **Assessment**: 75% internal, 25% external (50% external for Maths)
- **Complexity**: 60% simple familiar, 20% complex familiar, 20% complex unfamiliar

### PWA Architecture Decision

**Framework: SvelteKit** (Recommended)
- 1.85KB bundle size
- 95/100 performance score
- Compile-time optimization
- Excellent PWA tooling via Workbox

### MCP Server Architecture

Three core servers planned:
1. **Curriculum Server** - Year 12 subject content with RAG pipeline
2. **Profile Server** - Student preferences and authentication
3. **Progress Tracking Server** - Learning analytics and adaptive pathways

---

## Technical Stack

```
Frontend:       SvelteKit + Svelte 5
PWA:            Workbox (service workers)
Storage:        IndexedDB (idb-keyval)
Hosting:        Firebase Hosting
Auth:           Firebase Auth
Database:       Firestore + SQLite (local)
AI:             MCP Servers + Claude API
Notifications:  Firebase Cloud Messaging
```

---

## Folder Structure

```
/dash-year-12-subject-pwa-coach/
├── src/
│   ├── routes/                    # SvelteKit routes
│   │   ├── +page.svelte          # Dashboard
│   │   ├── +layout.svelte        # App shell
│   │   ├── subjects/
│   │   │   ├── engineering/
│   │   │   ├── philosophy/
│   │   │   ├── maths-methods/
│   │   │   ├── english/
│   │   │   ├── study-of-religion/
│   │   │   └── business-diploma/
│   │   ├── quiz/
│   │   │   ├── [id]/+page.svelte
│   │   │   └── results/
│   │   ├── coach/                 # AI coaching interface
│   │   └── progress/              # Learning analytics
│   ├── lib/
│   │   ├── stores/                # Svelte stores
│   │   ├── db/                    # IndexedDB layer
│   │   ├── mcp/                   # MCP client code
│   │   ├── sync/                  # Background sync
│   │   └── components/            # Reusable components
│   └── service-worker.ts          # PWA service worker
├── static/
│   ├── manifest.json              # Web app manifest
│   ├── icons/                     # PWA icons
│   └── offline.html               # Offline fallback
├── curriculum/                    # Subject curriculum data
│   ├── engineering/
│   ├── philosophy/
│   ├── maths-methods/
│   ├── english/
│   ├── study-of-religion/
│   └── business-diploma/
├── mcp-servers/                   # MCP server implementations
│   ├── curriculum-server/
│   ├── profile-server/
│   └── progress-server/
├── database/                      # Schema and migrations
│   ├── schema.sql
│   └── seed-data/
└── sync/                          # Folder sync configuration
    └── config.json
```

---

## Database Schema (High-Level)

### Tables

1. **users** - Student profile and preferences
2. **subjects** - Subject metadata (6 subjects)
3. **units** - Unit structure (4 per subject)
4. **topics** - Topic breakdown per unit
5. **quiz_questions** - Question bank
6. **quiz_attempts** - Student attempt history
7. **learning_progress** - Mastery tracking per topic
8. **study_sessions** - Time tracking

### Key Relationships

```
users → quiz_attempts → quiz_questions
users → learning_progress → topics → units → subjects
```

---

## Key Features

### 1. Offline-First Quiz System
- Cache quiz content via service workers
- Complete quizzes offline
- Background sync when online

### 2. AI Coaching (MCP)
- Socratic method - guide through questions
- Adaptive difficulty based on progress
- Grounded in QCAA curriculum via RAG

### 3. Progress Tracking
- Topic-level mastery visualization
- Streak tracking for motivation
- Performance analytics dashboard

### 4. Spaced Repetition
- Smart review scheduling
- Focus on weak areas
- Exam preparation mode

### 5. Push Notifications
- Daily study reminders
- Streak maintenance alerts
- Achievement notifications

---

## Folder Synchronization

### Google Drive Integration

**Target Folder**: `/Users/dashielwithnall/My Drive/Dash-Claude-Builds`

### Subject Folders to Sync

| Subject | Local Path | Drive Path |
|---------|------------|------------|
| Engineering | `~/School/Engineering` | `Dash-Claude-Builds/subjects/engineering` |
| Philosophy | `~/School/Philosophy` | `Dash-Claude-Builds/subjects/philosophy` |
| Maths Methods | `~/School/Maths-Methods` | `Dash-Claude-Builds/subjects/maths-methods` |
| English | `~/School/English` | `Dash-Claude-Builds/subjects/english` |
| Study of Religion | `~/School/Study-of-Religion` | `Dash-Claude-Builds/subjects/study-of-religion` |
| Business Diploma | `~/School/Business-Diploma` | `Dash-Claude-Builds/subjects/business-diploma` |

---

## Development Phases

### Phase 1: Foundation (Current)
- [x] Initialize git repository
- [x] Research completion
- [ ] Create project structure
- [ ] Set up SvelteKit with PWA
- [ ] Design database schema

### Phase 2: Core PWA
- [ ] Build quiz UI components
- [ ] Implement IndexedDB storage
- [ ] Set up service workers
- [ ] Create offline fallback

### Phase 3: Curriculum Data
- [ ] Import QCAA syllabus data
- [ ] Create question bank
- [ ] Build curriculum browser

### Phase 4: AI Coaching (MCP)
- [ ] Set up MCP servers
- [ ] Implement RAG pipeline
- [ ] Build coaching interface
- [ ] Add Socratic dialogue

### Phase 5: Sync & Polish
- [ ] Google Drive sync setup
- [ ] Push notifications
- [ ] Performance optimization
- [ ] Production deployment

---

## Resources

### QCAA Syllabuses
- [Engineering 2025 v1.2](https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_engineering_25_syll.pdf)
- [Philosophy & Reason 2025 v1.2](https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_philosophy_reason_25_syll.pdf)
- [Mathematical Methods 2025 v1.2](https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_maths_methods_25_syll.pdf)
- [English 2025 v1.3](https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_english_25_syll.pdf)
- [Study of Religion 2025 v1.3](https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_study_religion_25_syll.pdf)
- [BSB50120 Diploma of Business](https://training.gov.au/training/details/BSB50120)

### Technical Docs
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Workbox PWA Guide](https://developers.google.com/web/tools/workbox)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## Notes

- **Nudgee College 2025 Results**: 99% QCE attainment, Median ATAR 88.6
- **Study Recommendation**: ~3 hours per ATAR subject per week
- **External Exam Timing**: Term 4, Year 12 (Maths/Science)
