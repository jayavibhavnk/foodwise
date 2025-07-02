import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ZaraTheme } from '@/styles/zaraTheme';

export default function InitialScreen() {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
      </View>
    );
  }

  // Handle navigation based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/auth/welcome" />;
  }

  // Check if user needs to complete onboarding
  if (user && (!user.age || !user.gender || !user.height || !user.weight)) {
    return <Redirect href="/auth/onboarding" />;
  }

  // User is authenticated and onboarded, go to main app
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ZaraTheme.colors.white,
  },
});