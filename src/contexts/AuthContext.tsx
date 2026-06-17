import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "internal" | "external";
export type UserType = "external" | "internal" | "administrator";
export type UserStatus = "active" | "inactive";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  user_type: UserType;
  status: UserStatus;
  company: string | null;
  phone: string | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    userType?: UserType;
  }) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Friendly mapping for Supabase auth error messages
function friendlyAuthError(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (m.includes("user already registered")) return "An account with this email already exists.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Password is too weak. Use at least 8 characters with a mix of letters and numbers.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network")) return "Network error. Check your connection and try again.";
  return "We couldn't complete that request. Please try again.";
}

async function loadProfileAndRoles(userId: string) {
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const profile = (profileRes.data as Profile | null) ?? null;
  const roles = ((rolesRes.data as { role: AppRole }[] | null) ?? []).map((r) => r.role);
  return { profile, roles };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      setRoles([]);
      return;
    }
    // Defer DB calls so onAuthStateChange handler returns quickly
    setTimeout(async () => {
      const { profile, roles } = await loadProfileAndRoles(u.id);
      setProfile(profile);
      setRoles(roles);
    }, 0);
  }, []);

  useEffect(() => {
    // Register listener FIRST, then read existing session
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
      } else {
        hydrate(sess?.user ?? null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      hydrate(data.session?.user ?? null).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyAuthError(error.message) };
    return {};
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(async ({ email, password, fullName, userType }) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, user_type: userType ?? "external" },
      },
    });
    if (error) return { error: friendlyAuthError(error.message) };
    // If email confirmation is required, session will be null
    const needsConfirmation = !data.session;
    return { needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const sendPasswordReset = useCallback<AuthState["sendPasswordReset"]>(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: friendlyAuthError(error.message) };
    return {};
  }, []);

  const updatePassword = useCallback<AuthState["updatePassword"]>(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: friendlyAuthError(error.message) };
    return {};
  }, []);

  const refresh = useCallback(async () => {
    if (user) {
      const { profile, roles } = await loadProfileAndRoles(user.id);
      setProfile(profile);
      setRoles(roles);
    }
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      profile,
      roles,
      loading,
      isAuthenticated: !!session,
      hasRole: (role) => roles.includes(role),
      hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refresh,
    }),
    [user, session, profile, roles, loading, signIn, signUp, signOut, sendPasswordReset, updatePassword, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
