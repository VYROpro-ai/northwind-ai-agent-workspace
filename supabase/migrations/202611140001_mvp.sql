-- ============================================================================
-- Northwind AI Agent Workspace — MVP migration (Phase 0–2)
-- File: supabase/migrations/202611140001_mvp.sql
-- ----------------------------------------------------------------------------
-- WHAT THIS CREATES
--   Identity:   profiles, workspaces, workspace_members
--   Agents:     agents, agent_versions
--   Chat:       chats, messages
--   Metering:   usage_events  (every model call: tokens, cost, latency)
--
-- Row Level Security (RLS) is enabled on EVERY table. The single tenant rule
-- is: a user can only touch rows in a workspace they are a member of
-- (workspace_members). Membership checks go through the SECURITY DEFINER
-- helpers is_workspace_member() / is_workspace_owner() so policies never
-- query workspace_members from inside its own policy (that would recurse
-- infinitely under RLS — see the helper comments below).
--
-- WHAT THE PARENT / OPERATOR STILL HAS TO DO (not done by this file):
--   1. Create the Supabase project 'northwind' (a browser task is doing
--      this now) and note its URL + anon key.
--   2. Run this migration against that project
--      (Supabase Dashboard > SQL Editor, or `supabase db push`).
--   3. Set the GEMINI_API_KEY secret on the project:
--      `supabase secrets set GEMINI_API_KEY=<key>` (never commit the key).
--   4. Deploy the Edge Function: `supabase functions deploy chat`.
--   5. Put the project's URL + anon key in the frontend .env as
--      VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (see .env.example).
-- No secrets are stored anywhere in this repo.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Bump updated_at on row update. Attached to profiles, workspaces, agents,
-- chats below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Membership check that bypasses RLS (SECURITY DEFINER). Policies on
-- workspace_members itself must NOT run `select ... from workspace_members`
-- directly: that inner query would itself be RLS-filtered and recurse.
-- All other tables' policies call this helper instead, which is safe.
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- Same idea for the owner check (role = 'owner' in that workspace).
create or replace function public.is_workspace_owner(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

-- profiles: one row per Supabase Auth user. Created on sign-up (frontend or
-- an auth trigger in a later phase); id is the auth.users id.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'User profile, one row per auth.users id.';

-- workspaces: a tenant. Every business row below carries a workspace_id.
create table public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.workspaces is 'Tenant root. All business tables reference this via workspace_id.';

-- workspace_members: who belongs to which workspace, and with which of the
-- six template roles (owner, admin, builder, reviewer, member, viewer).
create table public.workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member'
               check (role in ('owner', 'admin', 'builder', 'reviewer', 'member', 'viewer')),
  created_at   timestamptz not null default now(),
  unique (workspace_id, user_id)
);
comment on table public.workspace_members is 'Workspace membership + role. The RLS anchor for every other table.';

-- ---------------------------------------------------------------------------
-- Agents
-- ---------------------------------------------------------------------------

