import React from 'react';
import { TouchableOpacity, Text, Linking, StyleSheet, Platform } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { ZaraTheme } from '@/styles/zaraTheme';

interface BoltBadgeProps {
  variant?: 'light' | 'dark';
  position?: 'topRight' | 'bottomRight';
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  variant = 'dark', 
  position = 'topRight' 
}) => {
  const handlePress = async () => {
    try {
      await Linking.openURL('https://bolt.new/');
    } catch (error) {
      console.error('Failed to open Bolt.new:', error);
    }
  };

  const isDark = variant === 'dark';
  const positionStyle = position === 'topRight' ? styles.topRight : styles.bottomRight;

  return (
    <TouchableOpacity 
      style={[
        styles.badge, 
        positionStyle,
        isDark ? styles.darkBadge : styles.lightBadge
      ]} 
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel="Built with Bolt.new"
      accessibilityRole="button"
    >
      <ExternalLink 
        size={12} 
        color={isDark ? ZaraTheme.colors.white : ZaraTheme.colors.black} 
        strokeWidth={2} 
      />
      <Text style={[
        styles.badgeText,
        isDark ? styles.darkText : styles.lightText
      ]}>
        BOLT.NEW
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  topRight: {
    top: 60,
    right: 20,
  },
  bottomRight: {
    bottom: 100,
    right: 20,
  },
  darkBadge: {
    backgroundColor: ZaraTheme.colors.black,
    borderColor: ZaraTheme.colors.black,
  },
  lightBadge: {
    backgroundColor: ZaraTheme.colors.white,
    borderColor: ZaraTheme.colors.black,
  },
  badgeText: {
    ...ZaraTheme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  darkText: {
    color: ZaraTheme.colors.white,
  },
  lightText: {
    color: ZaraTheme.colors.black,
  },
});