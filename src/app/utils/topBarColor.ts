/**
 * Controls the strip iOS Safari paints behind the status bar.
 *
 * In Safari's bottom-toolbar layout the page viewport starts below the status
 * bar, so nothing the page renders can reach that strip — CSS cannot paint it
 * and viewport-fit=cover does not move it. Safari fills it from the document
 * background and the theme-color meta instead, which is why it showed white:
 * the dark-mode context sets the body background, and theme-color was a static
 * value that was never updated.
 *
 * Two callers write here and they must not fight: the dark-mode context sets a
 * per-theme default on every switch, while a page may override it for as long
 * as it is mounted (the home page matches the top of its hero photo). The
 * override is held separately so a theme change re-applies it rather than
 * replacing it, which would otherwise show as a flash back and forth.
 */

let themeDefault = '#ffffff';
let override: string | null = null;

function apply(color: string): void {
  try {
    let el = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.name = 'theme-color';
      document.head.appendChild(el);
    }
    el.setAttribute('content', color);
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  } catch {
    // Non-critical decoration — never let it break a render.
  }
}

/** Called by the dark-mode context. Yields to an active page override. */
export function setThemeTopColor(color: string): void {
  themeDefault = color;
  apply(override ?? color);
}

/** Called by a page that sits under the status bar with something of its own. */
export function setTopBarOverride(color: string): void {
  override = color;
  apply(color);
}

/** Restores whichever theme colour is current. */
export function clearTopBarOverride(): void {
  override = null;
  apply(themeDefault);
}

/** The page background for each theme, used when a page has nothing special at its top. */
export const THEME_TOP_COLOR = {
  light: '#ffffff',
  dark: '#1e293b',
} as const;

/**
 * Average colour of the top of the hero photo, darkened for the navigation
 * bar's overlay. Used on the home page so the strip reads as a continuation of
 * the image rather than a white band above it.
 */
export const HERO_TOP_COLOR = '#6c7279';
