/**
 * Question topic classification, used by Learn mode and the admin panel.
 *
 * Questions carry an optional `topic` field once an admin sets one. When they
 * do not, they are classified here by matching keywords against the question
 * and its answers, in English and Bulgarian. So the stored value is an
 * override and this is the default — see `resolveTopic`.
 *
 * Order matters: the first pattern that matches wins, so narrower topics are
 * listed before broader ones. Two orderings are load-bearing:
 *   - Day shapes before lights: a shapes question lists vessel types whose
 *     answers often mention lights too.
 *   - `general` is last and matches anything, which is what guarantees every
 *     question lands in exactly one topic.
 */

import type { Language } from '../data/translations';

export type LearnTopic =
  | 'shapes'
  | 'lights'
  | 'sounds'
  | 'flags'
  | 'buoys'
  | 'charts'
  | 'colregs'
  | 'navigation'
  | 'instruments'
  | 'engine'
  | 'weather'
  | 'localwaters'
  | 'distress'
  | 'radioprocedure'
  | 'channels'
  | 'radioequipment'
  | 'licensing'
  | 'general';

export interface TopicDef {
  key: LearnTopic;
  /** Display name per UI language. */
  names: Record<Language, string>;
  pattern: RegExp;
}

export const LEARN_TOPICS: TopicDef[] = [
  {
    key: 'shapes',
    names: {
      English: 'Day Shapes',
      Bulgarian: 'Знаци (фигури)',
      Spanish: 'Figuras Diurnas',
      Greek: 'Σχήματα Ημέρας',
      Italian: 'Figure Diurne',
    },
    pattern: /these sh[as]pes?\b|\bday ?shapes?\b|\bshapes?\b|\bblack ball\b|\bcones?\b|\bcylinders?\b|\bdiamond\b|фигур|конус|цилиндър|ромб|signalk[öo]rper|\bkegel\b|zylinder|\bcono\b|pallone|cilindro|\brombo\b/i,
  },
  {
    key: 'lights',
    names: {
      English: 'Lights',
      Bulgarian: 'Светлини',
      Spanish: 'Luces',
      Greek: 'Φώτα',
      Italian: 'Luci',
    },
    pattern: /\blights?\b|\bsidelights?\b|masthead light|\bsternlights?\b|all-?round light|\bflashing\b|\bocculting\b|\bisophase\b|светлин|фенер|проблясв|\blicht|\blichter\b|\bfeuer\b|leuchtfeuer|\bluce\b|\bluci\b|fanale|fanali|\bluz\b|\bluces\b/i,
  },
  {
    key: 'sounds',
    names: {
      English: 'Sound Signals',
      Bulgarian: 'Звукови сигнали',
      Spanish: 'Señales Acústicas',
      Greek: 'Ηχητικά Σήματα',
      Italian: 'Segnali Acustici',
    },
    pattern: /\bsound signals?\b|\bfog signals?\b|\bwhistles?\b|\bhorns?\b|\bblasts?\b|\bbells?\b|\bgongs?\b|manoeuvring and warning|звуков|звук|свирк|камбан|schallsignal|signalton|nebelhorn|\bglocke\b|segnale acustico|\bfischi|suono|se[ñn]al ac[úu]stica/i,
  },
  {
    key: 'flags',
    names: {
      English: 'Flags',
      Bulgarian: 'Флагове',
      Spanish: 'Banderas',
      Greek: 'Σημαίες',
      Italian: 'Bandiere',
    },
    pattern: /\bflags?\b|\bpennants?\b|code letter|signal letter|\bensigns?\b|флаг|знаме|\bflagge|\bflaggen\b|bandiera|bandiere|\bbandera/i,
  },
  {
    key: 'buoys',
    names: {
      English: 'Buoys & Marks',
      Bulgarian: 'Буйове и знаци',
      Spanish: 'Boyas y Marcas',
      Greek: 'Σημαντήρες',
      Italian: 'Boe e Segnali',
    },
    pattern: /\bbuoys?\b|cardinal marks?|lateral marks?|safe water|isolated danger|special marks?|region [ab]\b|\btopmarks?\b|port hand|starboard hand|буй|кардинал|латерал|\btonne\b|\btonnen\b|betonnung|fahrwasser|\bboa\b|\bboe\b|\bmeda\b|baliza|\bboya\b/i,
  },
  {
    key: 'charts',
    names: {
      English: 'Chart Symbols',
      Bulgarian: 'Символи от карти',
      Spanish: 'Símbolos de Cartas',
      Greek: 'Σύμβολα Χαρτών',
      Italian: 'Simboli Nautici',
    },
    pattern: /\bcharts?\b|admiralty|\bsymbols?\b|\bsoundings?\b|depth contour|\bisobath|карт|символ|seekarte|\bkarte\b|carta nautica|\bcarte\b|\bsimbolo\b|carta n[áa]utica/i,
  },
  {
    key: 'colregs',
    names: {
      English: 'Collision Rules',
      Bulgarian: 'Правила за разминаване',
      Spanish: 'Reglas de Abordaje',
      Greek: 'Κανόνες Σύγκρουσης',
      Italian: 'Regole di Rotta',
    },
    pattern: /give ?way|stand ?on|overtak|crossing situation|head-?on|right of way|collision|narrow channel|in sight of one another|restricted visibility|traffic separation|\bcolregs?\b|разминав|сблъс|изпревар|тесен канал|ausweich|kurshalt|[üu]berhol|vorfahrt|kollision|precedenza|rotta libera|sorpass|\bmanovra\b|abordaje/i,
  },
  {
    key: 'navigation',
    names: {
      English: 'Navigation & Position',
      Bulgarian: 'Навигация и позиция',
      Spanish: 'Navegación y Posición',
      Greek: 'Ναυσιπλοΐα',
      Italian: 'Navigazione',
    },
    pattern: /\bbearings?\b|\bcourses?\b|latitude|longitude|coordinate|\bmeridians?\b|\bequator\b|\bparallel\b|declination|variation|deviation|\bnautical mile\b|\bknots?\b|\bspeed\b|great circle|rhumb|loxodrome|\bangle\b|\bdistance\b|\bposition\b|\bfix\b|\bgps\b|dead reckoning|ширин|дължин|координат|меридиан|курс|пеленг|склонение|девиац|\bkurs\b|peilung|seemeile|geschwindigkeit|\brotta\b|rilevamento|posizione|\bmiglia\b|velocit[àa]|\brumbo\b|\bmilla/i,
  },
  {
    key: 'instruments',
    names: {
      English: 'Instruments',
      Bulgarian: 'Уреди',
      Spanish: 'Instrumentos',
      Greek: 'Όργανα',
      Italian: 'Strumenti',
    },
    pattern: /\bcompass\b|echo ?sounder|\bradar\b|\bsextant\b|anemometer|barometer|hygrometer|\blog\b|\bais\b|\bepirb\b|navigation device|компас|ехолот|радар|уред|барометр/i,
  },
  {
    key: 'engine',
    names: {
      English: 'Engine & Systems',
      Bulgarian: 'Двигател и системи',
      Spanish: 'Motor y Sistemas',
      Greek: 'Μηχανή',
      Italian: 'Motore e Impianti',
    },
    pattern: /\bengines?\b|\bfuel\b|\bpropellers?\b|\bbatter(y|ies)\b|\bbilge\b|outboard|inboard|\bmotore?\b|carburante|\belica\b|\bmotor\b|kraftstoff|двигател|гориво|витло|акумулатор|combustible|h[ée]lice/i,
  },
  {
    key: 'weather',
    names: {
      English: 'Weather & Sea',
      Bulgarian: 'Време и море',
      Spanish: 'Meteorología y Mar',
      Greek: 'Καιρός',
      Italian: 'Meteo e Mare',
    },
    pattern: /\bwinds?\b|\bweather\b|beaufort|\btides?\b|\bcurrents?\b|\bhumidity\b|\bfog\b|\bstorm\b|\bwaves?\b|\bforecast\b|\bpressure\b|вятър|време|прилив|течени|влажност|мъгла|\bwetter\b|\bwind\b|\bwelle|gezeit|str[öo]mung|\bvento\b|\bonda\b|\bmarea\b|corrente|\bmeteo\b|viento/i,
  },
  {
    key: 'localwaters',
    names: {
      English: 'Local Waters',
      Bulgarian: 'Местни води',
      Spanish: 'Aguas Locales',
      Greek: 'Τοπικά Ύδατα',
      Italian: 'Acque Locali',
    },
    pattern: /\bcape\b|black sea|bulgaria|\bvarna\b|\bburgas\b|\bemine\b|athanasius|magnetic anomaly|нос |черно море|българ|варна|бургас/i,
  },

  // --- Radio topics. These only match radio-operator exams, so they simply
  // report zero (and stay hidden) on the maritime exams, and vice versa. ---
  {
    key: 'distress',
    names: {
      English: 'Distress & Urgency',
      Bulgarian: 'Бедствие и спешност',
      Spanish: 'Socorro y Urgencia',
      Greek: 'Κίνδυνος',
      Italian: 'Soccorso e Urgenza',
    },
    pattern: /\bmayday\b|\bpan[- ]?pan\b|s[ée]curit[ée]|\bdistress\b|\burgency\b|мейдей|бедств|спешн|тревог|авари|спасител|seenot|notruf|\brettung|soccorso|emergenza|\bpericolo\b|socorro|emergencia/i,
  },
  {
    key: 'radioprocedure',
    names: {
      English: 'Radio Procedure',
      Bulgarian: 'Радиопроцедури',
      Spanish: 'Procedimiento Radio',
      Greek: 'Διαδικασίες Ασυρμάτου',
      Italian: 'Procedure Radio',
    },
    pattern: /\bcall sign\b|phonetic|spelling alphabet|\bover\b and \bout\b|позивн|повикван|предаван|приеман|съобщени|дежурств|процедур/i,
  },
  {
    key: 'channels',
    names: {
      English: 'Channels & Frequencies',
      Bulgarian: 'Канали и честоти',
      Spanish: 'Canales y Frecuencias',
      Greek: 'Κανάλια & Συχνότητες',
      Italian: 'Canali e Frequenze',
    },
    pattern: /channel\s*\d|\bvhf\b|\bfrequenc|\bmhz\b|simplex|duplex|\bкана[лг]|честот|\bукв\b|\bмхц\b|обхват/i,
  },
  {
    key: 'radioequipment',
    names: {
      English: 'Radio Equipment',
      Bulgarian: 'Радиооборудване',
      Spanish: 'Equipo de Radio',
      Greek: 'Εξοπλισμός Ασυρμάτου',
      Italian: 'Apparati Radio',
    },
    pattern: /\bgmdss\b|\bdsc\b|\bmmsi\b|navtex|\bsart\b|\bepirb\b|\bantenna\b|радиостанц|антена|батер|мощност|смущен/i,
  },
  {
    key: 'licensing',
    names: {
      English: 'Licensing & Rules',
      Bulgarian: 'Правила и удостоверения',
      Spanish: 'Licencias y Normas',
      Greek: 'Άδειες & Κανόνες',
      Italian: 'Licenze e Norme',
    },
    pattern: /\blicen[cs]|certificate of competen|удостоверен|оператор|\bкурс\b|\bизпит\b|правил|разрешител/i,
  },
  {
    // Catch-all. Must stay last, and must match everything, so that no question
    // is ever left without a topic.
    key: 'general',
    names: {
      English: 'General Theory',
      Bulgarian: 'Обща теория',
      Spanish: 'Teoría General',
      Greek: 'Γενική Θεωρία',
      Italian: 'Teoria Generale',
    },
    pattern: /.*/,
  },
];

