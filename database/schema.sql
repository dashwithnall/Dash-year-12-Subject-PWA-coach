-- Dash Year 12 Subject PWA Coach - Database Schema
-- SQLite / PostgreSQL compatible

-- ============================================
-- CORE TABLES
-- ============================================

-- User profile and preferences
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    school TEXT DEFAULT 'St Joseph''s Nudgee College',
    year_level INTEGER DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Learning preferences
    preferred_study_time TEXT, -- 'morning', 'afternoon', 'evening'
    daily_goal_minutes INTEGER DEFAULT 30,
    notification_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '08:00',

    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    total_study_minutes INTEGER DEFAULT 0
);

-- Subjects (6 Year 12 subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    syllabus_code TEXT, -- QCAA syllabus code
    syllabus_year TEXT DEFAULT '2025',
    subject_type TEXT NOT NULL, -- 'general' or 'vet'
    color TEXT, -- UI theme color
    icon TEXT, -- Icon identifier
    external_exam_weight REAL DEFAULT 0.25, -- 25% for most, 50% for maths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units (4 per subject)
CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    unit_number INTEGER NOT NULL CHECK (unit_number BETWEEN 1 AND 4),
    name TEXT NOT NULL,
    description TEXT,
    teaching_hours INTEGER DEFAULT 55,
    is_summative BOOLEAN DEFAULT FALSE, -- Units 3-4 are summative
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(subject_id, unit_number)
);

-- Topics within units
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL REFERENCES units(id),
    topic_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    learning_objectives TEXT, -- JSON array of objectives
    estimated_hours REAL,
    complexity TEXT DEFAULT 'simple_familiar', -- 'simple_familiar', 'complex_familiar', 'complex_unfamiliar'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(unit_id, topic_number)
);

-- ============================================
-- QUIZ SYSTEM
-- ============================================

-- Quiz question bank
CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES topics(id),
    question_type TEXT NOT NULL, -- 'multiple_choice', 'fill_blank', 'matching', 'short_answer'
    question_text TEXT NOT NULL,
    question_media TEXT, -- URL or base64 for images/diagrams
    options TEXT, -- JSON array for multiple choice
    correct_answer TEXT NOT NULL,
    explanation TEXT, -- Shown after answering
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    complexity TEXT DEFAULT 'simple_familiar',
    points INTEGER DEFAULT 1,
    time_limit_seconds INTEGER DEFAULT 60,
    tags TEXT, -- JSON array of tags
    source TEXT, -- 'qcaa', 'past_paper', 'custom', 'ai_generated'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz definitions (grouped questions)
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject_id TEXT REFERENCES subjects(id),
    unit_id TEXT REFERENCES units(id),
    topic_id TEXT REFERENCES topics(id),
    quiz_type TEXT DEFAULT 'practice', -- 'practice', 'assessment', 'daily', 'exam_prep'
    question_count INTEGER NOT NULL,
    time_limit_minutes INTEGER,
    passing_score REAL DEFAULT 0.5,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    show_feedback BOOLEAN DEFAULT TRUE, -- Immediate feedback
    allow_retry BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz to question mapping
CREATE TABLE IF NOT EXISTS quiz_question_map (
    quiz_id TEXT NOT NULL REFERENCES quizzes(id),
    question_id TEXT NOT NULL REFERENCES quiz_questions(id),
    question_order INTEGER,
    PRIMARY KEY (quiz_id, question_id)
);

-- ============================================
-- PROGRESS TRACKING
-- ============================================

-- Quiz attempt history
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    quiz_id TEXT NOT NULL REFERENCES quizzes(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score REAL, -- Percentage 0-100
    correct_count INTEGER,
    total_count INTEGER,
    time_spent_seconds INTEGER,
    answers TEXT, -- JSON array of {question_id, answer, is_correct, time_spent}
    synced BOOLEAN DEFAULT FALSE, -- For offline sync
    created_offline BOOLEAN DEFAULT FALSE,

    -- Index for efficient queries
    INDEX idx_quiz_attempts_user (user_id),
    INDEX idx_quiz_attempts_quiz (quiz_id)
);

-- Topic-level learning progress (spaced repetition)
CREATE TABLE IF NOT EXISTS learning_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    topic_id TEXT NOT NULL REFERENCES topics(id),

    -- Mastery tracking
    mastery_level REAL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 1),
    total_questions_seen INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,

    -- Spaced repetition
    ease_factor REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE,
    last_review_date DATE,

    -- Timestamps
    first_seen_at TIMESTAMP,
    last_seen_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, topic_id)
);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    subject_id TEXT REFERENCES subjects(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    activity_type TEXT, -- 'quiz', 'coaching', 'review', 'reading'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AI COACHING
-- ============================================

-- Coaching conversation history
CREATE TABLE IF NOT EXISTS coaching_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    subject_id TEXT REFERENCES subjects(id),
    topic_id TEXT REFERENCES topics(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    topics_covered TEXT, -- JSON array
    insights_generated TEXT -- JSON array of AI insights
);

-- Individual coaching messages
CREATE TABLE IF NOT EXISTS coaching_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES coaching_sessions(id),
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER,
    model_used TEXT
);

-- ============================================
-- SYNC & OFFLINE
-- ============================================

