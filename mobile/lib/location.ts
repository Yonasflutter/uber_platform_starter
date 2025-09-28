
import * as Location from 'expo-location';
import { supabase } from './supabase';

export async function ensurePermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Locatie-permissie geweigerd');
}

export async function startDriverHeartbeat(driverId: string) {
  await Location.requestBackgroundPermissionsAsync();
  return Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 25 },
    async ({ coords }) => {
      const { latitude, longitude, speed, heading } = coords;
      await supabase.from('driver_locations').upsert({
        driver_id: driverId,
        geom: `SRID=4326;POINT(${longitude} ${latitude})`,
        speed, heading, last_seen: new Date().toISOString(), online: true,
      });
    }
  );
}

export async function setDriverOnline(driverId: string, online: boolean) {
  await supabase.from('driver_locations').upsert({ driver_id: driverId, online });
}
