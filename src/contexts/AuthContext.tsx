"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContextType, User, UserRole } from "@/types";
import {
  signOut as supabaseSignOut,
  signInWithOtp as supabaseSignInWithOtp,
  getSession,
  supabase,
} from "@/utils/supabase";

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signInWithMagicLink: async () => {},
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize the auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();

        if (session) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            role: (session.user.app_metadata.role as UserRole) || "user",
          };
          setUser(user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          role: (session.user.app_metadata.role as UserRole) || "user",
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const authUser = data.user;
      if (authUser) {
        const user: User = {
          id: authUser.id,
          email: authUser.email || "",
          role: (authUser.app_metadata.role as UserRole) || "user",
        };
        setUser(user);
        setTimeout(() => {
          router.push("/");
        }, 0);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with magic link
  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      await supabaseSignInWithOtp(email);
      // We don't set the user here because they need to click the email link
    } catch (error) {
      console.error("Magic link error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setUser(null);
      setTimeout(() => {
        router.push("/login");
      }, 0);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