-- Offline action queue
CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL, -- 'create', 'update', 'delete'
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    payload TEXT NOT NULL, -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT
);

-- ============================================
-- SEED DATA - SUBJECTS
-- ============================================

INSERT OR REPLACE INTO subjects (id, name, short_name, syllabus_code, subject_type, color, icon, external_exam_weight) VALUES
('engineering', 'Engineering', 'ENG', 'Engineering 2025 v1.2', 'general', '#FF6B6B', 'cog', 0.25),
('philosophy', 'Philosophy & Reason', 'PHIL', 'Philosophy & Reason 2025 v1.2', 'general', '#4ECDC4', 'brain', 0.25),
('maths-methods', 'Mathematical Methods', 'MATHS', 'Mathematical Methods 2025 v1.2', 'general', '#45B7D1', 'calculator', 0.50),
('english', 'General English', 'ENG', 'English 2025 v1.3', 'general', '#96CEB4', 'book-open', 0.25),
('study-of-religion', 'Study of Religion', 'SOR', 'Study of Religion 2025 v1.3', 'general', '#9B59B6', 'church', 0.25),
('business-diploma', 'Diploma of Business', 'BUS', 'BSB50120', 'vet', '#F39C12', 'briefcase', 0.00);

-- ============================================
-- SEED DATA - UNITS
-- ============================================

-- Engineering Units
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('eng-u1', 'engineering', 1, 'Engineering Fundamentals', 'Engineering''s role in solving global and local societal problems, fundamental mechanics and materials science', FALSE),
('eng-u2', 'engineering', 2, 'Emerging Technologies', 'Contemporary and future societal needs, emergence of new materials, processes, and machines', FALSE),
('eng-u3', 'engineering', 3, 'Civil Structures', 'Civil structures and their societal impact, benefits and consequences of construction', TRUE),
('eng-u4', 'engineering', 4, 'Machines and Mechanisms', 'Machines in society, materials including phase diagrams, machine control', TRUE);

-- Philosophy Units
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('phil-u1', 'philosophy', 1, 'Fundamentals of Reason', 'Introduction to critical reasoning and logic, developing coherent world-views', FALSE),
('phil-u2', 'philosophy', 2, 'Reason in Philosophy', 'Application of reasoning skills to philosophical questions, analysis of philosophical positions', FALSE),
('phil-u3', 'philosophy', 3, 'Moral Philosophy and Schools of Thought', 'Study of ethical theories: utilitarianism, Kantian ethics, virtue ethics', TRUE),
('phil-u4', 'philosophy', 4, 'Social and Political Philosophy', 'Arranging collective life, political institutions, rights, obligation, fairness, justice', TRUE);

-- Maths Methods Units
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('maths-u1', 'maths-methods', 1, 'Algebra, Statistics and Functions', 'Surds, quadratic/cubic/reciprocal functions, trigonometric functions', FALSE),
('maths-u2', 'maths-methods', 2, 'Calculus and Further Functions', 'Introduction to calculus, differentiation fundamentals, rate of change', FALSE),
('maths-u3', 'maths-methods', 3, 'Further Calculus', 'Logarithmic functions, further differentiation, integrals', TRUE),
('maths-u4', 'maths-methods', 4, 'Advanced Applications', 'Consolidation of calculus concepts, advanced applications', TRUE);

-- English Units
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('eng-lit-u1', 'english', 1, 'Foundation', 'Introduction to various text types, analysis and interpretation skills', FALSE),
('eng-lit-u2', 'english', 2, 'Australian Texts Focus', 'Study of Australian literature and culture, critical analysis', FALSE),
('eng-lit-u3', 'english', 3, 'Media and Multimodal Texts', 'Mandatory study of media texts, multimodal analysis', TRUE),
('eng-lit-u4', 'english', 4, 'Close Study of Literary Texts', 'In-depth literary analysis, critical theory applications', TRUE);

-- Study of Religion Units
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('sor-u1', 'study-of-religion', 1, 'Religion, Meaning and Purpose', 'Sacred texts, Abrahamic traditions', FALSE),
('sor-u2', 'study-of-religion', 2, 'Religion and Ritual', 'Lifecycle rituals, calendrical rituals across traditions', FALSE),
('sor-u3', 'study-of-religion', 3, 'Religious Ethics', 'Religious-ethical principles in five major traditions', TRUE),
('sor-u4', 'study-of-religion', 4, 'Religion, Rights and the Nation-State', 'Religion and government, religious freedom, human rights', TRUE);

-- Business Diploma Units (Core)
INSERT OR REPLACE INTO units (id, subject_id, unit_number, name, description, is_summative) VALUES
('bus-u1', 'business-diploma', 1, 'Critical Thinking & Communication', 'BSBCRT511, BSBXCM501 - Develop critical thinking, lead communication', TRUE),
('bus-u2', 'business-diploma', 2, 'Financial Management', 'BSBFIN501 - Manage budgets and financial plans', TRUE),
('bus-u3', 'business-diploma', 3, 'Operations & Sustainability', 'BSBOPS501, BSBSUS511 - Manage resources, sustainability policies', TRUE),
('bus-u4', 'business-diploma', 4, 'Business Skills', 'Elective units: recruitment, risk, project work, meetings', TRUE);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_topics_unit ON topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_next_review ON learning_progress(next_review_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced_at);
