import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { zaraStyles } from '@/styles/zaraTheme';

interface MinimalCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MinimalCard: React.FC<MinimalCardProps> = ({ 
  children, 
  onPress, 
  style 
}) => {
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[zaraStyles.card, style]} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[zaraStyles.card, style]}>
      {children}
    </View>
  );
};