export const TOPIC_BY_KEY: Record<LearnTopic, TopicDef> = Object.fromEntries(
  LEARN_TOPICS.map(t => [t.key, t]),
) as Record<LearnTopic, TopicDef>;

/**
 * Turn a free-text category from a spreadsheet into a topic key.
 *
 * Accepts the key itself ("buoys"), the English or Bulgarian display name, and
 * a few spellings people actually type. Case, spacing, punctuation and the
 * ampersand in names like "Buoys & Marks" are all ignored. Returns null for
 * anything unrecognised so the importer can report it rather than guess.
 */
export function parseTopicValue(raw: string | undefined | null): LearnTopic | null {
  if (!raw) return null;
  const norm = (s: string) => s.toLowerCase().replace(/[&\s_\-.,()]+/g, '');
  const v = norm(raw);
  if (!v) return null;

  for (const t of LEARN_TOPICS) {
    if (v === norm(t.key)) return t.key;
    if (Object.values(t.names).some(n => norm(n) === v)) return t.key;
  }

  const aliases: Record<string, LearnTopic> = {
    shape: 'shapes', dayshape: 'shapes', figures: 'shapes', znaci: 'shapes',
    light: 'lights', svetlini: 'lights',
    sound: 'sounds', soundsignal: 'sounds', signals: 'sounds', zvuk: 'sounds',
    flag: 'flags', flagove: 'flags',
    buoy: 'buoys', buoyage: 'buoys', marks: 'buoys', buoysandmarks: 'buoys',
    chart: 'charts', chartsymbol: 'charts', symbols: 'charts', karti: 'charts',
    colreg: 'colregs', collision: 'colregs', collisionregulations: 'colregs', rules: 'colregs',
    nav: 'navigation', position: 'navigation', navigationposition: 'navigation',
    instrument: 'instruments', devices: 'instruments', uredi: 'instruments',
    weathersea: 'weather', sea: 'weather', vreme: 'weather',
    local: 'localwaters', localwater: 'localwaters', geography: 'localwaters',
    theory: 'general', generaltheory: 'general', other: 'general', misc: 'general',
  };
  return aliases[v] ?? null;
}

