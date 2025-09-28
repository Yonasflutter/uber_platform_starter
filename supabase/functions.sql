
create or replace function public.find_nearest_driver(lon double precision, lat double precision)
returns table(driver_id uuid, meters double precision) as $$
  select d.driver_id,
         ST_DistanceSphere(d.geom::geometry, ST_SetSRID(ST_MakePoint(lon, lat), 4326)) as meters
    from public.driver_locations d
   where d.online = true and d.last_seen > now() - interval '1 minute'
order by meters asc
limit 1;
$$ language sql stable;

create table if not exists public.audit_logs(
  id uuid primary key default gen_random_uuid(),
  entity text,
  entity_id uuid,
  action text,
  payload jsonb,
  created_at timestamptz default now()
);

create or replace function public.ops_correct_ride(
  p_ride uuid,
  p_distance_km numeric,
  p_duration_min numeric,
  p_price_excl numeric,
  p_vat_rate numeric
) returns void as $$
begin
  update public.rides
     set distance_km = p_distance_km,
         duration_min = p_duration_min,
         price_excl = p_price_excl,
         vat_rate = p_vat_rate
   where id = p_ride;

  insert into public.audit_logs(entity, entity_id, action, payload)
  values ('ride', p_ride, 'ops_correct', jsonb_build_object('distance_km', p_distance_km,'duration_min', p_duration_min,'price_excl', p_price_excl,'vat_rate', p_vat_rate));
end;
$$ language plpgsql security definer;

create or replace function public.ops_close_shift(p_shift uuid, p_end timestamptz, p_pause int) returns void as $$
begin
  update public.shifts set ended_at = p_end, pause_min = coalesce(p_pause,0) where id = p_shift;
end; $$ language plpgsql security definer;

create or replace function public.ops_issue_invoice(p_ride uuid) returns uuid as $$
declare
  v_id uuid := gen_random_uuid();
  v_num text := to_char(now(), 'YYYY') || lpad((select coalesce(max((substring(number,5))::int),0)+1 from public.invoices where number like to_char(now(),'YYYY')||'%'),4,'0');
  v_excl numeric; v_vat numeric; v_incl numeric; v_rate numeric;
begin
  select price_excl, vat_rate into v_excl, v_rate from public.rides where id = p_ride;
  v_vat := round(v_excl * v_rate, 2); v_incl := v_excl + v_vat;
  insert into public.invoices(id, ride_id, debtor_type, amount_excl, vat, amount_incl, number)
  values (v_id, p_ride, 'consumer', v_excl, v_vat, v_incl, v_num);
  return v_id;
end; $$ language plpgsql security definer;
