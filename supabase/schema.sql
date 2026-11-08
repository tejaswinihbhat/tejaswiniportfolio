-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  year text default '',
  description text default '',
  file_url text default '',
  storage_path text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- Public visitors can read certificate metadata.
create policy "Public can read certificates"
on public.certificates for select
to anon, authenticated
using (true);

-- Only signed-in users can add, edit or delete certificate metadata.
create policy "Authenticated users can insert certificates"
on public.certificates for insert
to authenticated
with check (true);

create policy "Authenticated users can update certificates"
on public.certificates for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete certificates"
on public.certificates for delete
to authenticated
using (true);

-- Create a PUBLIC bucket named certificates in Storage.
-- Public read is required for visitor previews; writes/deletes are restricted to authenticated users.
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do update set public = true;

create policy "Public can view certificate files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'certificates');

create policy "Authenticated users can upload certificate files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'certificates');

create policy "Authenticated users can update certificate files"
on storage.objects for update
to authenticated
using (bucket_id = 'certificates')
with check (bucket_id = 'certificates');

create policy "Authenticated users can delete certificate files"
on storage.objects for delete
to authenticated
using (bucket_id = 'certificates');
