import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, name.trim());
      if (result.success) {
        router.push('/auth/onboarding');
      } else {
        Alert.alert('Sign Up Failed', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={zaraStyles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={zaraStyles.title}>CREATE ACCOUNT</Text>
          <Text style={zaraStyles.subtitle}>
            Join FoodWise today
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={zaraStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={zaraStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={zaraStyles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              style={zaraStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.xl }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: ZaraTheme.spacing.sm,
    marginBottom: ZaraTheme.spacing.lg,
  },
  header: {
    marginBottom: ZaraTheme.spacing.xxl,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ZaraTheme.spacing.xl,
  },
  footerText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
  },
  linkText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.black,
    textDecorationLine: 'underline',
  },
});