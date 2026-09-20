/**
 * Controls the strip iOS Safari paints behind the status bar.
 *
 * In Safari's bottom-toolbar layout the page viewport starts below the status
 * bar, so nothing the page renders can reach that strip — CSS cannot paint it
 * and viewport-fit=cover does not move it. Safari fills it from the document
 * background and the theme-color meta instead, which is why it showed white:
 * the dark-mode context sets body background to #ffffff in light mode.
 *
 * Both are set here so the strip continues whatever sits directly beneath it.
 */

function meta(): HTMLMetaElement {
  let el = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.name = 'theme-color';
    document.head.appendChild(el);
  }
  return el;
}

export function setTopBarColor(color: string): void {
  try {
    meta().setAttribute('content', color);
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  } catch {
    // Non-critical decoration — never let it break a render.
  }
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
