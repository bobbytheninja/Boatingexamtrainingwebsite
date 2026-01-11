import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { ExamType } from '../data/examQuestions';

interface UserData {
  id: string;
  email: string;
  name?: string;
  subscriptions: ExamType[];
  subscriptionExpiresAt?: number | null;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  accessToken: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user subscriptions from backend
  const fetchSubscriptions = async (userId: string, token: string): Promise<{ subscriptions: ExamType[], expiresAt: number | null }> => {
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
        return { subscriptions: [], expiresAt: null };
      }

      const data = await response.json();
      return { 
        subscriptions: data.subscriptions || [], 
        expiresAt: data.expiresAt || null 
      };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return { subscriptions: [], expiresAt: null };
    }
  };

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[YachtExam App] Error loading session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const token = session.access_token;
          const { subscriptions, expiresAt } = await fetchSubscriptions(session.user.id, token);
          
          // Check admin status
          const isAdmin = session.user.user_metadata?.role === 'admin' || false;
          
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            subscriptions,
            subscriptionExpiresAt: expiresAt,
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const token = session.access_token;
        
        // Try to fetch subscriptions, but don't fail if backend is down
        let subscriptions: ExamType[] = [];
        let expiresAt: number | null = null;
        
        try {
          const result = await fetchSubscriptions(session.user.id, token);
          subscriptions = result.subscriptions;
          expiresAt = result.expiresAt;
        } catch (subError) {
          console.warn('Could not fetch subscriptions on auth change, continuing with empty subscriptions:', subError);
        }
        
        // Check admin status
        const isAdmin = session.user.user_metadata?.role === 'admin' || false;
        
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          subscriptions,
          subscriptionExpiresAt: expiresAt,
          isAdmin,
        });
        setAccessToken(token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        const token = data.session.access_token;
        
        // Try to fetch subscriptions, but don't fail signup if backend is down
        let subscriptions: ExamType[] = [];
        let expiresAt: number | null = null;
        
        try {
          const result = await fetchSubscriptions(data.session.user.id, token);
          subscriptions = result.subscriptions;
          expiresAt = result.expiresAt;
        } catch (subError) {
          console.warn('Could not fetch subscriptions, continuing with empty subscriptions:', subError);
          // Signup still succeeds even if subscription fetch fails
        }
        
        // Check admin status
        const isAdmin = data.session.user.user_metadata?.role === 'admin' || false;
        
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name,
          subscriptions,
          subscriptionExpiresAt: expiresAt,
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        const token = data.session.access_token;
        
        // Try to fetch subscriptions, but don't fail login if backend is down
        let subscriptions: ExamType[] = [];
        let expiresAt: number | null = null;
        
        try {
          const result = await fetchSubscriptions(data.session.user.id, token);
          subscriptions = result.subscriptions;
          expiresAt = result.expiresAt;
        } catch (subError) {
          console.warn('Could not fetch subscriptions, continuing with empty subscriptions:', subError);
          // Login still succeeds even if subscription fetch fails
        }
        
        // Check admin status
        const isAdmin = data.session.user.user_metadata?.role === 'admin' || false;
        
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name,
          subscriptions,
          subscriptionExpiresAt: expiresAt,
          isAdmin,
        });
        setAccessToken(token);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setAccessToken(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const refreshSubscriptions = async () => {
    if (!user || !accessToken) return;
    
    const { subscriptions, expiresAt } = await fetchSubscriptions(user.id, accessToken);
    setUser({ ...user, subscriptions, subscriptionExpiresAt: expiresAt });
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