create table if not exists public.google_drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  access_token_encrypted text,
  refresh_token_encrypted text not null,
  token_expires_at timestamptz,
  connected_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.google_drive_connections enable row level security;

create policy "Users can read their own Google Drive connection"
  on public.google_drive_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own Google Drive connection"
  on public.google_drive_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own Google Drive connection"
  on public.google_drive_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own Google Drive connection"
  on public.google_drive_connections for delete
  using (auth.uid() = user_id);
