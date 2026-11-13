import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import type { WorkspaceRow } from './database.types';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  workspace: WorkspaceRow | null;
  workspaceLoading: boolean;
  authLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; session: Session | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'workspace';

/**
 * After login, use the user's earliest workspace; otherwise create one named
 * "<Name|email prefix> Workspace" with the user as owner, and upsert the profile.
 * Everything is a no-op in demo mode (no Supabase configured).
 */
async function ensureWorkspace(user: User): Promise<WorkspaceRow | null> {
  if (!supabase) return null;

  // Upsert the profile row first so it exists either way.
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email ?? '', full_name: fullName }, { onConflict: 'id' });

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, slug, created_by)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const existing = (memberships ?? [])
    .map((m) => (m as unknown as { workspaces: WorkspaceRow | null }).workspaces)
    .filter((w): w is WorkspaceRow => Boolean(w));
  if (existing.length > 0) return existing[0];

  const baseName = fullName?.trim() || (user.email ?? 'user').split('@')[0];
  const name = `${baseName} Workspace`;
  const slug = `${slugify(baseName)}-workspace-${user.id.slice(0, 8)}`;

  const { data: created, error } = await supabase
    .from('workspaces')
    .insert({ name, slug, created_by: user.id })
    .select('id, name, slug, created_by')
    .single();
  if (error || !created) return null;

  await supabase
    .from('workspace_members')
    .insert({ workspace_id: (created as WorkspaceRow).id, user_id: user.id, role: 'owner' });
  return created as WorkspaceRow;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const ensuredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;

    const applySession = (next: Session | null) => {
      if (cancelled) return;
      setSession(next);
      setUser(next?.user ?? null);
      setAuthLoading(false);
      if (next?.user) {
        if (ensuredFor.current !== next.user.id) {
          ensuredFor.current = next.user.id;
          setWorkspaceLoading(true);
          void ensureWorkspace(next.user).then((w) => {
            if (!cancelled) {
              setWorkspace(w);
              setWorkspaceLoading(false);
            }
          });
        }
      } else {
        ensuredFor.current = null;
        setWorkspace(null);
        setWorkspaceLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => applySession(data.session ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => applySession(next));
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured'), session: null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null, session: data.session };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: new Error('Supabase is not configured'), session: null };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error as Error | null, session: data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    ensuredFor.current = null;
    setUser(null);
    setSession(null);
    setWorkspace(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, workspace, workspaceLoading, authLoading, signIn, signUp, signOut }),
    [user, session, workspace, workspaceLoading, authLoading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
