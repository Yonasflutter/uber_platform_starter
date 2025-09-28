
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { supabase } from '../../lib/supabase';
export default function RequestRide() {
  const [pickup, setPickup] = useState('Dam, Amsterdam');
  const [dropoff, setDropoff] = useState('Schiphol');
  async function createRide() {
    const { data: userData } = await supabase.auth.getUser();
    const rider_id = userData.user?.id;
    const { data, error } = await supabase.from('rides').insert({
      rider_id,
      pickup_geo: 'SRID=4326;POINT(4.895 52.373)',
      dropoff_geo: 'SRID=4326;POINT(4.768 52.310)'
    }).select().single();
    if (error) return Alert.alert('Fout', error.message);
    Alert.alert('Aangevraagd', `Ride ${data.id}`);
  }
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Vertrek</Text>
      <TextInput value={pickup} onChangeText={setPickup} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Bestemming</Text>
      <TextInput value={dropoff} onChangeText={setDropoff} style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Aanvragen" onPress={createRide} />
    </View>
  );
}
