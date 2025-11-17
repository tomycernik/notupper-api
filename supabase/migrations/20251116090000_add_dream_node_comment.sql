-- Tabla de comentarios para dream_node
create table if not exists public.dream_node_comment (
    id uuid primary key default gen_random_uuid(),
    dream_node_id uuid not null references public.dream_node(id) on delete cascade,
    profile_id uuid not null references public.profile(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default now()
);

-- Índice para consultas rápidas de comentarios por publicación
grant select, insert, delete, update on public.dream_node_comment to authenticated;
create index if not exists idx_dream_node_comment_dream_node_id on public.dream_node_comment(dream_node_id);
create index if not exists idx_dream_node_comment_profile_id on public.dream_node_comment(profile_id);