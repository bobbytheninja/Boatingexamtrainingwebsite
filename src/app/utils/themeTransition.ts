/**
 * Theme switch animation, built on the View Transitions API.
 *
 * The browser snapshots the page before and after the theme changes and
 * animates between the two, so the whole switch is one composited animation
 * rather than dozens of properties transitioning in loose formation. It also
 * handles what a hand-staggered version could not: a footer that is off-screen
 * when you toggle, and a fixed nav that never moves with the page.
 *
 * The motion itself lives in globals.css — a straight-edged sheet falling from
 * the top of the screen.
 *
 * Where View Transitions are unavailable, or motion is not wanted, the theme
 * simply changes; each component's own transition still carries the colours.
 */

function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined'
    && typeof (document as any).startViewTransition === 'function';
}

function prefersReducedMotion(): boolean {
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
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    apply();
    return;
  }
  (document as any).startViewTransition(apply);
}
