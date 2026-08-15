import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isLiveSupabase: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoUser: (userKey: 'alice' | 'bob') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'hacktrack_local_users';
const LOCAL_SESSION_KEY = 'hacktrack_active_session';

interface StoredLocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

// Simple hash simulation for local development
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

function getStoredUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredLocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isLive = isSupabaseConfigured() && supabase !== null;

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      setLoading(true);
      try {
        if (isLive && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              created_at: session.user.created_at,
            });
          } else {
            setUser(null);
          }

          // Listen for Supabase auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                created_at: session.user.created_at,
              });
            } else {
              setUser(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local Storage Auth Session Hydration
          const rawSession = localStorage.getItem(LOCAL_SESSION_KEY);
          if (rawSession) {
            try {
              const parsedUser = JSON.parse(rawSession);
              setUser(parsedUser);
            } catch {
              localStorage.removeItem(LOCAL_SESSION_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, [isLive]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    if (isLive && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          created_at: data.user.created_at,
        });
        return { success: true };
      }
    }

    // Local Mode Authentication
    const users = getStoredUsers();
    const existing = users.find((u) => u.email === trimmedEmail);

    if (!existing) {
      return {
        success: false,
        error: 'No account found with this email address. Please register first.',
      };
    }

    if (existing.passwordHash !== simpleHash(password)) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    const sessionUser: UserProfile = {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      created_at: existing.created_at,
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Please enter your name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (isLive && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: trimmedName,
          email: trimmedEmail,
          created_at: data.user.created_at,
        });
        return { success: true };
      }
    }

    // Local Mode Registration
    const users = getStoredUsers();
    if (users.some((u) => u.email === trimmedEmail)) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      };
    }

    const newUser: StoredLocalUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: simpleHash(password),
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const sessionUser: UserProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at,
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true };
  };

  const logout = async () => {
    if (isLive && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
  };

  // Helper function to quickly switch demo users during evaluation
  const switchDemoUser = async (userKey: 'alice' | 'bob') => {
    const demoProfiles = {
      alice: {
        id: 'usr_demo_user_a_alice',
        name: 'Alice (Developer A)',
        email: 'alice@hacktrack.io',
      },
      bob: {
        id: 'usr_demo_user_b_bob',
        name: 'Bob (Competitor B)',
        email: 'bob@hacktrack.io',
      },
    };

    const target = demoProfiles[userKey];
    const sessionUser: UserProfile = {
      id: target.id,
      name: target.name,
      email: target.email,
      created_at: new Date().toISOString(),
    };

    // Ensure user is recorded in local registry
    const users = getStoredUsers();
    if (!users.some((u) => u.id === target.id)) {
      users.push({
        id: target.id,
        name: target.name,
        email: target.email,
        passwordHash: simpleHash('password123'),
        created_at: sessionUser.created_at || new Date().toISOString(),
      });
      saveStoredUsers(users);
    }

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLiveSupabase: isLive,
        login,
        register,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
