
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.shifts enable row level security;
alter table public.rides enable row level security;
alter table public.odometers enable row level security;
alter table public.invoices enable row level security;
alter table public.driver_locations enable row level security;
alter table public.ops_admins enable row level security;

-- profiles
create policy if not exists "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profiles upsert own" on public.profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles update own" on public.profiles for update using (auth.uid() = id);

-- vehicles (owner only)
create policy if not exists "vehicles owner rw" on public.vehicles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- shifts (driver only)
create policy if not exists "shifts driver rw" on public.shifts for all using (driver_id = auth.uid()) with check (driver_id = auth.uid());

-- rides (rider + assigned driver)
create policy if not exists "rides rider read" on public.rides for select using (rider_id = auth.uid());
create policy if not exists "rides driver read" on public.rides for select using (driver_id = auth.uid());
create policy if not exists "rides rider insert" on public.rides for insert with check (rider_id = auth.uid());
create policy if not exists "rides driver update assigned" on public.rides for update using (driver_id = auth.uid());
create policy if not exists "rides rider update own" on public.rides for update using (rider_id = auth.uid());

-- odometers (ride parties)
create policy if not exists "odom parties rw" on public.odometers for all using (
  exists(select 1 from public.rides r where r.id = odometers.ride_id and (r.rider_id = auth.uid() or r.driver_id = auth.uid()))
) with check (
  exists(select 1 from public.rides r where r.id = odometers.ride_id and (r.rider_id = auth.uid() or r.driver_id = auth.uid()))
);

-- invoices (read for ride parties)
create policy if not exists "invoices parties read" on public.invoices for select using (
  exists(select 1 from public.rides r where r.id = invoices.ride_id and (r.rider_id = auth.uid() or r.driver_id = auth.uid()))
);

-- driver_locations (driver write self; anyone logged-in read for matching)
create policy if not exists "driver_locations upsert self" on public.driver_locations for insert with check (driver_id = auth.uid());
create policy if not exists "driver_locations update self" on public.driver_locations for update using (driver_id = auth.uid());
create policy if not exists "driver_locations anyone select" on public.driver_locations for select using (true);

-- ops_admins (ops RBAC)
create policy if not exists "ops self read" on public.ops_admins for select using (auth.uid() = user_id);
create policy if not exists "ops admin manage" on public.ops_admins for all using (
  exists(select 1 from public.ops_admins a where a.user_id = auth.uid() and a.role = 'admin')
);

-- dashboard-wide read/update for ops roles
create policy if not exists "ops can select rides" on public.rides for select using (
  exists(select 1 from public.ops_admins a where a.user_id = auth.uid())
);
create policy if not exists "ops can update rides" on public.rides for update using (
  exists(select 1 from public.ops_admins a where a.user_id = auth.uid() and a.role in ('admin','dispatcher'))
);
