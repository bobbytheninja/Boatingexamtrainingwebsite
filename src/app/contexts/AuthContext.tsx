import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { ExamType } from '../data/examQuestions';

interface UserData {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
  subscriptions: ExamType[];
  subscriptionExpiresAt?: number | null;
  perExamExpiry?: Record<string, number>;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  accessToken: string | null;
  forcedLogoutMessage: string | null;
  clearForcedLogoutMessage: () => void;
  triggerForcedLogout: (message: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseClient = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [forcedLogoutMessage, setForcedLogoutMessage] = useState<string | null>(null);

  // Fetch user subscriptions from backend
  const fetchSubscriptions = async (userId: string, token: string): Promise<{ subscriptions: ExamType[], expiresAt: number | null, perExamExpiry: Record<string, number> }> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/subscriptions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch subscriptions:', await response.text());
        return { subscriptions: [], expiresAt: null, perExamExpiry: {} };
      }

      const data = await response.json();
      return {
        subscriptions: data.subscriptions || [],
        expiresAt: data.expiresAt || null,
        perExamExpiry: data.perExamExpiry || {},
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return { subscriptions: [], expiresAt: null, perExamExpiry: {} };
    }
  };

  const clearForcedLogoutMessage = useCallback(() => setForcedLogoutMessage(null), []);

  const triggerForcedLogout = useCallback(async (message: string) => {
    await supabaseClient.auth.signOut({ scope: 'local' });
    setUser(null);
    setAccessToken(null);
    setForcedLogoutMessage(message);
  }, []);

  // Check if the current session is still the active one on the backend
  const checkSessionValidity = useCallback(async (token: string) => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/session-check`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === 'string' && data.error.includes('another device')
          ? 'You were signed in on another device. You have been logged out here.'
          : 'Your session has expired. Please sign in again.';
        await supabaseClient.auth.signOut({ scope: 'local' });
        setUser(null);
        setAccessToken(null);
        setForcedLogoutMessage(msg);
      }
    } catch {
      // Network error — don't sign out
    }
  }, []);

  // Sync active_session in KV with the current JWT so backend verifyUser never mismatches
  const syncActiveSession = async (token: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/invalidate-sessions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      // Non-critical — backend will still accept valid Supabase JWTs
    }
  };

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('[YachtExam App] Error loading session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const token = session.access_token;

          // Sync active_session FIRST so subscription fetch succeeds
          await syncActiveSession(token);

          const { subscriptions, expiresAt, perExamExpiry } = await fetchSubscriptions(session.user.id, token);

          const isAdmin = session.user.user_metadata?.role === 'admin' || false;

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            created_at: session.user.created_at,
            subscriptions,
            subscriptionExpiresAt: expiresAt,
            perExamExpiry,
            isAdmin,
          });
          setAccessToken(token);
        }
      } catch (error) {
        console.error('[YachtExam App] Error in loadSession:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession().catch(err => {
      console.error('[YachtExam App] Unhandled error in loadSession:', err);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const token = session.access_token;

        // Always sync active_session before fetching subscriptions
        await syncActiveSession(token);

        let subscriptions: ExamType[] = [];
        let expiresAt: number | null = null;
        let perExamExpiry: Record<string, number> = {};

        try {
          const result = await fetchSubscriptions(session.user.id, token);
          subscriptions = result.subscriptions;
          expiresAt = result.expiresAt;
          perExamExpiry = result.perExamExpiry;
        } catch (subError) {
          console.warn('Could not fetch subscriptions on auth change:', subError);
        }

        const isAdmin = session.user.user_metadata?.role === 'admin' || false;

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          created_at: session.user.created_at,
          subscriptions,
          subscriptionExpiresAt: expiresAt,
          perExamExpiry,
          isAdmin,
        });
        setAccessToken(token);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Supabase silently refreshed the JWT — sync active_session with the new token
        const token = session.access_token;
        setAccessToken(token);
        await syncActiveSession(token);

        try {
          const result = await fetchSubscriptions(session.user.id, token);
          setUser(prev => prev ? {
            ...prev,
            subscriptions: result.subscriptions,
            subscriptionExpiresAt: result.expiresAt,
            perExamExpiry: result.perExamExpiry,
          } : prev);
        } catch (subError) {
          console.warn('Could not refresh subscriptions after token refresh:', subError);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Poll session validity every 30 s, on window focus, and on tab visibility change
  useEffect(() => {
    if (!user || !accessToken) return;
    // Run once immediately after a short delay (avoids false positive during login flow)
    const initial = setTimeout(() => checkSessionValidity(accessToken), 3_000);
    const interval = setInterval(() => checkSessionValidity(accessToken), 30_000);
    const onFocus = () => checkSessionValidity(accessToken);
    // visibilitychange fires when switching tabs; focus fires when switching OS windows
    const onVisible = () => { if (!document.hidden) checkSessionValidity(accessToken); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, accessToken, checkSessionValidity]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { publicAnonKey } = await import('../utils/supabase/info');
      
      // Call backend to create user (with email verification auto-confirmed)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
        throw new Error(errorData.message || 'Signup failed');
      }

      // Now sign in the user
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        const token = data.session.access_token;
        
        let subscriptions: ExamType[] = [];
        let expiresAt: number | null = null;
        let perExamExpiry: Record<string, number> = {};

        try {
          const result = await fetchSubscriptions(data.session.user.id, token);
          subscriptions = result.subscriptions;
          expiresAt = result.expiresAt;
          perExamExpiry = result.perExamExpiry;
        } catch (subError) {
          console.warn('Could not fetch subscriptions, continuing with empty subscriptions:', subError);
        }

        const isAdmin = data.session.user.user_metadata?.role === 'admin' || false;

        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name,
          created_at: data.session.user.created_at,
          subscriptions,
          subscriptionExpiresAt: expiresAt,
          perExamExpiry,
          isAdmin,
        });
        setAccessToken(token);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // ✅ Step 1: Sign in the user
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Wait until session is fully established
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session - token not ready yet');
      }

      const token = session.access_token;

      // Invalidate all other sessions (prevents account sharing)
      try {
        const invalidateResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/invalidate-sessions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!invalidateResponse.ok) {
          const errorData = await invalidateResponse.json().catch(async () => ({ message: await invalidateResponse.text() }));
          console.error('Failed to invalidate other sessions:', errorData);
        }
      } catch (sessionError) {
        console.error('Exception while invalidating other sessions:', sessionError);
      }
      
      let subscriptions: ExamType[] = [];
      let expiresAt: number | null = null;
      let perExamExpiry: Record<string, number> = {};

      try {
        const result = await fetchSubscriptions(session.user.id, token);
        subscriptions = result.subscriptions;
        expiresAt = result.expiresAt;
        perExamExpiry = result.perExamExpiry;
      } catch (subError) {
        console.warn('Could not fetch subscriptions, continuing with empty subscriptions:', subError);
      }

      const isAdmin = session.user.user_metadata?.role === 'admin' || false;

      setUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        created_at: session.user.created_at,
        subscriptions,
        subscriptionExpiresAt: expiresAt,
        perExamExpiry,
        isAdmin,
      });
      setAccessToken(token);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear the active session from the backend FIRST (before Supabase signOut)
      if (user && accessToken) {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/logout`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
        } catch (logoutError) {
          console.error('Failed to clear session from backend:', logoutError);
          // Continue with local logout even if backend fails
        }
      }
      
      // Sign out locally (only this device, not globally)
      const { error } = await supabaseClient.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/send-reset-email`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to send reset email');
    }
  };

  const refreshSubscriptions = async () => {
    if (!user || !accessToken) return;
    const { subscriptions, expiresAt, perExamExpiry } = await fetchSubscriptions(user.id, accessToken);
    setUser({ ...user, subscriptions, subscriptionExpiresAt: expiresAt, perExamExpiry });
  };

  const deleteAccount = async () => {
    if (!user || !accessToken) {
      throw new Error('No user logged in');
    }

    try {
      // Call backend to delete account and all associated data
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete account' }));
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Sign out after successful deletion
      await signOut();
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const checkAdminStatus = async () => {
    if (!user || !accessToken) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/check-admin`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(prevUser => prevUser ? { ...prevUser, isAdmin: data.isAdmin || false } : null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        forcedLogoutMessage,
        clearForcedLogoutMessage,
        triggerForcedLogout,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshSubscriptions,
        deleteAccount,
        checkAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}