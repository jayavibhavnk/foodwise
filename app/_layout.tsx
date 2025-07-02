import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen 
            name="loading" 
            component={LoadingScreen}
            options={{ headerShown: false }} 
          />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="auth/onboarding" options={{ headerShown: false }} />
          </>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});