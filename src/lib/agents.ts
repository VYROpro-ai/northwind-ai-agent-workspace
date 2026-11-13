import type { IconName } from '@/components/icons';
import type { AgentTone } from '@/components/ui';
import type { Person } from '@/data/people';
import type { AgentModel, AgentStatus, AgentSummary } from '@/pages/agents/data';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { AgentRow, AgentVersionRow } from './firestore.types';

export type DbAgentStatus = AgentRow['status'];

export interface CreateAgentInput {
  name: string;
  description: string;
  instructions: string;
  model: string;
  temperature: number;
  tags: string[];
  icon: string;
  tone: string;
}

export type UpdateAgentPatch = Partial<
  Pick<AgentRow, 'name' | 'description' | 'instructions' | 'model' | 'temperature' | 'status' | 'tags' | 'icon' | 'tone'>
>;

/* ------------------------------------------------------------------ */
/* Mapping between DB rows and the template's AgentSummary shape       */
/* ------------------------------------------------------------------ */

const dbToDisplayStatus: Record<DbAgentStatus, AgentStatus> = {
  published: 'Published',
  paused: 'Paused',
  draft: 'Draft',
  // AgentSummary has no Archived state; archived agents read as inactive.
  archived: 'Paused',
};

export const displayToDbStatus: Record<AgentStatus, DbAgentStatus> = {
  Published: 'published',
  Paused: 'paused',
  Draft: 'draft',
};

function mapModel(dbModel: string): AgentModel {
  const m = dbModel.toLowerCase();
  if (m.includes('pro') || m.includes('deep') || m.includes('opus')) return 'Model C Pro';
  if (m.includes('lite') || m.includes('flash') || m.includes('fast')) return 'Model A Fast';
  return 'Model B Balanced';
}

function relativeEdited(updatedAt: string): { edited: string; editedAgo: number } {
  const mins = Math.max(0, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000));
  if (mins < 1) return { edited: 'Just now', editedAgo: 0 };
  if (mins < 60) return { edited: `${mins} min ago`, editedAgo: mins };
  const hours = Math.round(mins / 60);
  if (hours < 24) return { edited: `${hours} h ago`, editedAgo: mins };
  const days = Math.round(hours / 24);
  return { edited: `${days} d ago`, editedAgo: mins };
}

export function mapAgentRowToSummary(row: AgentRow, owner: Person): AgentSummary {
  const { edited, editedAgo } = relativeEdited(row.updated_at);
  return {
    id: row.id,
    name: row.name,
    icon: (row.icon as IconName) || 'chat',
    tone: (row.tone as Exclude<AgentTone, 'danger'>) || 'ai',
    description: row.description ?? '',
    status: dbToDisplayStatus[row.status],
    model: mapModel(row.model),
    tags: row.tags ?? [],
    runs: null,
    success: null,
    trend: [],
    owner,
    edited,
    editedAgo,
    users: [],
  };
}

/** Person shape for the current user, from their profile doc (or auth display name). */
async function currentOwner(): Promise<Person> {
  let name = 'You';
  let email = '';
  let avatar: string | undefined;
  const u = auth?.currentUser;
  if (u && db) {
    email = u.email ?? '';
    name = u.displayName ?? email.split('@')[0] ?? 'You';
    if (u.photoURL) avatar = u.photoURL;
    const profileSnap = await getDoc(doc(db, 'profiles', u.uid));
    if (profileSnap.exists()) {
      const profile = profileSnap.data() as { full_name?: string | null; avatar_url?: string | null };
      if (profile.full_name) name = profile.full_name;
      if (profile.avatar_url) avatar = profile.avatar_url;
    }
  }
  return { id: 'me', name, email, role: 'owner', title: '', avatar };
}

function rowFromSnap(snap: { id: string; data: () => unknown }): AgentRow {
  return { id: snap.id, ...(snap.data() as Omit<AgentRow, 'id'>) };
}

/* ------------------------------------------------------------------ */
/* CRUD                                                                */
/* ------------------------------------------------------------------ */

export async function listAgents(workspaceId: string): Promise<AgentSummary[] | null> {
  if (!isFirebaseConfigured || !db) return null;
  const owner = await currentOwner();
  const snap = await getDocs(
    query(
      collection(db, 'agents'),
      where('workspace_id', '==', workspaceId),
      orderBy('updated_at', 'desc'),
    ),
  );
  return snap.docs.map((d) => mapAgentRowToSummary(rowFromSnap(d), owner));
}

export async function getAgent(workspaceId: string, id: string): Promise<AgentRow | null> {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, 'agents', id));
  if (!snap.exists()) return null;
  const row = rowFromSnap(snap);
  if (row.workspace_id !== workspaceId) return null;
  return row;
}

export async function getAgentSummary(workspaceId: string, id: string): Promise<AgentSummary | null> {
  const row = await getAgent(workspaceId, id);
  if (!row) return null;
  return mapAgentRowToSummary(row, await currentOwner());
}

export async function createAgent(
  workspaceId: string,
  input: CreateAgentInput,
): Promise<AgentRow | null> {
  if (!isFirebaseConfigured || !db) return null;
  const userId = auth?.currentUser?.uid;
  if (!userId) return null;
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, 'agents'), {
    workspace_id: workspaceId,
    created_by: userId,
    name: input.name,
    description: input.description,
    instructions: input.instructions,
    model: input.model,
    temperature: input.temperature,
    status: 'draft',
    tags: input.tags,
    icon: input.icon,
    tone: input.tone,
    created_at: now,
    updated_at: now,
  });
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return rowFromSnap(snap);
}

export async function updateAgent(id: string, patch: UpdateAgentPatch): Promise<AgentRow | null> {
  if (!isFirebaseConfigured || !db) return null;
  // Firestore rejects `undefined` field values — drop them before the write.
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) clean[key] = value;
  }
  clean['updated_at'] = new Date().toISOString();
  await updateDoc(doc(db, 'agents', id), clean);
  const snap = await getDoc(doc(db, 'agents', id));
  if (!snap.exists()) return null;
  return rowFromSnap(snap);
}

export async function setAgentStatus(id: string, status: DbAgentStatus): Promise<AgentRow | null> {
  return updateAgent(id, { status });
}

/**
 * Publish an agent: mark the agent published and insert a new live version doc
 * (version number = existing version count + 1). Previous live versions are retired.
 */
export async function publishAgent(workspaceId: string, agentId: string, note: string) {
  if (!isFirebaseConfigured || !db) return null;
  const agent = await getAgent(workspaceId, agentId);
  if (!agent) return null;

  const versionsSnap = await getDocs(
    query(collection(db, 'agent_versions'), where('agent_id', '==', agentId)),
  );
  const version = `v${versionsSnap.size + 1}`;

  const liveSnap = await getDocs(
    query(
      collection(db, 'agent_versions'),
      where('agent_id', '==', agentId),
      where('is_live', '==', true),
    ),
  );
  for (const liveDoc of liveSnap.docs) {
    await updateDoc(liveDoc.ref, { is_live: false });
  }

  const now = new Date().toISOString();
  const versionRow: AgentVersionRow = {
    agent_id: agentId,
    workspace_id: workspaceId,
    version,
    note,
    instructions: agent.instructions,
    model: agent.model,
    temperature: agent.temperature,
    is_live: true,
  };
  await addDoc(collection(db, 'agent_versions'), {
    ...versionRow,
    created_by: auth?.currentUser?.uid ?? agent.created_by,
    created_at: now,
  });

  await updateDoc(doc(db, 'agents', agentId), {
    status: 'published',
    updated_at: now,
  });
  return versionRow;
}
