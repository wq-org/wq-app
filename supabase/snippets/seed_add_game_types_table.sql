-- Add a column to games to store the key of the game type.
-- This is optional but useful if you want to reference the type
-- by a readable string instead of only by UUID.
alter table public.games
  add column if not exists game_type_key text;


-- Table that acts as a registry for all game types in the system.
-- This replaces the old ENUM approach.
create table if not exists public.game_types (
  -- Unique identifier of the game type
  id uuid primary key default gen_random_uuid(),

  -- Unique machine-readable key used by frontend/runtime
  -- Examples: 'image_marker', 'flow', 'line_picker', 'wq.super_match'
  key text not null unique,

  -- Human readable name shown in UI
  display_name text not null,

  -- Optional explanation of what the game type does
  description text,

  -- Version of the configuration schema for this game type.
  -- Allows breaking changes later.
  schema_version int not null default 1,

  -- JSON schema describing the expected config structure
  -- for game_config when this game type is used.
  config_schema jsonb not null default '{}'::jsonb,

  -- User who created the game type.
  -- Null if it is a system game type.
  created_by uuid references public.profiles(user_id) on delete set null,

  -- Whether other teachers can use this game type
  -- true = visible to everyone
  -- false = private/custom
  is_public boolean not null default false,

  -- Audit timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Add foreign key reference from games to game_types
-- This replaces the old ENUM column.
alter table public.games
  add column if not exists game_type_id uuid
  references public.game_types(id);


-- Optional migration strategy
-- If you previously used ENUM game_type,
-- you would migrate values here and then drop the enum column later.