
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { startDriverHeartbeat, setDriverOnline } from '../../lib/location';
import { useRouter } from 'expo-router';
export default function DriverHome() {
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    let watcher: any;
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      if (online) {
        watcher = await startDriverHeartbeat(user.id);
        await setDriverOnline(user.id, true);
      } else {
        await setDriverOnline(user.id, false);
        if (watcher) watcher.remove();
      }
    })();
  }, [online]);
  useEffect(() => {
    const channel = supabase
      .channel('rides-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, payload => {
        setRides(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Online</Text>
        <Switch value={online} onValueChange={setOnline} />
      </View>
      {rides.map(r => (
        <Pressable key={r.id} onPress={() => router.push({ pathname: '/driver/ride', params: { id: r.id } })}>
          <Text style={{ paddingVertical: 12 }}>Rit #{r.id.slice(0,8)}</Text>
        </Pressable>
      ))}
    </View>
  );
}
