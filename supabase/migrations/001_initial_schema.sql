-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workspaces
create table public.workspaces (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    owner_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspace Members
create table public.workspace_members (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(workspace_id, user_id)
);

-- Collections
create table public.collections (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Folders
create table public.folders (
    id uuid primary key default uuid_generate_v4(),
    collection_id uuid not null references public.collections(id) on delete cascade,
    parent_id uuid references public.folders(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Requests
create table public.requests (
    id uuid primary key default uuid_generate_v4(),
    collection_id uuid not null references public.collections(id) on delete cascade,
    folder_id uuid references public.folders(id) on delete cascade,
    name text not null,
    method text not null,
    url text not null,
    headers jsonb default '[]'::jsonb,
    query_params jsonb default '[]'::jsonb,
    body text,
    body_type text default 'none',
    authorization jsonb default '{}'::jsonb,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Environments
create table public.environments (
    id uuid primary key default uuid_generate_v4(),
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Environment Variables
create table public.environment_variables (
    id uuid primary key default uuid_generate_v4(),
    environment_id uuid not null references public.environments(id) on delete cascade,
    key text not null,
    value text not null,
    is_secret boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(environment_id, key)
);

-- Request History
create table public.request_history (
    id uuid primary key default uuid_generate_v4(),
    request_id uuid references public.requests(id) on delete set null,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    method text not null,
    url text not null,
    status_code integer,
    request_headers jsonb,
    request_body text,
    response_headers jsonb,
    response_body text,
    response_time integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Responses
create table public.saved_responses (
    id uuid primary key default uuid_generate_v4(),
    request_id uuid references public.requests(id) on delete set null,
    workspace_id uuid not null references public.workspaces(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    status_code integer,
    response_headers jsonb,
    response_body text,
    response_size integer,
    response_time integer,
    content_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger workspaces_updated_at before update on public.workspaces for each row execute procedure public.handle_updated_at();
create trigger collections_updated_at before update on public.collections for each row execute procedure public.handle_updated_at();
create trigger folders_updated_at before update on public.folders for each row execute procedure public.handle_updated_at();
create trigger requests_updated_at before update on public.requests for each row execute procedure public.handle_updated_at();
create trigger environments_updated_at before update on public.environments for each row execute procedure public.handle_updated_at();
create trigger environment_variables_updated_at before update on public.environment_variables for each row execute procedure public.handle_updated_at();

-- Indexes
create index ix_workspaces_owner on public.workspaces(owner_id);
create index ix_collections_workspace on public.collections(workspace_id);
create index ix_folders_collection on public.folders(collection_id);
create index ix_requests_collection on public.requests(collection_id);
create index ix_requests_folder on public.requests(folder_id);
create index ix_environments_workspace on public.environments(workspace_id);
create index ix_environment_vars_env on public.environment_variables(environment_id);
create index ix_request_history_workspace on public.request_history(workspace_id);
create index ix_request_history_user on public.request_history(user_id);
create index ix_saved_responses_workspace on public.saved_responses(workspace_id);
create index ix_saved_responses_user on public.saved_responses(user_id);
