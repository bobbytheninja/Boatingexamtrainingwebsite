import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91`;

/** Site-wide switches an admin can flip without a deploy. */
export function SiteSettings() {
  const { darkMode } = useDarkMode();
  const { accessToken } = useAuth();
  const [cookieBanner, setCookieBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/site-settings`, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setCookieBanner(!!d?.settings?.cookieBannerEnabled))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: boolean) => {
    setSaving(true);
    // Show the new position straight away; put it back if the save fails.
    const previous = cookieBanner;
    setCookieBanner(next);
    try {
      const res = await fetch(`${BASE}/site-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ cookieBannerEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      toast.success(next ? 'Cookie notice is now shown to visitors.' : 'Cookie notice is now hidden.');
    } catch (err: any) {
      setCookieBanner(previous);
      toast.error(err.message || 'Could not save the setting');
    } finally {
      setSaving(false);
    }
  };

  const text = darkMode ? '#e2e8f0' : '#1e293b';
  const muted = darkMode ? '#94a3b8' : '#64748b';

  return (
    <Card style={{ background: darkMode ? '#1e293b' : undefined, borderColor: darkMode ? '#334155' : undefined }}>
      <CardHeader>
        <CardTitle style={{ color: text }}>Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: text }}>Cookie notice</p>
            <p className="text-sm mt-1" style={{ color: muted }}>
              Off by default. The site only sets what it needs to work — your session,
              language and theme — which does not require consent. Turn this on if you
              add analytics or anything that tracks visitors, which does.
            </p>
          </div>
          <Button
            onClick={() => save(!cookieBanner)}
            disabled={loading || saving}
            variant="outline"
            className="flex-shrink-0 w-28"
            style={{
              borderColor: cookieBanner ? '#10b981' : (darkMode ? '#475569' : '#cbd5e1'),
              backgroundColor: cookieBanner
                ? (darkMode ? 'rgba(6,95,70,0.4)' : 'rgba(16,185,129,0.12)')
                : 'transparent',
              color: cookieBanner ? (darkMode ? '#6ee7b7' : '#047857') : muted,
            }}
          >
            {saving ? <ButtonSpinner /> : loading ? '…' : cookieBanner ? 'On' : 'Off'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
