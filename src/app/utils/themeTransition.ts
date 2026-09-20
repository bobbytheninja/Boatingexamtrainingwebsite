/**
 * Theme switch animation, built on the View Transitions API.
 *
 * The browser snapshots the page before and after the theme changes and
 * animates between the two, so the whole switch is one composited animation
 * rather than dozens of properties transitioning in loose formation. That also
 * removes the need to stagger bands by hand — the old wave could not account
 * for a footer that was off-screen, or a fixed nav that never moved.
 *
 * Three variants are available while a direction is being chosen. The active
 * one is read from ?tx= and remembered, so it can be switched on a phone
 * without a rebuild.
 */

export type ThemeTransitionVariant = 'blur' | 'radial' | 'polygon' | 'wave';

const STORAGE_KEY = 'theme_transition_variant';
const VALID: ThemeTransitionVariant[] = ['blur', 'radial', 'polygon', 'wave'];

export function getVariant(): ThemeTransitionVariant {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('tx');
    if (fromUrl && (VALID as string[]).includes(fromUrl)) {
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl as ThemeTransitionVariant;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (VALID as string[]).includes(saved)) return saved as ThemeTransitionVariant;
  } catch {
    // Fall through to the default.
  }
  return 'blur';
}

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof (document as any).startViewTransition === 'function';
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Runs `apply` inside a view transition when one is possible.
 *
 * `apply` must change the DOM synchronously — the browser captures the "after"
 * snapshot the moment it returns, so a state update that has not flushed yet
 * would be missed and the transition would animate between two identical
 * frames.
 */
export function runThemeTransition(apply: () => void): void {
  const variant = getVariant();

  if (variant === 'wave' || !supportsViewTransitions() || prefersReducedMotion()) {
    apply();
    return;
  }

  document.documentElement.dataset.tx = variant;
  const transition = (document as any).startViewTransition(apply);
  transition.finished
    .catch(() => {})
    .finally(() => {
      delete document.documentElement.dataset.tx;
    });
}
