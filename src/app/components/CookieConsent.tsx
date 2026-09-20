import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const STORAGE_KEY = 'cookie_consent_v1';

/**
 * Cookie notice, shown only when an admin has switched it on.
 *
 * The site currently sets nothing beyond what it needs to work — a session,
 * the theme, the language — which is the one case where consent is not
 * required. The banner exists so it can be turned on the moment that changes
 * (analytics being the usual trigger) without a deploy.
 *
 * Deliberately a notice with a single acknowledgement rather than
 * accept/reject: offering a reject button that does nothing would be worse
 * than not asking, and there is nothing non-essential here to reject yet.
 */
export function CookieConsent() {
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const alreadyAcknowledged = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY) === 'acknowledged';
      } catch {
        // No storage available: better to stay quiet than nag on every page.
        return true;
      }
    })();
    if (alreadyAcknowledged) return;

    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/site-settings`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data?.settings?.cookieBannerEnabled) setVisible(true);
      })
      .catch(() => {
        // Settings unreachable — leave it hidden rather than showing a banner
        // that may not be wanted.
      });

    return () => { cancelled = true; };
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'acknowledged');
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  const bg = darkMode ? '#1e293b' : '#ffffff';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const text = darkMode ? '#e2e8f0' : '#334155';

  const copy = language === 'Bulgarian'
    ? 'Използваме само необходимите бисквитки, за да поддържаме входа, езика и темата ви. Не използваме проследяване с рекламна цел.'
    : 'We use only the cookies needed to keep you signed in and remember your language and theme. No advertising trackers.';
  const button = language === 'Bulgarian' ? 'Разбрах' : 'Got it';

  return (
    <div
      role="region"
      aria-label={language === 'Bulgarian' ? 'Съобщение за бисквитки' : 'Cookie notice'}
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div
        className="mx-auto max-w-3xl rounded-lg border shadow-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ backgroundColor: bg, borderColor: border }}
      >
        <p className="text-sm flex-1" style={{ color: text }}>{copy}</p>
        <Button
          onClick={acknowledge}
          className="bg-sky-600 hover:bg-sky-700 text-white flex-shrink-0 w-full sm:w-auto"
        >
          {button}
        </Button>
      </div>
    </div>
  );
}
