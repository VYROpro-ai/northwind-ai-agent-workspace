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
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { WorkspaceRow } from './firestore.types';

export interface AuthContextValue {
  user: User | null;
  session: { user: User } | null;
  workspace: WorkspaceRow | null;
  workspaceLoading: boolean;
  authLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null; session: { user: User } | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: Error | null; session: { user: User } | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
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
 * Everything is a no-op in demo mode (no Firebase configured).
 *
 * workspace_members docs use the deterministic composite id
 * `${workspaceId}_${userId}` — the Firestore security rules depend on it.
 */
async function ensureWorkspace(user: User): Promise<WorkspaceRow | null> {
  if (!db) return null;

  const now = new Date().toISOString();

  // Upsert the profile doc first so it exists either way.
  const fullName = user.displayName ?? null;
  await setDoc(
    doc(db, 'profiles', user.uid),
    { id: user.uid, email: user.email ?? '', full_name: fullName, avatar_url: user.photoURL ?? null },
    { merge: true },
  );

  const membershipsSnap = await getDocs(
    query(
      collection(db, 'workspace_members'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'asc'),
    ),
  );
  for (const memberDoc of membershipsSnap.docs) {
    const workspaceId = (memberDoc.data() as { workspace_id?: string }).workspace_id;
    if (!workspaceId) continue;
    const wsSnap = await getDoc(doc(db, 'workspaces', workspaceId));
    if (wsSnap.exists()) {
      const data = wsSnap.data() as Omit<WorkspaceRow, 'id'>;
      return { id: wsSnap.id, ...data };
    }
  }

  const baseName = fullName?.trim() || (user.email ?? 'user').split('@')[0];
  const name = `${baseName} Workspace`;
  const slug = `${slugify(baseName)}-workspace-${user.uid.slice(0, 8)}`;

  const createdRef = await addDoc(collection(db, 'workspaces'), {
    name,
    slug,
    created_by: user.uid,
    created_at: now,
    updated_at: now,
  });

  await setDoc(doc(db, 'workspace_members', `${createdRef.id}_${user.uid}`), {
    workspace_id: createdRef.id,
    user_id: user.uid,
    role: 'owner',
    created_at: now,
  });

  return { id: createdRef.id, name, slug, created_by: user.uid };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const ensuredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;

    const applyUser = (next: User | null) => {
      if (cancelled) return;
      setSession(next ? { user: next } : null);
      setUser(next);
      setAuthLoading(false);
      if (next) {
        if (ensuredFor.current !== next.uid) {
          ensuredFor.current = next.uid;
          setWorkspaceLoading(true);
          void ensureWorkspace(next).then((w) => {
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

    const unsubscribe = onAuthStateChanged(auth, applyUser);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) return { error: new Error('Firebase is not configured'), session: null };
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { error: null, session: { user: cred.user } };
    } catch (e) {
      return { error: e as Error, session: null };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!auth) return { error: new Error('Firebase is not configured'), session: null };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });
      return { error: null, session: { user: cred.user } };
    } catch (e) {
      return { error: e as Error, session: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth);
    ensuredFor.current = null;
    setUser(null);
    setSession(null);
    setWorkspace(null);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = auth?.currentUser;
    if (!current) return null;
    try {
      return await current.getIdToken();
    } catch {
      return null;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return { error: new Error('Firebase is not configured') };
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      workspace,
      workspaceLoading,
      authLoading,
      signIn,
      signUp,
      signOut,
      getAccessToken,
      signInWithGoogle,
    }),
    [
      user,
      session,
      workspace,
      workspaceLoading,
      authLoading,
      signIn,
      signUp,
      signOut,
      getAccessToken,
      signInWithGoogle,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
