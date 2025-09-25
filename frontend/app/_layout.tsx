import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
            
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="eventos" options={{ headerShown: false }} />
      <Stack.Screen name="geradores" options={{ headerShown: false }} />
    </Stack>
  );
}