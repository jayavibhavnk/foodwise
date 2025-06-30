import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Key, ExternalLink, User, Target, Bell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { geminiService } from '@/services/geminiService';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedKey = await AsyncStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
        setIsKeyValid(geminiService.isInitialized());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Invalid Input', 'Please enter your Gemini API key.');
      return;
    }

    setTesting(true);
    
    try {
      const isValid = await geminiService.setApiKey(apiKey.trim());
      
      if (isValid) {
        setIsKeyValid(true);
        Alert.alert(
          'Success',
          'API key configured successfully! You can now use AI-powered features.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invalid API Key',
          'The API key you entered is not valid. Please check and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Configuration Error',
        'Failed to configure API key. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setTesting(false);
    }
  };

  const openGoogleAIStudio = () => {
    Linking.openURL('https://ai.google.dev/');
  };

  const clearApiKey = () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to remove your API key? This will disable AI features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('gemini_api_key');
              setApiKey('');
              setIsKeyValid(false);
            } catch (error) {
              console.error('Failed to clear API key:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={zaraStyles.safeArea}>
        <View style={zaraStyles.centerContent}>
          <ActivityIndicator size="large" color={ZaraTheme.colors.black} />
          <Text style={[ZaraTheme.typography.bodySmall, { marginTop: ZaraTheme.spacing.md }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <ScrollView style={zaraStyles.container} showsVerticalScrollIndicator={false}>
        <View style={zaraStyles.header}>
          <Text style={zaraStyles.title}>SETTINGS</Text>
          <Text style={zaraStyles.subtitle}>
            Configure your app preferences
          </Text>
        </View>

        {/* AI Configuration */}
        <MinimalCard>
          <View style={styles.sectionHeader}>
            <Key size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={styles.sectionTitle}>AI CONFIGURATION</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Configure Google Gemini AI to enable food scanning, recipe generation, and nutrition analysis.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={zaraStyles.input}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              multiline={false}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[zaraStyles.button, styles.configButton]}
              onPress={validateAndSaveApiKey}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
              ) : (
                <Text style={zaraStyles.buttonText}>
                  {isKeyValid ? 'UPDATE KEY' : 'SAVE KEY'}
                </Text>
              )}
            </TouchableOpacity>

            {isKeyValid && (
              <TouchableOpacity
                style={[zaraStyles.buttonOutline, styles.clearButton]}
                onPress={clearApiKey}
              >
                <Text style={zaraStyles.buttonTextOutline}>CLEAR</Text>
              </TouchableOpacity>
            )}
          </View>

          {isKeyValid && (
            <View style={styles.statusIndicator}>
              <Text style={styles.successText}>✓ AI features enabled</Text>
            </View>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={openGoogleAIStudio}>
            <ExternalLink size={16} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
            <Text style={styles.linkText}>
              Get your free API key from Google AI Studio
            </Text>
          </TouchableOpacity>
        </MinimalCard>

        {/* Profile Settings */}
        <MinimalCard>
          <View style={styles.sectionHeader}>
            <User size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={styles.sectionTitle}>PROFILE</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Personal Information</Text>
            <Text style={styles.settingValue}>Age, Gender, Activity Level</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dietary Preferences</Text>
            <Text style={styles.settingValue}>Restrictions, Allergies</Text>
          </TouchableOpacity>
        </MinimalCard>

        {/* Nutrition Goals */}
        <MinimalCard>
          <View style={styles.sectionHeader}>
            <Target size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={styles.sectionTitle}>NUTRITION GOALS</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Daily Calorie Target</Text>
            <Text style={styles.settingValue}>2000 cal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Macro Distribution</Text>
            <Text style={styles.settingValue}>Protein, Carbs, Fat</Text>
          </TouchableOpacity>
        </MinimalCard>

        {/* Notifications */}
        <MinimalCard>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Meal Reminders</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Expiry Alerts</Text>
            <Text style={styles.settingValue}>1 day before</Text>
          </TouchableOpacity>
        </MinimalCard>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>FoodWise</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            AI-powered nutrition and grocery management
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginLeft: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  sectionDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
    marginBottom: ZaraTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configButton: {
    flex: 1,
    marginRight: ZaraTheme.spacing.sm,
  },
  clearButton: {
    paddingHorizontal: ZaraTheme.spacing.lg,
  },
  statusIndicator: {
    marginTop: ZaraTheme.spacing.md,
    alignItems: 'center',
  },
  successText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
  },
  linkText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    marginLeft: ZaraTheme.spacing.sm,
    textDecorationLine: 'underline',
  },
  settingItem: {
    paddingVertical: ZaraTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
  },
  settingLabel: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  settingValue: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.xl,
  },
  appName: {
    ...ZaraTheme.typography.h2,
    marginBottom: ZaraTheme.spacing.xs,
  },
  appVersion: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    marginBottom: ZaraTheme.spacing.sm,
  },
  appDescription: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
  },
});