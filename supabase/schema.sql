-- 🍱 NotTupper - Schema PostgreSQL

-- 👤 users
create table users (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text not null,
  email text unique,
  celular text not null,
  zona text not null,
  password text not null,
  rol text not null default 'USER',
  created_at timestamp default now()
);

-- 🍽️ comidas
create table comidas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  tipo text not null,
  activa boolean default true,
  created_at timestamp default now()
);

-- 🍱 viandas
create table viandas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null,
  tamano text not null,
  activo boolean default false,
  observaciones text,
  created_at timestamp default now()
);

-- 🔗 vianda_comidas (N:N)
create table vianda_comidas (
  id uuid primary key default gen_random_uuid(),
  vianda_id uuid not null references viandas(id) on delete cascade,
  comida_id uuid not null references comidas(id) on delete cascade,
  orden int
);

-- 🧾 pedidos
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references users(id) on delete cascade,
  vianda_id uuid not null references viandas(id),
  estado text not null default 'PENDIENTE',
  observaciones text,
  created_at timestamp default now()
);

-- 🔒 Constraints
alter table users add constraint chk_rol check (rol in ('USER','ADMIN'));
alter table comidas add constraint chk_comida_tipo check (tipo in ('COMUN','VEGETARIANA','AMBAS'));
alter table viandas add constraint chk_vianda_tipo check (tipo in ('COMUN','VEGETARIANA'));
alter table viandas add constraint chk_tamano check (tamano in ('CHICA','GRANDE'));
alter table pedidos add constraint chk_estado check (estado in ('PENDIENTE','EN_PROCESO','ENTREGADO','CANCELADO'));

-- ⚡ Índices
create index idx_viandas_activo on viandas(activo);
create index idx_comidas_activa on comidas(activa);
create index idx_pedidos_estado on pedidos(estado);
create index idx_pedidos_usuario on pedidos(usuario_id);
create index idx_vc_vianda on vianda_comidas(vianda_id);
create index idx_vc_comida on vianda_comidas(comida_id);
