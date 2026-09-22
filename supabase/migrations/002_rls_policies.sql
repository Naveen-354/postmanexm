-- Enable Row Level Security
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.collections enable row level security;
alter table public.folders enable row level security;
alter table public.requests enable row level security;
alter table public.environments enable row level security;
alter table public.environment_variables enable row level security;
alter table public.request_history enable row level security;
alter table public.saved_responses enable row level security;

-- Function to check if user has workspace access
create or replace function public.has_workspace_access(workspace_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_uuid
    and user_id = auth.uid()
  ) or exists (
    select 1 from public.workspaces
    where id = workspace_uuid
    and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Workspaces Policies
create policy "Users can view workspaces they own or are members of"
on public.workspaces for select
using (owner_id = auth.uid() or id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "Users can insert workspaces"
on public.workspaces for insert
with check (owner_id = auth.uid());

create policy "Users can update workspaces they own"
on public.workspaces for update
using (owner_id = auth.uid());

create policy "Users can delete workspaces they own"
on public.workspaces for delete
using (owner_id = auth.uid());

-- Workspace Members Policies
create policy "Users can view members of their workspaces"
on public.workspace_members for select
using (public.has_workspace_access(workspace_id));

create policy "Owners can manage members"
on public.workspace_members for all
using (
  exists (
    select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid()
  )
);

-- Collections Policies
create policy "Users can view collections in their workspaces"
on public.collections for select
using (public.has_workspace_access(workspace_id));

create policy "Users can manage collections in their workspaces"
on public.collections for all
using (public.has_workspace_access(workspace_id));

-- Folders Policies
create policy "Users can view folders in their workspaces"
on public.folders for select
using (
  exists (
    select 1 from public.collections
    where id = public.folders.collection_id
    and public.has_workspace_access(workspace_id)
  )
);

create policy "Users can manage folders in their workspaces"
on public.folders for all
using (
  exists (
    select 1 from public.collections
    where id = public.folders.collection_id
    and public.has_workspace_access(workspace_id)
  )
);

-- Requests Policies
create policy "Users can view requests in their workspaces"
on public.requests for select
using (
  exists (
    select 1 from public.collections
    where id = public.requests.collection_id
    and public.has_workspace_access(workspace_id)
  )
);

create policy "Users can manage requests in their workspaces"
on public.requests for all
using (
  exists (
    select 1 from public.collections
    where id = public.requests.collection_id
    and public.has_workspace_access(workspace_id)
  )
);

-- Environments Policies
create policy "Users can view environments in their workspaces"
on public.environments for select
using (public.has_workspace_access(workspace_id));

create policy "Users can manage environments in their workspaces"
on public.environments for all
using (public.has_workspace_access(workspace_id));

-- Environment Variables Policies
create policy "Users can view variables in their workspaces"
on public.environment_variables for select
using (
  exists (
    select 1 from public.environments
    where id = public.environment_variables.environment_id
    and public.has_workspace_access(workspace_id)
  )
);

create policy "Users can manage variables in their workspaces"
on public.environment_variables for all
using (
  exists (
    select 1 from public.environments
    where id = public.environment_variables.environment_id
    and public.has_workspace_access(workspace_id)
  )
);

-- Request History Policies
create policy "Users can view their own request history"
on public.request_history for select
using (user_id = auth.uid() and public.has_workspace_access(workspace_id));

create policy "Users can insert their own request history"
on public.request_history for insert
with check (user_id = auth.uid() and public.has_workspace_access(workspace_id));

create policy "Users can delete their own request history"
on public.request_history for delete
using (user_id = auth.uid() and public.has_workspace_access(workspace_id));

-- Saved Responses Policies
create policy "Users can view their own saved responses"
on public.saved_responses for select
using (user_id = auth.uid() and public.has_workspace_access(workspace_id));

create policy "Users can insert their own saved responses"
on public.saved_responses for insert
with check (user_id = auth.uid() and public.has_workspace_access(workspace_id));

create policy "Users can delete their own saved responses"
on public.saved_responses for delete
using (user_id = auth.uid() and public.has_workspace_access(workspace_id));

-- Trigger to automatically add owner to workspace_members upon workspace creation
create or replace function public.add_owner_to_workspace_members()
returns trigger as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger workspaces_add_owner after insert on public.workspaces for each row execute procedure public.add_owner_to_workspace_members();
