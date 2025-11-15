-- Agrega columna para destacar insignias en el perfil del usuario
alter table public.user_badge
  add column if not exists featured_order smallint;

-- Tabla para registrar likes de usuarios a publicaciones (dream_node)
create table if not exists public.dream_node_like (
    id uuid primary key default gen_random_uuid(),
    dream_node_id uuid not null references public.dream_node(id) on delete cascade,
    profile_id uuid not null references public.profile(id) on delete cascade,
    created_at timestamp default now(),
    unique (dream_node_id, profile_id)
);

-- Índice para consultas rápidas de likes por publicación
create index if not exists idx_dream_node_like_dream_node_id on public.dream_node_like(dream_node_id);
