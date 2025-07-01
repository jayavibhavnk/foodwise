import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>FOODWISE</Text>
          <Text style={styles.tagline}>
            AI-powered nutrition and grocery management
          </Text>
        </View>

        <View style={styles.hero}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Smart Food Scanning</Text>
            <Text style={styles.featureDescription}>
              Instantly analyze nutrition from photos
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>Pantry Management</Text>
            <Text style={styles.featureDescription}>
              Track groceries and expiry dates
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>AI Recipe Generation</Text>
            <Text style={styles.featureDescription}>
              Get personalized recipes from your pantry
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={zaraStyles.button} 
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={zaraStyles.buttonText}>GET STARTED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[zaraStyles.buttonOutline, { marginTop: ZaraTheme.spacing.md }]}
            onPress={() => router.push('/auth/signin')}
          >
            <Text style={zaraStyles.buttonTextOutline}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: ZaraTheme.spacing.xxl,
    paddingBottom: ZaraTheme.spacing.xl,
  },
  logo: {
    ...ZaraTheme.typography.h1,
    fontSize: 36,
    marginBottom: ZaraTheme.spacing.sm,
  },
  tagline: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
  },
  hero: {
    height: 200,
    marginBottom: ZaraTheme.spacing.xl,
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  feature: {
    marginBottom: ZaraTheme.spacing.xl,
  },
  featureTitle: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.sm,
  },
  featureDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: ZaraTheme.spacing.xl,
  },
});