/** The topic's display name in the given UI language. */
export function topicLabel(topic: LearnTopic, language: Language): string {
  return TOPIC_BY_KEY[topic].names[language] ?? TOPIC_BY_KEY[topic].names.English;
}

/** Anything with a question and answers — works for both DB and local shapes. */
export interface ClassifiableQuestion {
  question?: string;
  questionText?: string;
  answers?: string[];
  answerA?: string;
  answerB?: string;
  answerC?: string;
  answerD?: string;
  /** Admin override. When set, classification is skipped. */
  topic?: LearnTopic | null;
}

function textOf(q: ClassifiableQuestion): string {
  return [
    q.question ?? q.questionText ?? '',
    ...(q.answers ?? []),
    q.answerA ?? '',
    q.answerB ?? '',
    q.answerC ?? '',
    q.answerD ?? '',
  ].filter(Boolean).join(' ');
}

/** The topic a question falls into by keyword. Always returns one. */
export function categorizeQuestion(q: ClassifiableQuestion): LearnTopic {
  const text = textOf(q);
  for (const topic of LEARN_TOPICS) {
    if (topic.pattern.test(text)) return topic.key;
  }
  return 'general';
}

/** An admin-set topic if there is one, otherwise the classified default. */
export function resolveTopic(q: ClassifiableQuestion): LearnTopic {
  return q.topic ?? categorizeQuestion(q);
}

/** How many questions fall into each topic. Topics with none are present, at 0. */
export function countByTopic(questions: ClassifiableQuestion[]): Record<LearnTopic, number> {
  const counts = Object.fromEntries(
    LEARN_TOPICS.map(t => [t.key, 0]),
  ) as Record<LearnTopic, number>;

  for (const q of questions) counts[resolveTopic(q)] += 1;
  return counts;
}

/** The subset of questions belonging to one topic. */
export function filterByTopic<T extends ClassifiableQuestion>(questions: T[], topic: LearnTopic): T[] {
  return questions.filter(q => resolveTopic(q) === topic);
}
