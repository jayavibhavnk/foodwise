import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { format, differenceInDays } from 'date-fns';

export interface PantryItemData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category: string;
}

interface PantryItemProps {
  item: PantryItemData;
  onUse: (id: string) => void;
}

export const PantryItem: React.FC<PantryItemProps> = ({ item, onUse }) => {
  const daysUntilExpiry = differenceInDays(item.expiryDate, new Date());
  const isExpiringSoon = daysUntilExpiry <= 3;
  const isExpired = daysUntilExpiry < 0;

  const getStatusColor = () => {
    if (isExpired) return ZaraTheme.colors.error;
    if (isExpiringSoon) return ZaraTheme.colors.warning;
    return ZaraTheme.colors.black;
  };

  const getStatusText = () => {
    if (isExpired) return 'EXPIRED';
    if (daysUntilExpiry === 0) return 'TODAY';
    if (daysUntilExpiry === 1) return '1 DAY';
    return `${daysUntilExpiry} DAYS`;
  };

  return (
    <View style={[styles.container, isExpired && styles.expiredContainer]}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.quantity}>{item.quantity} {item.unit}</Text>
      </View>
      
      <View style={styles.status}>
        <View style={styles.expiry}>
          {isExpired ? (
            <AlertCircle size={16} color={getStatusColor()} strokeWidth={1.5} />
          ) : (
            <CheckCircle size={16} color={getStatusColor()} strokeWidth={1.5} />
          )}
          <Text style={[styles.expiryText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.useButton, isExpired && styles.useButtonDisabled]} 
          onPress={() => onUse(item.id)}
          disabled={isExpired}
        >
          <Text style={[styles.useButtonText, isExpired && styles.useButtonTextDisabled]}>
            USE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...zaraStyles.card,
    marginHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiredContainer: {
    opacity: 0.6,
    borderColor: ZaraTheme.colors.lightGray,
  },
  info: {
    flex: 1,
  },
  name: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  quantity: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  status: {
    alignItems: 'flex-end',
  },
  expiry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.sm,
  },
  expiryText: {
    ...ZaraTheme.typography.caption,
    marginLeft: ZaraTheme.spacing.xs,
  },
  useButton: {
    backgroundColor: ZaraTheme.colors.black,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
  },
  useButtonDisabled: {
    backgroundColor: ZaraTheme.colors.lightGray,
  },
  useButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.white,
  },
  useButtonTextDisabled: {
    color: ZaraTheme.colors.mediumGray,
  },
});