
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Location from 'expo-location';
import { getETASeconds } from '../../lib/eta';

export default function DriverRide() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<any>();
  const [etaMin, setEtaMin] = useState<number|null>(null);
  const intervalRef = useRef<any>(null);

  async function load() {
    const { data, error } = await supabase.from('rides').select('*').eq('id', id).single();
    if (error) return Alert.alert('Fout', error.message);
    setRide(data);
  }
  useEffect(() => { load(); }, []);

  async function accept() {
    const user = (await supabase.auth.getUser()).data.user!;
    let baseline: number | null = null;
    try {
      const pos = await Location.getCurrentPositionAsync({});
      if (ride?.dropoff_geo) {
        const m = /POINT\(([-0-9.]+) ([-0-9.]+)\)/.exec(ride.dropoff_geo);
        if (m) baseline = await getETASeconds([pos.coords.longitude, pos.coords.latitude],[parseFloat(m[1]), parseFloat(m[2])]);
      }
    } catch {}
    const { error } = await supabase.from('rides').update({
      status: 'accepted', driver_id: user.id, accepted_at: new Date().toISOString(),
      eta_planned_sec: baseline ?? null, eta_current_sec: baseline ?? null, eta_updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) return Alert.alert('Fout', error.message);
    load();
  }
  async function start() {
    const { error } = await supabase.from('rides').update({ status: 'started', started_at: new Date().toISOString() }).eq('id', id);
    if (error) return Alert.alert('Fout', error.message);
    load();
  }
  async function complete() {
    const { error } = await supabase.from('rides').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', id);
    if (error) return Alert.alert('Fout', error.message);
    clearInterval(intervalRef.current);
    load();
  }

  useEffect(() => {
    if (!ride || !['accepted','started'].includes(ride.status)) { return; }
    async function tick() {
      try {
        const pos = await Location.getCurrentPositionAsync({});
        const m = /POINT\(([-0-9.]+) ([-0-9.]+)\)/.exec(ride.dropoff_geo);
        if (!m) return;
        const sec = await getETASeconds([pos.coords.longitude, pos.coords.latitude],[parseFloat(m[1]), parseFloat(m[2])]);
        if (sec) {
          setEtaMin(Math.ceil(sec/60));
          await supabase.from('rides').update({ eta_current_sec: sec, eta_updated_at: new Date().toISOString() }).eq('id', ride.id);
        }
      } catch {}
    }
    tick();
    intervalRef.current = setInterval(tick, 90000); // elke 90s
    return () => clearInterval(intervalRef.current);
  }, [ride?.status]);

  const delayMin = ride?.eta_planned_sec && etaMin ? Math.max(0, Math.ceil(etaMin - ride.eta_planned_sec/60)) : 0;

  if (!ride) return null;
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Ride {ride.id}</Text>
      <Text>Status: {ride.status}</Text>
      {typeof etaMin === 'number' && (
        <Text style={{ fontSize: 18 }}>ETA: {etaMin} min {delayMin>0 ? `(vertraging +${delayMin} min)` : ''}</Text>
      )}
      {ride.status === 'requested' && <Button title="Accepteren" onPress={accept} />}
      {ride.status === 'accepted' && <Button title="Start rit" onPress={start} />}
      {ride.status === 'started' && <Button title="Afronden" onPress={complete} />}
    </View>
  );
}
