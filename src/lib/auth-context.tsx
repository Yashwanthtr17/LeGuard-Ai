"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

interface AuthUser {
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useRef(createClient(supabaseUrl, supabaseAnonKey)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? "",
          name: session.user.user_metadata?.name ?? session.user.email ?? "",
        });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? "",
          name: session.user.user_metadata?.name ?? session.user.email ?? "",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return null;

    if (error.message === "Email not confirmed") {
      return "Please confirm your email address first. Check your inbox for a confirmation link.";
    }
    if (error.message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }
    return error.message;
  }, [supabase]);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<{ error: string | null; needsConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        return { error: "This email is already registered. Please sign in instead.", needsConfirmation: false };
      }
      return { error: error.message, needsConfirmation: false };
    }

    if (data?.user?.identities?.length === 0) {
      return { error: "This email is already registered. Please sign in instead.", needsConfirmation: false };
    }

    if (data?.user?.email_confirmed_at || data?.session) {
      return { error: null, needsConfirmation: false };
    }

    return { error: null, needsConfirmation: true };
  }, [supabase]);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (!error) return null;
    if (error.message.includes("Email not found")) {
      return "No account found with this email address.";
    }
    return error.message;
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
