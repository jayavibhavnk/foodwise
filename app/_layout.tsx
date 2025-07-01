import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  useFrameworkReady();
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return null; // Show loading screen while checking auth
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
          </>
        ) : !user?.onboardingCompleted ? (
          <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="calendar" options={{ headerShown: false }} />
            <Stack.Screen name="add-food" options={{ headerShown: false }} />
            <Stack.Screen name="add-grocery" options={{ headerShown: false }} />
            <Stack.Screen name="meal-planner" options={{ headerShown: false }} />
            <Stack.Screen name="custom-dishes" options={{ headerShown: false }} />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}