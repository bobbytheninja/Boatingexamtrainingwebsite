import { countByTopic, LEARN_TOPICS, type LearnTopic } from './questionTopics';
import { api } from './api';

/**
 * Cache for the per-topic question counts shown on the Learn tiles.
 *
 * Working them out means fetching the whole question bank — around 56KB for the
 * 50GT exam, and a separate KV read per question on the server — so doing it
 * every time Learn is opened is why the tiles sat on "Checking…".
 *
 * The counts only change when questions are imported or re-categorised, so they
 * are cached for the session and the work happens once. Two callers share one
 * request, and the page warms the cache on mount so the numbers are usually
 * already in hand by the time anyone selects Learn.
 */

type Counts = Record<LearnTopic, number>;

const STORAGE_KEY = 'topic_counts_v1';

const memory = new Map<string, Counts>();
const inFlight = new Map<string, Promise<Counts>>();

function readStorage(): Record<string, Counts> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStorage(examType: string, counts: Counts): void {
  try {
    const all = readStorage();
    all[examType] = counts;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Private mode or full quota — the in-memory copy still serves this session.
  }
}

/** Counts already known for this exam, without waiting. */
export function peekTopicCounts(examType: string): Counts | null {
  const inMemory = memory.get(examType);
  if (inMemory) return inMemory;

  const stored = readStorage()[examType];
  if (stored) {
    memory.set(examType, stored);
    return stored;
  }
  return null;
}

/** Counts for this exam, fetching once and sharing the request. */
export function fetchTopicCounts(examType: string, token: string | null): Promise<Counts> {
  const cached = peekTopicCounts(examType);
  if (cached) return Promise.resolve(cached);

  const existing = inFlight.get(examType);
  if (existing) return existing;

  const empty = () =>
    Object.fromEntries(LEARN_TOPICS.map(t => [t.key, 0])) as Counts;

  /**
   * Counts come from the public endpoint where possible, because the tiles
   * show them to people who have not paid. That endpoint reports stored topics
   * only, so where an exam has never been categorised it falls back to
   * classifying the question bank here — which needs a subscription, and is
   * why a locked visitor sees counts only once an admin has assigned them.
   */
  const request = api.getTopicCounts(examType)
    .then(res => {
      const hasStored = Object.keys(res.counts || {}).length > 0;
      if (hasStored && res.unassigned === 0) {
        return { ...empty(), ...(res.counts as Partial<Counts>) } as Counts;
      }
      if (!token) {
        // Partial is still better than nothing for a visitor who cannot fetch
        // the bank; an uncategorised exam simply shows no numbers.
        return { ...empty(), ...(res.counts as Partial<Counts>) } as Counts;
      }
      return api.getAllQuestions(examType, token)
        .then(full => countByTopic(full.questions || []) as Counts);
    })
    .then(counts => {
      memory.set(examType, counts);
      writeStorage(examType, counts);
      return counts;
    })
    .finally(() => inFlight.delete(examType));

  inFlight.set(examType, request);
  return request;
}

/**
 * Start the work early, ignoring the result.
 *
 * Called when the mode page mounts, so the fetch overlaps with the person
 * reading the page and choosing a mode rather than starting after they click.
 */
export function prefetchTopicCounts(examType: string, token: string | null): void {
  if (!examType) return;
  if (peekTopicCounts(examType)) return;
  fetchTopicCounts(examType, token).catch(() => {});
}

/** Drop the counts for an exam after its questions change. */
export function invalidateTopicCounts(examType?: string): void {
  if (examType) {
    memory.delete(examType);
  } else {
    memory.clear();
  }
  try {
    if (examType) {
      const all = readStorage();
      delete all[examType];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Nothing persisted; the in-memory clear above is enough.
  }
}
