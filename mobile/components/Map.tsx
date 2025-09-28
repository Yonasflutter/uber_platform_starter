
import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { View } from 'react-native';
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');
export default function Map({ center }: { center?: [number, number] }) {
  return (
    <View style={{ flex: 1 }}>
      <MapboxGL.MapView style={{ flex: 1 }}>
        <MapboxGL.Camera zoomLevel={12} centerCoordinate={center ?? [4.9041, 52.3676]} />
      </MapboxGL.MapView>
    </View>
  );
}
