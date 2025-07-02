import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Chrome as Home, ScanLine, Package, ChefHat, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Home size={20} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ size, color }) => (
            <ScanLine size={20} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ size, color }) => (
            <Package size={20} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ size, color }) => (
            <ChefHat size={20} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={20} color={color} strokeWidth={1.5} />
          ),
        }}
      />
    </Tabs>
  );
}