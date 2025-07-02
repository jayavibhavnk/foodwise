import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Scan, ChefHat } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Sparkles size={32} color={ZaraTheme.colors.black} strokeWidth={1.5} />
              </View>
              <Text style={styles.logo}>FOODWISE</Text>
            </View>
            
            <Text style={styles.tagline}>
              Transform your relationship with food through AI-powered nutrition tracking
            </Text>
          </View>

          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Scan size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Food Scanning</Text>
                <Text style={styles.featureDescription}>
                  Instantly analyze nutrition from photos with AI precision
                </Text>
              </View>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <ChefHat size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Personalized Recipes</Text>
                <Text style={styles.featureDescription}>
                  Get custom recipes based on your pantry and goals
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
            >
              <Text style={styles.secondaryButtonText}>Already have an account?</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <Text style={styles.trustText}>✓ No credit card required</Text>
            <Text style={styles.trustText}>✓ Privacy-first approach</Text>
            <Text style={styles.trustText}>✓ Works offline</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: ZaraTheme.spacing.xl,
    paddingBottom: ZaraTheme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.lg,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ZaraTheme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  logo: {
    ...ZaraTheme.typography.h1,
    fontSize: 28,
    letterSpacing: 2,
  },
  tagline: {
    ...ZaraTheme.typography.bodySmall,
    textAlign: 'center',
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  heroImageContainer: {
    height: height * 0.25,
    marginBottom: ZaraTheme.spacing.xl,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  features: {
    marginBottom: ZaraTheme.spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ZaraTheme.spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ZaraTheme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ZaraTheme.spacing.md,
  },
  featureContent: {
    flex: 1,
    paddingTop: ZaraTheme.spacing.xs,
  },
  featureTitle: {
    ...ZaraTheme.typography.body,
    fontWeight: '500',
    marginBottom: ZaraTheme.spacing.xs,
  },
  featureDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
  },
  actions: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: ZaraTheme.colors.black,
    paddingVertical: ZaraTheme.spacing.lg,
    paddingHorizontal: ZaraTheme.spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.white,
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: ZaraTheme.spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    textDecorationLine: 'underline',
  },
  trustIndicators: {
    alignItems: 'center',
    paddingBottom: ZaraTheme.spacing.lg,
  },
  trustText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    marginBottom: ZaraTheme.spacing.xs,
  },
});