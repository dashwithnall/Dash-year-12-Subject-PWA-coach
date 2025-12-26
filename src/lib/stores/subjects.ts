/**
 * Subject Store - Year 12 Subject Data and State Management
 *
 * Manages the 6 Year 12 subjects for Nudgee College Queensland
 */

import { writable, derived, type Readable } from 'svelte/store';

// ============================================
// TYPES
// ============================================

export interface Subject {
	id: string;
	name: string;
	shortName: string;
	syllabusCode: string;
	type: 'general' | 'vet';
	color: string;
	icon: string;
	externalExamWeight: number;
	units: Unit[];
}

export interface Unit {
	id: string;
	number: 1 | 2 | 3 | 4;
	name: string;
	description: string;
	teachingHours: number;
	isSummative: boolean;
	topics: Topic[];
}

export interface Topic {
	id: string;
	number: number;
	name: string;
	description?: string;
	learningObjectives: string[];
	estimatedHours: number;
	complexity: 'simple_familiar' | 'complex_familiar' | 'complex_unfamiliar';
}

// ============================================
// SUBJECT DATA
// ============================================

export const SUBJECTS: Subject[] = [
	{
		id: 'engineering',
		name: 'Engineering',
		shortName: 'ENG',
		syllabusCode: 'Engineering 2025 v1.2',
		type: 'general',
		color: '#FF6B6B',
		icon: 'cog',
		externalExamWeight: 0.25,
		units: [
			{
				id: 'eng-u1',
				number: 1,
				name: 'Engineering Fundamentals',
				description: "Engineering's role in solving global and local societal problems",
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'eng-u1-t1', number: 1, name: 'Problem-solving process in engineering', learningObjectives: ['Recognise engineering problems', 'Apply systematic problem-solving'], estimatedHours: 15, complexity: 'simple_familiar' },
					{ id: 'eng-u1-t2', number: 2, name: 'Fundamental mechanics', learningObjectives: ['Understand forces and motion', 'Apply mechanics principles'], estimatedHours: 20, complexity: 'complex_familiar' },
					{ id: 'eng-u1-t3', number: 3, name: 'Materials science concepts', learningObjectives: ['Identify material properties', 'Select appropriate materials'], estimatedHours: 20, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'eng-u2',
				number: 2,
				name: 'Emerging Technologies',
				description: 'Contemporary and future societal needs through technology',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'eng-u2-t1', number: 1, name: 'New materials and processes', learningObjectives: ['Research emerging materials', 'Evaluate technological solutions'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'eng-u2-t2', number: 2, name: 'Future technologies', learningObjectives: ['Analyse future needs', 'Propose innovative solutions'], estimatedHours: 30, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'eng-u3',
				number: 3,
				name: 'Civil Structures',
				description: 'Civil structures and their societal impact',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'eng-u3-t1', number: 1, name: 'Structural analysis', learningObjectives: ['Analyse structural problems', 'Calculate loads and forces'], estimatedHours: 30, complexity: 'complex_familiar' },
					{ id: 'eng-u3-t2', number: 2, name: 'Construction impacts', learningObjectives: ['Evaluate social impacts', 'Consider environmental consequences'], estimatedHours: 25, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'eng-u4',
				number: 4,
				name: 'Machines and Mechanisms',
				description: 'Machines in society, materials, and machine control',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'eng-u4-t1', number: 1, name: 'Machines in society', learningObjectives: ['Understand machine purposes', 'Analyse machine systems'], estimatedHours: 15, complexity: 'simple_familiar' },
					{ id: 'eng-u4-t2', number: 2, name: 'Advanced materials', learningObjectives: ['Apply phase diagrams', 'Calculate using lever rule'], estimatedHours: 25, complexity: 'complex_unfamiliar' },
					{ id: 'eng-u4-t3', number: 3, name: 'Machine control', learningObjectives: ['Design control systems', 'Implement feedback loops'], estimatedHours: 15, complexity: 'complex_familiar' }
				]
			}
		]
	},
	{
		id: 'philosophy',
		name: 'Philosophy & Reason',
		shortName: 'PHIL',
		syllabusCode: 'Philosophy & Reason 2025 v1.2',
		type: 'general',
		color: '#4ECDC4',
		icon: 'brain',
		externalExamWeight: 0.25,
		units: [
			{
				id: 'phil-u1',
				number: 1,
				name: 'Fundamentals of Reason',
				description: 'Critical reasoning and logic foundations',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'phil-u1-t1', number: 1, name: 'Critical reasoning', learningObjectives: ['Identify logical fallacies', 'Construct valid arguments'], estimatedHours: 25, complexity: 'simple_familiar' },
					{ id: 'phil-u1-t2', number: 2, name: 'Developing world-views', learningObjectives: ['Examine different perspectives', 'Formulate coherent positions'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'phil-u2',
				number: 2,
				name: 'Reason in Philosophy',
				description: 'Application of reasoning to philosophical questions',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'phil-u2-t1', number: 1, name: 'Philosophical analysis', learningObjectives: ['Analyse philosophical positions', 'Compare different schools of thought'], estimatedHours: 30, complexity: 'complex_familiar' },
					{ id: 'phil-u2-t2', number: 2, name: 'Informed discourse', learningObjectives: ['Articulate viewpoints clearly', 'Engage in philosophical debate'], estimatedHours: 25, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'phil-u3',
				number: 3,
				name: 'Moral Philosophy',
				description: 'Study of ethical theories and their applications',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'phil-u3-t1', number: 1, name: 'Ethical theories', learningObjectives: ['Understand utilitarianism', 'Apply Kantian ethics', 'Evaluate virtue ethics'], estimatedHours: 35, complexity: 'complex_familiar' },
					{ id: 'phil-u3-t2', number: 2, name: 'Applied ethics', learningObjectives: ['Apply ethics to real cases', 'Resolve ethical dilemmas'], estimatedHours: 20, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'phil-u4',
				number: 4,
				name: 'Social and Political Philosophy',
				description: 'Rights, obligation, fairness, and justice',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'phil-u4-t1', number: 1, name: 'Political institutions', learningObjectives: ['Analyse governmental systems', 'Evaluate political structures'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'phil-u4-t2', number: 2, name: 'Justice and rights', learningObjectives: ['Understand concepts of justice', 'Apply rights frameworks'], estimatedHours: 30, complexity: 'complex_unfamiliar' }
				]
			}
		]
	},
	{
		id: 'maths-methods',
		name: 'Mathematical Methods',
		shortName: 'MATHS',
		syllabusCode: 'Mathematical Methods 2025 v1.2',
		type: 'general',
		color: '#45B7D1',
		icon: 'calculator',
		externalExamWeight: 0.50, // Higher external weight for maths
		units: [
			{
				id: 'maths-u1',
				number: 1,
				name: 'Algebra, Statistics and Functions',
				description: 'Surds, functions, and trigonometry',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'maths-u1-t1', number: 1, name: 'Surds and algebra', learningObjectives: ['Simplify surd expressions', 'Apply algebraic techniques'], estimatedHours: 15, complexity: 'simple_familiar' },
					{ id: 'maths-u1-t2', number: 2, name: 'Functions and graphs', learningObjectives: ['Graph quadratic functions', 'Analyse function behaviour'], estimatedHours: 20, complexity: 'complex_familiar' },
					{ id: 'maths-u1-t3', number: 3, name: 'Trigonometric functions', learningObjectives: ['Graph trig functions', 'Solve trig equations'], estimatedHours: 20, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'maths-u2',
				number: 2,
				name: 'Calculus and Further Functions',
				description: 'Introduction to calculus and differentiation',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'maths-u2-t1', number: 1, name: 'Introduction to calculus', learningObjectives: ['Understand limits', 'Apply first principles'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'maths-u2-t2', number: 2, name: 'Differentiation', learningObjectives: ['Differentiate polynomials', 'Apply chain rule'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'maths-u3',
				number: 3,
				name: 'Further Calculus',
				description: 'Logarithms, advanced differentiation, integrals',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'maths-u3-t1', number: 1, name: 'Logarithmic functions', learningObjectives: ['Apply log laws', 'Graph log functions'], estimatedHours: 15, complexity: 'complex_familiar' },
					{ id: 'maths-u3-t2', number: 2, name: 'Further differentiation', learningObjectives: ['Find stationary points', 'Analyse maxima/minima'], estimatedHours: 20, complexity: 'complex_familiar' },
					{ id: 'maths-u3-t3', number: 3, name: 'Integrals', learningObjectives: ['Anti-differentiate', 'Calculate definite integrals'], estimatedHours: 20, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'maths-u4',
				number: 4,
				name: 'Advanced Applications',
				description: 'Integration of mathematical domains',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'maths-u4-t1', number: 1, name: 'Advanced calculus', learningObjectives: ['Apply integration techniques', 'Solve complex problems'], estimatedHours: 30, complexity: 'complex_unfamiliar' },
					{ id: 'maths-u4-t2', number: 2, name: 'Mathematical modelling', learningObjectives: ['Create mathematical models', 'Interpret real-world data'], estimatedHours: 25, complexity: 'complex_unfamiliar' }
				]
			}
		]
	},
	{
		id: 'english',
		name: 'General English',
		shortName: 'ENG',
		syllabusCode: 'English 2025 v1.3',
		type: 'general',
		color: '#96CEB4',
		icon: 'book-open',
		externalExamWeight: 0.25,
		units: [
			{
				id: 'eng-lit-u1',
				number: 1,
				name: 'Foundation',
				description: 'Text analysis and interpretation foundations',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'eng-lit-u1-t1', number: 1, name: 'Text types', learningObjectives: ['Identify text features', 'Analyse text structures'], estimatedHours: 25, complexity: 'simple_familiar' },
					{ id: 'eng-lit-u1-t2', number: 2, name: 'Analysis skills', learningObjectives: ['Apply analytical frameworks', 'Write analytical responses'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'eng-lit-u2',
				number: 2,
				name: 'Australian Texts Focus',
				description: 'Study of Australian literature and culture',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'eng-lit-u2-t1', number: 1, name: 'Australian literature', learningObjectives: ['Analyse Australian texts', 'Connect to cultural contexts'], estimatedHours: 30, complexity: 'complex_familiar' },
					{ id: 'eng-lit-u2-t2', number: 2, name: 'Australian perspectives', learningObjectives: ['Identify Australian themes', 'Evaluate cultural representations'], estimatedHours: 25, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'eng-lit-u3',
				number: 3,
				name: 'Media and Multimodal Texts',
				description: 'Analysis of media and multimodal features',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'eng-lit-u3-t1', number: 1, name: 'Media texts', learningObjectives: ['Analyse media techniques', 'Evaluate media messages'], estimatedHours: 30, complexity: 'complex_familiar' },
					{ id: 'eng-lit-u3-t2', number: 2, name: 'Multimodal analysis', learningObjectives: ['Analyse visual elements', 'Interpret combined modes'], estimatedHours: 25, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'eng-lit-u4',
				number: 4,
				name: 'Close Study of Literary Texts',
				description: 'In-depth literary analysis and critical theory',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'eng-lit-u4-t1', number: 1, name: 'Literary analysis', learningObjectives: ['Apply critical theories', 'Write extended analyses'], estimatedHours: 30, complexity: 'complex_unfamiliar' },
					{ id: 'eng-lit-u4-t2', number: 2, name: 'Critical interpretation', learningObjectives: ['Evaluate multiple interpretations', 'Synthesise critical perspectives'], estimatedHours: 25, complexity: 'complex_unfamiliar' }
				]
			}
		]
	},
	{
		id: 'study-of-religion',
		name: 'Study of Religion',
		shortName: 'SOR',
		syllabusCode: 'Study of Religion 2025 v1.3',
		type: 'general',
		color: '#9B59B6',
		icon: 'church',
		externalExamWeight: 0.25,
		units: [
			{
				id: 'sor-u1',
				number: 1,
				name: 'Religion, Meaning and Purpose',
				description: 'Sacred texts and Abrahamic traditions',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'sor-u1-t1', number: 1, name: 'Sacred texts', learningObjectives: ['Identify features of sacred texts', 'Analyse textual meanings'], estimatedHours: 25, complexity: 'simple_familiar' },
					{ id: 'sor-u1-t2', number: 2, name: 'Abrahamic traditions', learningObjectives: ['Compare Judaism, Christianity, Islam', 'Analyse shared themes'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'sor-u2',
				number: 2,
				name: 'Religion and Ritual',
				description: 'Lifecycle and calendrical rituals',
				teachingHours: 55,
				isSummative: false,
				topics: [
					{ id: 'sor-u2-t1', number: 1, name: 'Lifecycle rituals', learningObjectives: ['Analyse birth, marriage, death rituals', 'Compare across traditions'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'sor-u2-t2', number: 2, name: 'Calendrical rituals', learningObjectives: ['Understand annual observances', 'Evaluate ritual significance'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'sor-u3',
				number: 3,
				name: 'Religious Ethics',
				description: 'Ethical principles across major traditions',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'sor-u3-t1', number: 1, name: 'Ethical foundations', learningObjectives: ['Identify religious ethical principles', 'Understand ethical frameworks'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'sor-u3-t2', number: 2, name: 'Applied religious ethics', learningObjectives: ['Apply ethics to real contexts', 'Evaluate ethical decisions'], estimatedHours: 30, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'sor-u4',
				number: 4,
				name: 'Religion, Rights and the Nation-State',
				description: 'Religion and government, human rights',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'sor-u4-t1', number: 1, name: 'Religion and nation-state', learningObjectives: ['Analyse church-state relations', 'Evaluate religious freedom'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'sor-u4-t2', number: 2, name: 'Religion and human rights', learningObjectives: ['Understand rights frameworks', 'Analyse contemporary issues'], estimatedHours: 30, complexity: 'complex_unfamiliar' }
				]
			}
		]
	},
	{
		id: 'business-diploma',
		name: 'Diploma of Business',
		shortName: 'BUS',
		syllabusCode: 'BSB50120',
		type: 'vet',
		color: '#F39C12',
		icon: 'briefcase',
		externalExamWeight: 0, // VET has no external exam
		units: [
			{
				id: 'bus-u1',
				number: 1,
				name: 'Critical Thinking & Communication',
				description: 'BSBCRT511, BSBXCM501 competencies',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'bus-u1-t1', number: 1, name: 'Critical thinking', learningObjectives: ['Develop critical thinking skills', 'Foster problem-solving'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'bus-u1-t2', number: 2, name: 'Workplace communication', learningObjectives: ['Lead communication strategies', 'Apply leadership skills'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'bus-u2',
				number: 2,
				name: 'Financial Management',
				description: 'BSBFIN501 - Budgets and financial plans',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'bus-u2-t1', number: 1, name: 'Budget management', learningObjectives: ['Prepare budgets', 'Monitor financial performance'], estimatedHours: 30, complexity: 'complex_familiar' },
					{ id: 'bus-u2-t2', number: 2, name: 'Financial planning', learningObjectives: ['Develop financial plans', 'Analyse financial reports'], estimatedHours: 25, complexity: 'complex_unfamiliar' }
				]
			},
			{
				id: 'bus-u3',
				number: 3,
				name: 'Operations & Sustainability',
				description: 'BSBOPS501, BSBSUS511 competencies',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'bus-u3-t1', number: 1, name: 'Resource management', learningObjectives: ['Allocate resources', 'Optimise operations'], estimatedHours: 25, complexity: 'complex_familiar' },
					{ id: 'bus-u3-t2', number: 2, name: 'Sustainability policies', learningObjectives: ['Develop sustainability policies', 'Implement environmental practices'], estimatedHours: 30, complexity: 'complex_familiar' }
				]
			},
			{
				id: 'bus-u4',
				number: 4,
				name: 'Business Skills',
				description: 'Elective competencies',
				teachingHours: 55,
				isSummative: true,
				topics: [
					{ id: 'bus-u4-t1', number: 1, name: 'Project management', learningObjectives: ['Plan projects', 'Execute project work'], estimatedHours: 20, complexity: 'complex_familiar' },
					{ id: 'bus-u4-t2', number: 2, name: 'Risk management', learningObjectives: ['Identify risks', 'Implement mitigation strategies'], estimatedHours: 20, complexity: 'complex_unfamiliar' },
					{ id: 'bus-u4-t3', number: 3, name: 'Meeting management', learningObjectives: ['Plan meetings', 'Facilitate effectively'], estimatedHours: 15, complexity: 'simple_familiar' }
				]
			}
		]
	}
];

// ============================================
// STORES
// ============================================

// All subjects
export const subjects = writable<Subject[]>(SUBJECTS);

// Currently selected subject
export const selectedSubjectId = writable<string | null>(null);

// Derived: Currently selected subject data
export const selectedSubject: Readable<Subject | undefined> = derived(
	[subjects, selectedSubjectId],
	([$subjects, $id]) => $subjects.find(s => s.id === $id)
);

// Currently selected unit
export const selectedUnitId = writable<string | null>(null);

// Derived: Currently selected unit data
export const selectedUnit: Readable<Unit | undefined> = derived(
	[selectedSubject, selectedUnitId],
	([$subject, $id]) => $subject?.units.find(u => u.id === $id)
);

// Derived: Get all topics across all subjects (flattened)
export const allTopics: Readable<Topic[]> = derived(
	subjects,
	($subjects) => $subjects.flatMap(s => s.units.flatMap(u => u.topics))
);

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSubjectById(id: string): Subject | undefined {
	return SUBJECTS.find(s => s.id === id);
}

export function getUnitById(subjectId: string, unitId: string): Unit | undefined {
	const subject = getSubjectById(subjectId);
	return subject?.units.find(u => u.id === unitId);
}

export function getTopicById(topicId: string): Topic | undefined {
	for (const subject of SUBJECTS) {
		for (const unit of subject.units) {
			const topic = unit.topics.find(t => t.id === topicId);
			if (topic) return topic;
		}
	}
	return undefined;
}

export function getSubjectForTopic(topicId: string): Subject | undefined {
	for (const subject of SUBJECTS) {
		for (const unit of subject.units) {
			if (unit.topics.some(t => t.id === topicId)) {
				return subject;
			}
		}
	}
	return undefined;
}

export function getUnitForTopic(topicId: string): Unit | undefined {
	for (const subject of SUBJECTS) {
		for (const unit of subject.units) {
			if (unit.topics.some(t => t.id === topicId)) {
				return unit;
			}
		}
	}
	return undefined;
}

// Get total topics count for a subject
export function getTopicCount(subjectId: string): number {
	const subject = getSubjectById(subjectId);
	return subject?.units.reduce((sum, u) => sum + u.topics.length, 0) ?? 0;
}

// Get total hours for a subject
export function getTotalHours(subjectId: string): number {
	const subject = getSubjectById(subjectId);
	return subject?.units.reduce((sum, u) => sum + u.teachingHours, 0) ?? 0;
}
