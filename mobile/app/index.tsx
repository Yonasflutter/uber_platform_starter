
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '../lib/auth';
export default function Landing() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'rider'|'driver'>('rider');
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Welkom</Text>
      <TextInput placeholder="email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Rijder" onPress={() => setRole('rider')} />
        <Button title="Chauffeur" onPress={() => setRole('driver')} />
      </View>
      <Button title="Magic link" onPress={async () => { await signIn(email); }} />
      <Button title="Ga verder" onPress={() => router.push(role === 'rider' ? '/rider' : '/driver')} />
    </View>
  );
}
