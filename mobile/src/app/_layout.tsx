import { DotGothic16_400Regular, useFonts } from '@expo-google-fonts/dotgothic16';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { StoreProvider } from '@/storage/store';
import { colors } from '@/ui/theme';
import { ToastProvider } from '@/ui/Toast';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ DotGothic16_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <StoreProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </ToastProvider>
    </StoreProvider>
  );
}
