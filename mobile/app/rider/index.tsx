
import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import Map from '../../components/Map';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
export default function RiderHome() {
  const [coord, setCoord] = useState<[number, number]>();
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        setCoord([pos.coords.longitude, pos.coords.latitude]);
      }
    })();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Map center={coord} />
      <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
        <Button title="Nieuwe rit" onPress={() => router.push('/rider/request')} />
      </View>
    </View>
  );
}
