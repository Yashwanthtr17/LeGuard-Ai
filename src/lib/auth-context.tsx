"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser, useLogin, useRegister, useLogout, useUpdateProfile } from "@/lib/hooks/use-auth";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<string | null>;
  signup: (name: string, email: string, password: string, country?: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();

  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean): Promise<string | null> => {
      try {
        await loginMutation.mutateAsync({ email, password, remember_me: rememberMe });
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Login failed";
      }
    },
    [loginMutation]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, country?: string): Promise<string | null> => {
      try {
        await registerMutation.mutateAsync({
          full_name: name,
          email,
          password,
          default_country: country,
        });
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Registration failed";
      }
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const updateUser = useCallback(
    (data: Partial<AuthUser>) => {
      const { full_name, default_country, risk_sensitivity, onboarding_complete } = data;
      updateProfileMutation.mutate({ full_name, default_country, risk_sensitivity, onboarding_complete });
    },
    [updateProfileMutation]
  );

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
