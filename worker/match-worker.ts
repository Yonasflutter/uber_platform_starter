
export interface Env { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string; }
export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    if (url.pathname !== '/match' || req.method !== 'POST') return new Response('Not found', { status: 404 });
    const body = await req.json(); // { ride_id, pickup: {lon,lat} }
    const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/find_nearest_driver`, {
      method: 'POST',
      headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ lon: body.pickup.lon, lat: body.pickup.lat })
    });
    const [driver] = await resp.json();
    if (!driver) return new Response(JSON.stringify({ ok: false, reason: 'no-drivers' }), { headers: { 'content-type': 'application/json' } });
    await fetch(`${env.SUPABASE_URL}/rest/v1/rides?id=eq.${body.ride_id}`, {
      method: 'PATCH',
      headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'offered', driver_id: driver.driver_id })
    });
    return new Response(JSON.stringify({ ok: true, driver }), { headers: { 'content-type': 'application/json' } });
  }
}
