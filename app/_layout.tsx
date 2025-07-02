import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return null; // or return a loading component
  }

  // Handle redirects declaratively
  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  if (user && !user.onboardingCompleted) {
    return <Redirect href="/auth/onboarding" />;
  }

  if (user && user.onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="add-food" options={{ headerShown: false }} />
        <Stack.Screen name="add-grocery" options={{ headerShown: false }} />
        <Stack.Screen name="meal-planner" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" options={{ headerShown: false }} />
        <Stack.Screen name="custom-dishes" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}