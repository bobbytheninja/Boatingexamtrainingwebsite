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
 * Both are set together here so the strip simply follows the theme.
 */

export function setThemeTopColor(color: string): void {
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

/** The page background for each theme. */
export const THEME_TOP_COLOR = {
  light: '#ffffff',
  dark: '#1e293b',
} as const;
