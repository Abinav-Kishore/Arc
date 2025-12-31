import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as ArcThemeProvider } from '@/src/lib/theme';
import { StudentProvider } from '@/src/lib/student-context';
import { PermissionsProvider } from '@/src/lib/permissions-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ArcThemeProvider>
      <StudentProvider>
        <PermissionsProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="login">
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="student" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="leetcode" options={{ headerShown: false }} />
              <Stack.Screen name="skillrack" options={{ headerShown: false }} />
              <Stack.Screen name="codeforces" options={{ headerShown: false }} />
              <Stack.Screen name="codechef" options={{ headerShown: false }} />
              <Stack.Screen name="github" options={{ headerShown: false }} />
              <Stack.Screen name="linkedin" options={{ headerShown: false }} />
              <Stack.Screen name="resume" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PermissionsProvider>
      </StudentProvider>
    </ArcThemeProvider>
  );
}
