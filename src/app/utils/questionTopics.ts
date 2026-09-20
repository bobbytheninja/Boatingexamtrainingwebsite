/**
 * Learn-mode topic classification.
 *
 * Questions are not tagged with a topic in the database, so they are classified
 * at runtime by matching keywords against the question and its answers. Patterns
 * cover English and Bulgarian, since the same exam category exists in both.
 *
 * Order matters: the first pattern that matches wins, so narrower topics are
 * listed before broader ones. Day shapes in particular must be tested before
 * lights — a shapes question often lists vessel types whose answers also
 * mention lights.
 */

export type LearnTopic = 'shapes' | 'lights' | 'sounds' | 'flags' | 'buoys' | 'charts';

export interface TopicDef {
  key: LearnTopic;
  en: string;
  bg: string;
  pattern: RegExp;
}

export const LEARN_TOPICS: TopicDef[] = [
  {
    key: 'shapes',
    en: 'Day Shapes',
    bg: 'Знаци (фигури)',
    pattern: /these sh[as]pes?\b|\bday ?shapes?\b|\bblack ball\b|\bcone\b|\bcylinder\b|\bdiamond shape|фигур|конус|цилиндър/i,
  },
  {
    key: 'lights',
    en: 'Lights',
    bg: 'Светлини',
    pattern: /\blights?\b|sidelight|masthead light|sternlight|all-?round light|светлин|фенер/i,
  },
  {
    key: 'sounds',
    en: 'Sound Signals',
    bg: 'Звукови сигнали',
    pattern: /\bsound signal|\bfog signal|\bwhistle\b|\bhorn\b|\bblasts?\b|\bbell\b|\bgong\b|manoeuvring and warning|звуков|звук|свирк|камбан/i,
  },
  {
    key: 'flags',
    en: 'Flags',
    bg: 'Флагове',
    pattern: /\bflags?\b|\bpennant\b|code letter|signal letter|\bensign\b|флаг|знаме/i,
  },
  {
    key: 'buoys',
    en: 'Buoys & Marks',
    bg: 'Буйове и знаци',
    pattern: /\bbuoys?\b|cardinal mark|lateral mark|safe water|isolated danger|special mark|region [ab]\b|\btopmark\b|port hand|starboard hand|буй|кардинал|латерал/i,
  },
  {
    key: 'charts',
    en: 'Chart Symbols',
    bg: 'Символи от карти',
    pattern: /\bchart\b|admiralty|\bsymbol\b|\bsounding\b|depth contour|карт|символ/i,
  },
];

/** Anything with a question and answers — works for both DB and local shapes. */
interface ClassifiableQuestion {
  question?: string;
  questionText?: string;
  answers?: string[];
  answerA?: string;
  answerB?: string;
  answerC?: string;
  answerD?: string;
}

function textOf(q: ClassifiableQuestion): string {
  const parts = [
    q.question ?? q.questionText ?? '',
    ...(q.answers ?? []),
    q.answerA ?? '',
    q.answerB ?? '',
    q.answerC ?? '',
    q.answerD ?? '',
  ];
  return parts.filter(Boolean).join(' ');
}

/** Returns the topic a question belongs to, or null if it fits none of them. */
export function categorizeQuestion(q: ClassifiableQuestion): LearnTopic | null {
  const text = textOf(q);
  if (!text.trim()) return null;
  for (const topic of LEARN_TOPICS) {
    if (topic.pattern.test(text)) return topic.key;
  }
  return null;
}

/** How many questions fall into each topic. Topics with none are still present, at 0. */
export function countByTopic(questions: ClassifiableQuestion[]): Record<LearnTopic, number> {
  const counts = Object.fromEntries(
    LEARN_TOPICS.map(t => [t.key, 0]),
  ) as Record<LearnTopic, number>;

  for (const q of questions) {
    const topic = categorizeQuestion(q);
    if (topic) counts[topic] += 1;
  }
  return counts;
}

/** The subset of questions belonging to one topic. */
export function filterByTopic<T extends ClassifiableQuestion>(questions: T[], topic: LearnTopic): T[] {
  return questions.filter(q => categorizeQuestion(q) === topic);
}
