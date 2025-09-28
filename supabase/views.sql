
create materialized view if not exists public.mv_ops_kpi as
select
  date_trunc('hour', requested_at) as bucket,
  count(*) filter (where status in ('completed')) as rides_completed,
  count(*) filter (where status in ('cancelled')) as rides_cancelled,
  avg(extract(epoch from (accepted_at - requested_at))) filter (where accepted_at is not null) as avg_dispatch_sec,
  avg(duration_min) filter (where duration_min is not null) as avg_duration_min,
  avg(eta_current_sec - eta_planned_sec) filter (where eta_current_sec is not null and eta_planned_sec is not null) as avg_delay_sec
from public.rides
where requested_at > now() - interval '30 days'
group by 1
order by 1 desc;

create view if not exists public.v_driver_status as
select d.driver_id,
       max(dl.last_seen) as last_seen,
       max(dl.online) as online,
       (now() - max(dl.last_seen)) < interval '60 seconds' as alive,
       array_agg(distinct r.status) filter (where r.status in ('accepted','started')) as active_statuses
from public.driver_locations dl
left join public.rides r on r.driver_id = dl.driver_id and r.status in ('accepted','started')
join auth.users d on d.id = dl.driver_id
group by 1;
