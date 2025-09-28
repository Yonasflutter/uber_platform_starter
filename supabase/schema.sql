
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('rider','driver')) not null,
  full_name text,
  kvk text,
  btw text,
  created_at timestamptz default now()
);

-- vehicles
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  plate text not null,
  make text,
  model text,
  permit_ref text,
  created_at timestamptz default now()
);

-- shifts
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  pause_min int default 0,
  created_at timestamptz default now()
);

-- enums
do $$ begin
  create type ride_status as enum ('requested','offered','accepted','started','completed','cancelled');
exception when duplicate_object then null; end $$;

-- rides
create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references auth.users(id) on delete cascade,
  driver_id uuid references auth.users(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  status ride_status not null default 'requested',
  requested_at timestamptz default now(),
  accepted_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  pickup_geo geography(Point,4326),
  dropoff_geo geography(Point,4326),
  distance_km numeric,
  duration_min numeric,
  price_excl numeric,
  vat_rate numeric default 0.09,
  price_incl numeric generated always as (price_excl * (1 + vat_rate)) stored,
  pay_method text check (pay_method in ('cash','invoice','stripe')) default 'invoice',
  eta_planned_sec int,
  eta_current_sec int,
  eta_updated_at timestamptz
);

-- odometers
create table if not exists public.odometers (
  ride_id uuid primary key references public.rides(id) on delete cascade,
  km_start numeric,
  km_end numeric,
  proof_url text
);

-- invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete set null,
  debtor_type text check (debtor_type in ('zzp','bv','consumer')),
  amount_excl numeric not null,
  vat numeric not null,
  amount_incl numeric not null,
  number text unique not null,
  pdf_url text,
  issued_at timestamptz default now()
);

-- driver locations
create table if not exists public.driver_locations (
  driver_id uuid primary key references auth.users(id) on delete cascade,
  last_seen timestamptz default now(),
  geom geography(Point,4326) not null,
  speed numeric,
  heading numeric,
  online boolean default false
);

-- ops roles for dashboard
create table if not exists public.ops_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','dispatcher','auditor')),
  org text not null default 'default',
  created_at timestamptz default now()
);

-- indexes
create index if not exists idx_rides_pickup on public.rides using gist (pickup_geo);
create index if not exists idx_rides_dropoff on public.rides using gist (dropoff_geo);
create index if not exists idx_driver_locations on public.driver_locations using gist (geom);
