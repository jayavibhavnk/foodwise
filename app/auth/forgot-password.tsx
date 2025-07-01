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
import { authService } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(email.trim());
      if (result.success) {
        Alert.alert(
          'Reset Link Sent',
          'If an account with this email exists, you will receive a password reset link.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset link');
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
          <Text style={zaraStyles.title}>RESET PASSWORD</Text>
          <Text style={zaraStyles.subtitle}>
            Enter your email to receive a reset link
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

          <TouchableOpacity 
            style={[zaraStyles.button, { marginTop: ZaraTheme.spacing.xl }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>SEND RESET LINK</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
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