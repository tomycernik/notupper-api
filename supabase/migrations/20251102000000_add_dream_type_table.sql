-- Create dream_type table
create table if not exists public.dream_type (
  id uuid primary key default gen_random_uuid(),
  dream_type_name text
);

-- Insert default dream types
insert into public.dream_type (dream_type_name) values
  ('Lucido'),
  ('Pesadilla'),
  ('Recurrente'),
  ('Estandar')
on conflict do nothing;

-- Add dream_type_id column to dream_node if it doesn't exist
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'dream_node' 
    and column_name = 'dream_type_id'
  ) then
    alter table public.dream_node 
    add column dream_type_id uuid references public.dream_type(id);
  end if;
end $$;

-- Set default dream_type_id to 'Estandar' for existing records
update public.dream_node 
set dream_type_id = (select id from public.dream_type where dream_type_name = 'Estandar')
where dream_type_id is null;

-- RLS policies for dream_type
alter table public.dream_type enable row level security;

-- Everyone can read dream types
drop policy if exists "Dream types are viewable by everyone" on public.dream_type;
create policy "Dream types are viewable by everyone"
  on public.dream_type for select
  using (true);

-- Add index for better performance
create index if not exists idx_dream_node_dream_type_id 
  on public.dream_node(dream_type_id);
