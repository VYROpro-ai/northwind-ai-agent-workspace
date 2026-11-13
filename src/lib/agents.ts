import type { IconName } from '@/components/icons';
import type { AgentTone } from '@/components/ui';
import type { Person } from '@/data/people';
import type { AgentModel, AgentStatus, AgentSummary } from '@/pages/agents/data';
import { isSupabaseConfigured, supabase } from './supabase';
import type { AgentRow } from './database.types';

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

/** Person shape for the current user, from their profile row (or auth metadata). */
async function currentOwner(): Promise<Person> {
  let name = 'You';
  let email = '';
  let avatar: string | undefined;
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (u) {
      email = u.email ?? '';
      name =
        (u.user_metadata?.full_name as string | undefined) ??
        (u.user_metadata?.name as string | undefined) ??
        email.split('@')[0] ??
        'You';
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', u.id)
        .maybeSingle();
      if (profile?.full_name) name = profile.full_name;
      if (profile?.avatar_url) avatar = profile.avatar_url;
    }
  }
  return { id: 'me', name, email, role: 'owner', title: '', avatar };
}

/* ------------------------------------------------------------------ */
/* CRUD                                                                */
/* ------------------------------------------------------------------ */

export async function listAgents(workspaceId: string): Promise<AgentSummary[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const owner = await currentOwner();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });
  if (error || !data) return null;
  return (data as AgentRow[]).map((row) => mapAgentRowToSummary(row, owner));
}

export async function getAgent(workspaceId: string, id: string): Promise<AgentRow | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AgentRow;
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
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from('agents')
    .insert({
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
    })
    .select('*')
    .single();
  if (error || !data) return null;
  return data as AgentRow;
}

export async function updateAgent(id: string, patch: UpdateAgentPatch): Promise<AgentRow | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('agents').update(patch).eq('id', id).select('*').single();
  if (error || !data) return null;
  return data as AgentRow;
}

export async function setAgentStatus(id: string, status: DbAgentStatus): Promise<AgentRow | null> {
  return updateAgent(id, { status });
}

/**
 * Publish an agent: mark the agent published and insert a new live version row
 * (version number = existing version count + 1). Previous live versions are retired.
 */
export async function publishAgent(workspaceId: string, agentId: string, note: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const agent = await getAgent(workspaceId, agentId);
  if (!agent) return null;

  const { count } = await supabase
    .from('agent_versions')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId);
  const version = `v${(count ?? 0) + 1}`;

  await supabase.from('agent_versions').update({ is_live: false }).eq('agent_id', agentId).eq('is_live', true);

  const { data, error } = await supabase
    .from('agent_versions')
    .insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      version,
      note,
      instructions: agent.instructions,
      model: agent.model,
      temperature: agent.temperature,
      is_live: true,
    })
    .select('*')
    .single();
  if (error || !data) return null;

  await supabase.from('agents').update({ status: 'published' }).eq('id', agentId);
  return data;
}