-- agents: an AI agent built in the 5-step wizard. status moves
-- draft -> published (a version is snapshotted) -> paused / archived.
-- model/temperature/instructions are the live (editable draft) config;
-- agent_versions holds the published snapshots.
create table public.agents (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by   uuid references auth.users(id),
  name         text not null,
  description  text not null default '',
  instructions text not null default '',
  model        text not null default 'gemini-2.5-flash',
  temperature  numeric not null default 0.7,
  status       text not null default 'draft'
               check (status in ('draft', 'published', 'paused', 'archived')),
  tags         text[] not null default '{}',
  icon         text not null default 'chat',
  tone         text not null default 'ai',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.agents is 'AI agents. Live draft config; published snapshots live in agent_versions.';

-- agent_versions: immutable snapshot of an agent's config at publish time.
-- is_live marks the version currently serving chat; only one should be live
-- per agent (enforced by the app, not by a DB constraint, in this MVP).
create table public.agent_versions (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references public.agents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version      text not null,
  note         text not null default '',
  instructions text not null default '',
  model        text not null default 'gemini-2.5-flash',
  temperature  numeric not null default 0.7,
  is_live      boolean not null default false,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);
comment on table public.agent_versions is 'Published snapshots of an agent config. is_live = version serving chat.';

-- ---------------------------------------------------------------------------
-- Chat
-- ---------------------------------------------------------------------------

-- chats: a conversation thread with one agent inside a workspace.
create table public.chats (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id     uuid references public.agents(id) on delete set null,
  user_id      uuid references auth.users(id),
  title        text not null default 'New chat',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.chats is 'Chat threads. agent_id null = ad-hoc / wizard test chat.';

-- messages: one row per turn in a chat. tokens/cost are filled in by the
-- chat Edge Function after the model replies (0 when the provider reports
-- no usage).
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  chat_id      uuid not null references public.chats(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null default '',
  tokens_in    integer not null default 0,
  tokens_out   integer not null default 0,
  cost_usd     numeric not null default 0,
  created_at   timestamptz not null default now()
);
comment on table public.messages is 'Chat turns. Assistant rows carry the token/cost of that reply.';

-- ---------------------------------------------------------------------------
-- Metering
-- ---------------------------------------------------------------------------

-- usage_events: one row per model call (chat replies in this MVP; runs and
-- evals in later phases). Analytics and Billing both aggregate from here,
-- so rows are append-only by convention — never edited or deleted by the app.
create table public.usage_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid references auth.users(id),
  agent_id     uuid references public.agents(id) on delete set null,
  chat_id      uuid references public.chats(id) on delete set null,
  model        text not null,
  tokens_in    integer not null default 0,
  tokens_out   integer not null default 0,
  cost_usd     numeric not null default 0,
  latency_ms   integer,
  created_at   timestamptz not null default now()
);
comment on table public.usage_events is 'Append-only metering: one row per model call (tokens, cost, latency). Source for Analytics + Billing.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger trg_agents_set_updated_at
  before update on public.agents
  for each row execute function public.set_updated_at();

create trigger trg_chats_set_updated_at
  before update on public.chats
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_workspace_members_workspace_id on public.workspace_members (workspace_id);
create index idx_workspace_members_user_id      on public.workspace_members (user_id);

create index idx_agents_workspace_id   on public.agents (workspace_id);
create index idx_agents_created_at     on public.agents (created_at desc);

create index idx_agent_versions_workspace_id on public.agent_versions (workspace_id);
create index idx_agent_versions_agent_id     on public.agent_versions (agent_id);
create index idx_agent_versions_created_at   on public.agent_versions (created_at desc);

create index idx_chats_workspace_id          on public.chats (workspace_id);
create index idx_chats_workspace_id_agent_id on public.chats (workspace_id, agent_id);
create index idx_chats_created_at            on public.chats (created_at desc);

create index idx_messages_workspace_id    on public.messages (workspace_id);
create index idx_messages_chat_id_created on public.messages (chat_id, created_at);

create index idx_usage_events_workspace_id on public.usage_events (workspace_id);
create index idx_usage_events_created_at   on public.usage_events (created_at desc);
create index idx_usage_events_agent_id     on public.usage_events (agent_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.agents            enable row level security;
alter table public.agent_versions    enable row level security;
alter table public.chats             enable row level security;
alter table public.messages          enable row level security;
alter table public.usage_events      enable row level security;

-- profiles: a user can only see / create / edit their own row.
create policy "profiles: own row only"
  on public.profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- workspaces: readable by any member; creatable by the signed-in user who
-- will be recorded as created_by (the app then inserts them as owner in
-- workspace_members). No UPDATE/DELETE policy in this MVP — renaming or
-- deleting a workspace is a later phase (owner-only) addition.
create policy "workspaces: members can read"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "workspaces: creator can insert"
  on public.workspaces for insert
  with check (created_by = auth.uid());

-- workspace_members: a user always sees their own memberships, plus the
-- memberships of any workspace they belong to (needed to list team members).
-- Anyone may insert their own membership row (used when creating a workspace
-- — the creator adds themselves as owner; inviting others is a later phase
-- and will go through a server-side invite flow). Owners manage rows;
-- any user may delete (leave) their own membership.
create policy "workspace_members: members can read"
  on public.workspace_members for select
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "workspace_members: own row can be inserted"
  on public.workspace_members for insert
  with check (user_id = auth.uid());

create policy "workspace_members: owners can update"
  on public.workspace_members for update
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

create policy "workspace_members: owners or self can delete"
  on public.workspace_members for delete
  using (user_id = auth.uid() or public.is_workspace_owner(workspace_id));

-- Business tables: full access for members of the owning workspace, nothing
-- for anyone else. One FOR ALL policy per table keeps the rule identical
-- everywhere (the plan's single RLS pattern).
create policy "agents: workspace members only"
  on public.agents for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "agent_versions: workspace members only"
  on public.agent_versions for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "chats: workspace members only"
  on public.chats for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "messages: workspace members only"
  on public.messages for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "usage_events: workspace members only"
  on public.usage_events for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- ---------------------------------------------------------------------------
-- Grants (Supabase default privileges normally cover these; explicit grants
-- keep the migration self-contained for any project).
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert               on public.workspaces        to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.agents            to authenticated;
grant select, insert, update, delete on public.agent_versions    to authenticated;
grant select, insert, update, delete on public.chats             to authenticated;
grant select, insert, update, delete on public.messages          to authenticated;
grant select, insert, update, delete on public.usage_events      to authenticated;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid)  to authenticated;
