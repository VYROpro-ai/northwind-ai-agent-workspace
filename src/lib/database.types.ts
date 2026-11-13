/** Minimal hand-written row types for the Supabase tables (Phase 0-2 contract). */

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  created_by: string;
}

export interface WorkspaceMemberRow {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'builder' | 'reviewer' | 'member' | 'viewer';
}

export interface AgentRow {
  id: string;
  workspace_id: string;
  created_by: string;
  name: string;
  description: string | null;
  instructions: string | null;
  model: string;
  temperature: number;
  status: 'draft' | 'published' | 'paused' | 'archived';
  tags: string[] | null;
  icon: string;
  tone: string;
  created_at: string;
  updated_at: string;
}

export interface AgentVersionRow {
  agent_id: string;
  workspace_id: string;
  version: string;
  note: string | null;
  instructions: string | null;
  model: string;
  temperature: number;
  is_live: boolean;
}

export interface ChatRow {
  id: string;
  workspace_id: string;
  agent_id: string | null;
  user_id: string;
  title: string | null;
}

export interface MessageRow {
  chat_id: string;
  workspace_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: number | null;
}

export interface UsageEventRow {
  workspace_id: string;
  user_id: string;
  agent_id: string | null;
  chat_id: string | null;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number | null;
}
