import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('kos_demo_mode') === 'true' || !isSupabaseConfigured();
  });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    
    if (supabase && !isDemoMode) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch(err => {
        console.error('Auth error:', err);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo mode fallback or unconfigured
      const storedDemoUser = localStorage.getItem('kos_demo_user');
      if (storedDemoUser) {
        setUser(JSON.parse(storedDemoUser));
      } else if (isDemoMode) {
        const defaultDemo = {
          id: 'demo-user-id',
          email: 'pemilik@kosku.com',
          user_metadata: { full_name: 'Pemilik Kos' }
        };
        setUser(defaultDemo);
        localStorage.setItem('kos_demo_user', JSON.stringify(defaultDemo));
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  const signIn = async (email, password) => {
    setAuthError('');
    if (isDemoMode) {
      const demoUser = {
        id: 'demo-user-id',
        email: email || 'pemilik@kosku.com',
        user_metadata: { full_name: 'Pemilik Kos' }
      };
      setUser(demoUser);
      localStorage.setItem('kos_demo_user', JSON.stringify(demoUser));
      return { data: { user: demoUser }, error: null };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: { message: 'Konfigurasi Supabase belum lengkap. Silakan isi di menu Pengaturan.' } };
    }

    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) {
      setAuthError(res.error.message);
    }
    return res;
  };

  const signUp = async (email, password, fullName) => {
    setAuthError('');
    if (isDemoMode) {
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        user_metadata: { full_name: fullName || 'Pemilik Kos' }
      };
      setUser(demoUser);
      localStorage.setItem('kos_demo_user', JSON.stringify(demoUser));
      return { data: { user: demoUser }, error: null };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return { data: null, error: { message: 'Konfigurasi Supabase belum lengkap.' } };
    }

    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (res.error) {
      setAuthError(res.error.message);
    }
    return res;
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('kos_demo_user');
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const toggleDemoMode = (enableDemo) => {
    setIsDemoMode(enableDemo);
    localStorage.setItem('kos_demo_mode', enableDemo ? 'true' : 'false');
    if (enableDemo) {
      const defaultDemo = {
        id: 'demo-user-id',
        email: 'pemilik@kosku.com',
        user_metadata: { full_name: 'Pemilik Kos' }
      };
      setUser(defaultDemo);
      localStorage.setItem('kos_demo_user', JSON.stringify(defaultDemo));
    } else {
      setUser(null);
      localStorage.removeItem('kos_demo_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        authError,
        signIn,
        signUp,
        signOut,
        toggleDemoMode,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
