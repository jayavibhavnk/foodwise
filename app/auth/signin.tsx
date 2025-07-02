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

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      if (!result.success) {
        Alert.alert('Sign In Failed', result.error || 'Invalid credentials');
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
          <Text style={zaraStyles.title}>SIGN IN</Text>
          <Text style={zaraStyles.subtitle}>
            Welcome back to FoodWise
          </Text>
        </View>

        <View style={styles.form}>
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
              placeholder="Enter your password"
              placeholderTextColor={ZaraTheme.colors.mediumGray}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.xl }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.linkText}>Sign up</Text>
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