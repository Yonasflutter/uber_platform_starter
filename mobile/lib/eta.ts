
export async function getETASeconds(origin: [number, number], destination: [number, number]) {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null; // Optional: skip when using open-source routing
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=false&geometries=geojson&overview=false&annotations=duration&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const seconds = json?.routes?.[0]?.duration ?? null;
  return seconds ? Math.round(seconds) : null;
}
