import { useEffect, useState } from 'react';
import {
  peekCategories,
  fetchCategories,
  subscribeCategories,
  type ExamCategoryRecord,
} from '../utils/categoriesCache';

/**
 * The exam category list, painted from cache on the first render when one
 * exists and refreshed in the background.
 *
 * `loading` is only true when there is genuinely nothing to show. A repeat
 * visit starts with data in hand, so the page does not flash a spinner for a
 * list it already has.
 */
export function useCategories() {
  const cached = peekCategories();
  const [categories, setCategories] = useState<ExamCategoryRecord[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = subscribeCategories(next => {
      if (!cancelled) setCategories(next);
    });

    fetchCategories()
      .then(next => {
        if (cancelled) return;
        setCategories(next);
        setError(false);
      })
      .catch(() => {
        // A failed refresh does not invalidate what is already on screen;
        // only report an error when there was nothing to fall back on.
        if (!cancelled && peekCategories() === null) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { categories, loading, error };
}
