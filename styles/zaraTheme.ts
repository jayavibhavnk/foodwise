import { StyleSheet } from 'react-native';

export const ZaraTheme = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    gray: '#f5f5f5',
    darkGray: '#333333',
    lightGray: '#e5e5e5',
    mediumGray: '#999999',
    accent: '#000000',
    success: '#000000',
    warning: '#000000',
    error: '#000000',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '300' as const,
      letterSpacing: -1,
      color: '#000000',
    },
    h2: {
      fontSize: 24,
      fontWeight: '300' as const,
      letterSpacing: -0.5,
      color: '#000000',
    },
    h3: {
      fontSize: 20,
      fontWeight: '400' as const,
      letterSpacing: -0.3,
      color: '#000000',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
      color: '#000000',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0,
      color: '#666666',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      letterSpacing: 0.5,
      color: '#666666',
      textTransform: 'uppercase' as const,
    },
    button: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export const zaraStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  safeArea: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  header: {
    paddingTop: ZaraTheme.spacing.xxl,
    paddingBottom: ZaraTheme.spacing.lg,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  title: {
    ...ZaraTheme.typography.h1,
    marginBottom: ZaraTheme.spacing.xs,
  },
  subtitle: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  card: {
    backgroundColor: ZaraTheme.colors.white,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    marginBottom: ZaraTheme.spacing.md,
    padding: ZaraTheme.spacing.lg,
  },
  button: {
    backgroundColor: ZaraTheme.colors.black,
    paddingVertical: ZaraTheme.spacing.md,
    paddingHorizontal: ZaraTheme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ZaraTheme.colors.black,
  },
  buttonOutline: {
    backgroundColor: ZaraTheme.colors.white,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.black,
    paddingVertical: ZaraTheme.spacing.md,
    paddingHorizontal: ZaraTheme.spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.white,
  },
  buttonTextOutline: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.black,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.black,
    paddingVertical: ZaraTheme.spacing.md,
    ...ZaraTheme.typography.body,
  },
  divider: {
    height: 1,
    backgroundColor: ZaraTheme.colors.lightGray,
    marginVertical: ZaraTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});