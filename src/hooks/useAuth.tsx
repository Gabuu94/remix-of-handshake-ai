import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_BOOT_TIMEOUT_MS = 2500;
const AUTH_REQUEST_TIMEOUT_MS = 8000;

function toError(error: unknown, fallback: string) {
  if (error instanceof Error) return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error(fallback);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const applySession = (nextSession: Session | null) => {
      if (!isActive) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    const failFastToSignedOut = async () => {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (error) {
        console.error("Local sign-out fallback failed:", error);
      }

      if (!isActive) return;
      setSession(null);
      setUser(null);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    void (async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_BOOT_TIMEOUT_MS,
          "Connection timed out while restoring your session."
        );

        if (error) throw error;
        applySession(data.session);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        await failFastToSignedOut();
      }
    })();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "The backend is taking too long to respond. Please try again."
      );

      return { error };
    } catch (error) {
      return { error: toError(error, "Unable to sign up right now.") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        AUTH_REQUEST_TIMEOUT_MS,
        "The backend is taking too long to respond. Please try again."
      );

      return { error };
    } catch (error) {
      return { error: toError(error, "Unable to sign in right now.") };
    }
  };

  const signOut = async () => {
    try {
      await withTimeout(
        supabase.auth.signOut(),
        AUTH_REQUEST_TIMEOUT_MS,
        "The backend is taking too long to respond."
      );
    } catch (error) {
      console.error("Remote sign-out failed, clearing local session:", error);
      await supabase.auth.signOut({ scope: "local" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
